# CAP Project - Download and unzipper - JS
# Selects, downloads, saves, and unzips a tarball from the CAP repository

# NOTE: Since this version only downloads one file
#  fileURL was removed from the config. Readd to enable this code.

import urllib.request
import logging
import configparser

# Start our config parser, and read out config file.
config = configparser.ConfigParser()
config.sections()
config.read('config-dl.ini')

# fileUrl stores the URL of the file we wish to download
fileUrl = config['FILEINFO']['fileUrl']

# dlLocation stores where we wish to store our file
dlLocation = config['FILEINFO']['dlLocation']

# downloadedFile points to the file online
print('Finding file')
downloadedFile = urllib.request.urlopen(fileUrl)

# writableFile holds our downloaded file 
# This step downloads our file
print('Downloading file')
writableFile = downloadedFile.read()

# Writes our file to the save location
print('Writing file')
with open(dlLocation, 'wb') as saveFile:
    saveFile.write(writableFile)

