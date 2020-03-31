#!/usr/bin/env python3

# included modules
import json
import math
import os
import sys
import time
from urllib.parse import urlparse
from xml.sax import SAXParseException

import requests
# pip modules
from PIL import Image, ImageFile

import articleToDB
# local modules
import log
from articleparser import parsefile

CA_DOMAIN = "https://chroniclingamerica.loc.gov"
ImageFile.LOAD_TRUNCATED_IMAGES = True
log.verbosity = (log.DEBUG if '-v' in sys.argv or '--verbose' in sys.argv
                 else log.WARN if '-q' in sys.argv or '--quiet' in sys.argv
else log.INFO)


def poll_fetch(url):
    """repeatedly try to fetch file, sleeping for 5 seconds in-between"""
    attempt = 0
    while attempt < 10:
        response = requests.get(url)
        if response.status_code == 200:
            return response
        log.error("Error fetching '{}'. Attempts: {}".format(os.path.basename(urlparse(url).path), attempt + 1))
        log.info("Trying again... (cooldown: {} sec)".format(5 * attempt))
        time.sleep(5 * attempt)
        attempt += 1
    return None


def fetch_batch(batch):
    metadata = {}
    batch_url = CA_DOMAIN + "/batches/" + batch + ".json"

    # fetch individual batch json
    batch = poll_fetch(batch_url)
    if batch is None:
        log.warn("Could not fetch batch. Skipping.")
        return
    batch_json = batch.json()

    log.info('Issues: ' + str(len(batch_json['issues'])))
    log.info('Pages: ' + str(batch_json['page_count']))
    log.indent()

    for issue in batch_json['issues']:
        metadata['newspaper'] = issue['title']['name']
        metadata['publication_date'] = issue['date_issued']

        log.info('Issue {}/{}: "{}", {}'.format(
            batch_json['issues'].index(issue) + 1,
            len(batch_json['issues']),
            metadata['newspaper'],
            metadata['publication_date']
        ))

        # fetch title json for publisher and location data
        title = poll_fetch(issue['title']['url'])
        if title is None:
            log.warn("Could not fetch title information. Skipping.")
            continue
        title_json = title.json()

        metadata['publisher'] = title_json['publisher']
        place = title_json['place'][0].split('--')
        metadata['state'] = place[0]
        metadata['city'] = place[-1]

        # fetch json for newspaper issue
        issue = poll_fetch(issue['url'])
        if issue is None:
            log.warn("Could not fetch issue JSON. Skipping.")
            continue
        issue_json = issue.json()

        # sort pages by sequence number, just in case
        issue_json['pages'].sort(key=lambda page: page['sequence'])

        log.info('Saving {} pages at ./{}'.format(
            len(issue_json['pages']),
            os.path.splitext(urlparse(issue_json['url']).path[1:])[0]
        ))
        log.indent()

        for page in issue_json['pages']:
            log.info("Processing page {} ...".format(page['sequence']))

            # fetch json for single page
            page = poll_fetch(page['url'])
            if page is None:
                log.warn("Could not fetch page JSON. Skipping.")
                continue
            page_json = page.json()

            metadata['source_link'] = page_json['pdf']

            log.debug("Metadata: {")
            log.indent()
            for key in metadata:
                log.debug("'{}': '{}'".format(key, metadata[key]))
            log.dedent()
            log.debug("}")

            # parse ocr url and get its path component only
            path = os.path.dirname(urlparse(page_json['ocr']).path[1:])
            root = os.getcwd()

            os.makedirs(path, exist_ok=True)
            os.chdir(path)

            # save metadata.json; SHOULD work
            with open('metadata.json', 'w') as file:
                file.write(json.dumps(metadata, sort_keys=True, indent=4))

            # save ocr.xml
            try:
                with open('ocr.xml', 'w', encoding='utf-8') as file:
                    ocr = poll_fetch(page_json['ocr'])
                    if ocr is None:
                        log.warn("Could not fetch ALTO file. Skipping.")
                        for file in os.listdir():
                            os.remove(file)
                        os.chdir(root)
                        os.removedirs(path)
                        continue
                    file.write(ocr.text)
                    log.debug("OCR file: ./" + path + "/ocr.xml")
            except Exception as e:
                # skip to the next page
                log.warn("OCR file not found: {}".format(e))
                os.remove('ocr.xml')
                os.remove('metadata.json')
                os.chdir(root)
                os.removedirs(path)
                continue

            if '--annotate' in sys.argv:
                try:
                    # save scan.jp2
                    data = requests.get(page_json['jp2'], stream=True)
                    if data.status_code == 200:
                        with open('scan.jp2', 'wb') as file:
                            for chunk in data:
                                file.write(chunk)
                        log.debug("Image scan: ./" + path + "/scan.jp2")
                    else:
                        log.warn("Failed to get image scan. Skipping.")
                except Exception as e:
                    log.error("Could not get image: {}".format(e))
                    log.warn("Skipping annotation stage for this page.")

            handle_page()

            # log.info("Cleaning up...")
            for file in os.listdir():
                os.remove(file)
            os.chdir(root)
            os.removedirs(path)

        log.info()
        log.dedent()

    log.dedent()
    log.info("Done fetching batch " + batch)


