# CAP Project - Download and unzipper - JS
# Loops through a given JSON file, extracts file locations, and downloads them
# 

import urllib.request
import logging
import configparser
import json
import time
import bz2
import tarfile
import io

# Start our config parser, and read out config file.
# This code is largely required to be as it is for configparser to work
config = configparser.ConfigParser()
config.sections()
# congig-dl.ini can be renamed, so long as the related file is as well.
config.read('config-dl.ini')

# dlLocation is the path to the location where our files will be saved.
dlLocation = config['FILEINFO']['dlLocation']

# jsonLocation stores the file path to the desired json file 
#  that stores the OCR data inside
jsonLocation = config['FILEINFO']['jsonFile']

# Begin by opening the json file, then load it. 
# json.load does that hard work here of parsing json for us.
# First line, openedFile can fix issue with incorrect path names in Linux
# openedFile = open("/home/josh/Downloader/ocr_just_one.json", 'r')
openedFile = open(jsonLocation, 'r')
data = json.load(openedFile)

# Create a variable to store the size of the total download. (In bytes)
totalBytes = 0

# Get the current time. We use this to calculate how long our process took.
startTime = time.time()

# Begin looping through the OCR file, downloading the files as we go.
# This loop relies on a properly formatted json file.
# Especially since we do not know how many OCR entries are in the file.
for ocrFile in data['ocr']:
	#BEGIN LOOP

	# Get the size of the file from the OCR.	
    totalBytes += ocrFile['size']
    filePath = dlLocation + ocrFile['name']
    print("Downloading a new file from: " + ocrFile['url'])
    # Open a connection to the web version of the file.
    fileSource = urllib.request.urlopen(ocrFile['url'])
    # Proceed to download the file in chunks
    with open(filePath ,'wb') as f:
        while True:
            chunk = fileSource.read(1024)
            if not chunk:
                break 
            f.write(chunk)

    f.close()
    
    print("Downloaded the file, proceeding to extract it.")

    # Open the tarfile
    saveableTar = tarfile.open(name = filePath, mode = 'r')
    # Extract the tarfile
    saveableTar.extractall(path = dlLocation)
    print("Got and extracted file \"" + ocrFile['name'] + "\"")
    saveableTar.close()

    #END LOOP

# Make sure to close the file!
openedFile.close()

# Calculate the total time it took to download and save the files.
totalTime = time.time() - startTime
# Convert totalTime to a printable format (IE: a string)
time = str(totalTime)

# Finally report to the user the total time it took.
print("Downloaded files in: " + time + " seconds.")

# Finally, report the size of the download in megabytes.
totalGB = (float(totalBytes) / 1000000000.0)
print(str(totalGB) + "GB of data was downloaded.")

print("Download and processing speed of " + str((float(totalBytes)/1000000000.0) / totalTime) + " GB/s")

# Below is useful to pause before end of execution. Remove the # to 
# cause the program to wait for user input at end of execution.
#print("Press enter to end.")
#wait = input()
