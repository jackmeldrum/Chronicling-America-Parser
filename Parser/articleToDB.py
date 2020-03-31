import datetime
import json
import os
import time

import mysql.connector
import requests

import log

import geocoder

# Input: database connection and article data
# Returns whether article was found in DB.
def checkDatabaseForArticle(mydb, article):
    # query build
    mycursor = mydb.cursor()
    sqlSelect = "SELECT title, article_text FROM CAP.articles WHERE title = %s AND article_text = %s"
    val = (article['title'], article['content'])
    mycursor.execute(sqlSelect,val)
    myResult = mycursor.fetchall()
    
    # If article already exists in database, returns True, else returns False
    return len(myResult) > 0


# Gets article metadata from metadata.json and article content from articles.json
# Puts metadata and content into database
# Uses openstreetmap api to get latitude and longitude for city - NEEDS INTERNET CONNECTION TO WORK
# By default will insert each article into DB
# Needs to be run in directory where metadata.json and articles.json exist
# INPUT - input=0: no DB insert, prints # of articles parsed. input=2: no DB insert and prints title of each article. no input: inserts into DB
# Before inserting into DB it will check if the first artcle of page already exists in DB. If it does, it will exit and return 0. Otherwse, will insert all articles and return 1
def putArticlesInDatabase(commitIn):
    # article metadata in metadata.json and article content in articles.json
    
    def poll_fetch(url):
        """repeatedly try to fetch file, sleeping for 5 seconds in-between"""
        attempt = 0
        while attempt < 10:
            response = requests.get(url)
            if response.status_code == 200:
                return response
            log.error("Error fetching '{}': {}".format(basename(urlparse(url).path), e))
            log.info("Trying again... (attempts: {}, cooldown: {} sec)".format(attempt + 1, 5 * attempt))
            time.sleep(5 * attempt)
            attempt += 1
        return None
    
    # read metadata file 
    with open('metadata.json', 'r') as myfile:
        data=myfile.read()
    article_metadata = json.loads(data)
    
    # read article content file
    with open('articles.json','r') as myfile:
        data2=myfile.read()
    articles = json.loads(data2)
    
    # no articles to insert; return early
    if len(articles) == 0:
        return 0
    
    # gets latitude and longitude from GeoNames

    geoInfo = {'lat': 0.0,'lon': 0.0}

    if(commitIn == 1):
        attempt = 0
        place = article_metadata['city'] + " , " + article_metadata['state']

        userList = ['aresiii', 'iburch', 'Jack_CAP', 'iwasaskedtomakethis']
        counter = 0

        for i in range(10):
            try:
                g = geocoder.geonames(place, country='US', key = userList[counter])
            except:
                log.error("Could not fetch coordinates.")
                log.info("Trying again... (attempts: {}, cooldown: {} sec)".format(attempt + 1, 5 * attempt))
                time.sleep(5 * attempt)
                attempt += 1
                counter = (counter + 1) % len(mylist)
            else:
                geoInfo['lat'] = g.lat
                geoInfo['lon'] = g.lng
                break

        if attempt == 10:
            log.warn("Giving up and using (0.0, 0.0) as coordinates.")

    # connect to mysql database "chronicles"
    if(commitIn == 1):
        mydb = mysql.connector.connect(
            host="db-mysql-cap.cilr4i0zh8cq.us-east-1.rds.amazonaws.com",
            user="admin",
            passwd="Group21capdb",
            database="CAP"
        )

    # Check the DB to see if it already contains the first article on this page.
    # If it does exist, stops this process before inserting any articles from this page to DB
    if commitIn == 1 and checkDatabaseForArticle(mydb, articles[0]):
        log.warn("This page is already inserted.")
        return 0

    for article_content in articles:

        # prints the title of each article if inserted 2 to function: does not insert into db
        if commitIn == 2:
            log.info(article_content['title'])
        # inserts into db for each article
        elif commitIn == 1:
            nowTime = datetime.datetime.now()
            #sqlInsert = 'INSERT INTO articles (title, content, newspaper, state, city, latitude, longitude, publication_date, publisher, language, source_link, created_at, updated_at) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)'
            sqlInsert = 'INSERT INTO CAP.articles (article_id, title, article_text, newspaper, publisher, publish_date, city, state, latitude, longitude, article_url, date_created, date_updated) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)'
            # Language is in article_content['lang']
            val = (
                0,
                article_content['title'],
                article_content['content'],
                article_metadata['newspaper'],
                article_metadata['publisher'],
                article_metadata['publication_date'],
                article_metadata['city'],
                article_metadata['state'],
                geoInfo['lat'],
                geoInfo['lon'],
                article_metadata['source_link'],
                nowTime,
                nowTime
                #article_content['lang'],
            )
            mycursor = mydb.cursor()
            mycursor.execute(sqlInsert, val)
            mydb.commit()

    # prints. Not necessary 
    if commitIn != 1:
        log.info('# of articles parsed = ' + str(len(articles)))
    else:
        # Insert new articles into Solr Search tool
        os.system('curl -s http://localhost:8983/solr/mysqlconnect/dataimport?command=full-import > /dev/null')
        log.info('# of articles inserted = ' + str(len(articles)))

    return 1