def handle_page():
    # log.info("Parsing ALTO file...")

    # in case server gives an HTTP 200 response with invalid data, try
    # to detect it at parse time.
    try:
        alto = parsefile('ocr.xml')
    except SAXParseException as e:
        log.error("Invalid XML found. Maybe site is down?")
        return

    if alto is None:
        log.warn("Non-conforming ALTO file found. Skipping.")
        return

    # show font info for page
    log.debug("Fonts:")
    log.indent()
    for name, font in alto.fonts.items():
        log.debug("{:<6}: {}".format(name, font))
    log.dedent()

    # log.info("Finding articles...")
    find_articles(alto)

    if '--annotate' in sys.argv and 'scan.jp2' in os.listdir():
        log.info("Opening image file...")
        scan = Image.open('scan.jp2').convert('RGB')

        # annotate image with articles
        with open('articles.json') as articles:
            annotate_page(scan, alto.page.size, json.load(articles))

        # save and finish
        scan.save('annotated_scan.jpg')
        scan.close()

    # insert into database
    try:
        articleToDB.putArticlesInDatabase(commitIn=1)
    except Exception as e:
        # if database insertion fails, quit completely.
        # have user restart process where it failed with
        # `--start` option.
        log.error("Database error: {}".format(e))
        for file in os.listdir():
            os.remove(file)
        raise e


def find_articles(alto):
    """finds articles in page and stores them in `articles.json`"""
    articles = []

    def article(block):
        return {
            'start': block.pos,
            'end': (block.right, block.bottom),
            'lang': block.lang,
            'title': str(block.lines[0]),
            'content': '\n'.join([str(line) for line in block.lines[1:]])
        }

    for block in alto.page.blocks:
        # ensure minimum of title and 2 lines of content for article
        if len(block.lines) >= 3:
            articles.append(article(block))

    log.debug("Articles found: {}".format(len(articles)))
    with open('articles.json', 'w') as file:
        json.dump(articles, file, indent=4)


def annotate_page(scan, size, articles):
    scan_px = scan.load()

    log.debug("Image size: {} x {}".format(scan.size[0], scan.size[1]))
    log.debug("Page size: {} x {}".format(int(size[0]), int(size[1])))

    # the image size is not the same as the page size,
    # so we must calculate how different it is.
    fx = size[0] / scan.size[0]
    fy = size[1] / scan.size[1]

    log.debug("Scale factors: " + str((fx, fy)))

    log.info("Annotating scan...")

    # indicate elements
    log.debug("Drawing the following elements:")
    log.indent()

    # color all articles
    RED = (255, 0, 0)
    for article in articles:
        left = math.floor(article['start'][0] / fx)
        right = math.ceil(article['end'][0] / fx)
        top = math.floor(article['start'][1] / fy)
        bottom = math.ceil(article['end'][1] / fy)

        log.debug("Rectangle[{:>4} + {:>4}, {:>4} + {:>4}]".format(
            left, right - left,
            bottom, bottom - top,
        ))

        # margins are marked in solid red
        # top and bottom
        for i in range(left, right):
            scan_px[i, top] = RED
            scan_px[i, bottom - 1] = RED
        # left and right
        for i in range(top, bottom):
            scan_px[left, i] = RED
            scan_px[right - 1, i] = RED

        # color the inside of the block yellow
        for i in range(left + 1, right):
            for j in range(top + 1, bottom):
                scan_px[i, j] = (
                    min(255, scan_px[i, j][0] + 40),
                    min(255, scan_px[i, j][1] + 40),
                    scan_px[i, j][2]
                )

    log.dedent()


# order of things:
# 1. fetch batch list
# 2. fetch next individual batch
# 3. fetch all pages in batch and save their data locally
# 4. run parser and annotate images (if told)
# 5. extract articles and insert in database
# 6. delete batch directory, goto 2

if __name__ == "__main__":
    batches_page_json = None
    start_page = 1

    if '--start' in sys.argv:
        idx = sys.argv.index('--start') + 1
        if idx >= len(sys.argv) or sys.argv[idx][:1] == '-':
            log.error("No batch page number given after `--start` argument")
            sys.exit(2)
        start_page = int(sys.argv[idx])

    batch_page_url = CA_DOMAIN + "/batches/" + str(start_page) + ".json"

    log.info("Fetching batch list")
    # the only code in the whole script that will stop on a network
    # error. ensures that people double-check their connection.
    try:
        batches_page_json = requests.get(batch_page_url).json()
    except:
        log.warn("Can't fetch batch list right now. Perhaps site is down?")
        log.warn("Please try again later.")
        sys.exit(1)

    try:
        while True:
            log.info("Batch page: {}".format(start_page))
            log.indent()
            for batch_info in batches_page_json['batches']:
                log.info('Batch: ' + batch_info['name'])
                fetch_batch(batch_info['name'])
            log.dedent()
            try:
                batches_page_json = poll_fetch(batches_page_json['next']).json()
            except KeyError:
                log.info("Congratulations! You've reached the end!!!")
                break
    except KeyboardInterrupt:
        print("")
        log.level = 0
    log.info("Stopping script.")
