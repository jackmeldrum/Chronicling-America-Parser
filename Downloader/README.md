This program is intended to download and unzip the OCR files provided by the Library of Congress.

Several versions exist of this program. the "RAM intense" version will function only with sufficient RAM. The plain "downloader.py" version should work with any RAM amount above 1024 Bytes. Thus, it is suggested to run this version.

To run this program:

	First make sure Python 3 is installed and in your PATH.
	Second, make sure that the download location and json location have been set and saved in the config file (see below)
	
	If you wish to use IDLE:
		Open IDLE, click File, then Open...
		Navigate to and select downloader.py.
		Once the file opens in IDLE, press f5 or select Run and then Run Module.
		The program will begin running and outputing feedback into the IDLE prompt.
		Files will be within the designated download folder. 
	
	If you wish to use a command prompt:
		Navigate in your CLI to the folder in which the .py's are contained.
		Simply enter the following command:
			python downloader.py
		Replace "downloader.py" with an appropriate filename if you desire another version.

Below is a description of the various files within this folder.

	config-dl.ini contains a configuration file dictating specific file locations.
		Replace everything to the right of "dlLocation =" to replace the location where files will be saved
		Replace everything to the right of "jsonFile =" to replace the specific json file used. See below.

	downloader.py is the program itself. 

	downloader_single_file.py is an older version which downloads a single specific file.
		As noted within the program file, for this version to work, you must add a line in the config such as:
		fileUrl = https://chroniclingamerica.loc.gov/data/ocr/idhi_galapagos_ver01.tar.bz2
		This will download the specific file at the specific URL.

	Various files in the format of ocr<something>.json:
		Contains a version of the ocr json file. Replace file version in config to download another set of data.
			ocr.json contains the entire original json file.
			ocr_sample.json contains a select few to test the code without downloading 2 TB of data.
			ocr_just_one.json contains just one ocr.
			
		To make your own version of the OCR JSON:
			Select a base file. Say the "just one" version.
			Everything between the {"ocr": [ and ]} is an entry.
			Remove all entries you do not want to download. 
			Re-add any entries you wish to download. Everything between {} needs to be included.
			At the end of all the entries make sure a comma (,) exists. Remove the comma from the last entry.
			
			If the ocr json you made doesn't work make sure the follow is at the beggining: {"ocr": [
			and the follow is at the end of the file: ]}
			Try looking at the complete OCR JSON and comparing the format to yours. It has to be exact.
			ctrl + f can help in finding specific files
			
