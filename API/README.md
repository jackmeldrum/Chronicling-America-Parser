Chronicling America Article Parser API
==================================
This folder contains the information to set up the CAAR API so that the website can properly communicate to the database and Solr instances using AWS's Elastic Beanstalk services


To create an Elastic Beanstalk instance to host the Flask API
----------------------

1. Log in to the AWS account that is being used for the CAAR application
	
- Click the "Services" to open the list of services available from AWS

- Select "Elastic Beanstalk" under "EC2"

- From the landing page this brings you to, click the "Create Application" button

- This will bring you to a setup page that has a number of options

 - Application Name: Give the application a name, this will be used to identify a specific application instance, and influence the link that will be needed by the website

 - Application Tags: Can be ignored. Tags are not necessary for the API to function, they are for administrative purposes.

 - Platform: For Platform, select "Python", for Platform Branch, select "Python 3.6 running on 64bit Amazon Linux", Platform version can be left at the default value

 - Application Code: Select "Upload your code", this will reveal the next option

 - Source Code Origin: Select Local file. Zip up the .py files needed for the API along with the requirements.txt file. Click the choose file button and select that zip file from the dialog box that appears

 - Application Code Tags: These can also be ignored.

- When all options are configured, click "Create Application"

- When all options are configured, click "Configure More Options"

 - This will start the process of creating the application, and may take a few minutes

- When setup is finished, you may see an entry in the "Recent Events" table

 - ERROR Your WSGIPath refers to a file that does not exist

 - If the above error is present, click "Configuration" in the sidebar

 - From the list of categories shown, click the "Edit" button for the "Software" entry

 - For "WSGIPath", enter the filename of the primary .py file for the Flask application

 - Click the "Apply" button at the bottom of the page

 - AWS will reconfigure the environment to reflect this change, this may take a few minutes

- Once AWS finishes applying any changes, the API should be live, and can be called by external applications, such as the CAAR website

	

To Create a more streamlined <prefix>.elasticbeanstalk.com URL after initial creation
---------------------------------

 1. From the Application that was created in the above step, click the "Create a new environment" button

 - Leave the default environment tier, click the "Select" button, a number of options will be available

  - Environment Information: Type in the desired url prefix in the "domain" field

    - Click the "Check availibility" button, and if it is not available, use a different prefix

  - Platform: Select "Python" from the "Platform" dropdown, leave the rest as the defaults
		
  - Application code: leave default

 - When the options are configured, click the "Create environment" button

 - After the environment has been created, return to the Application page's environment list

 - Click the "Actions" button, and select "Swap environment URLs" from the dropdown

 - For the first panel, select the primary API environment, the "Environment URL" entry should be the url you wish to change

 - For the second panel, select the environment that was just created, the "Environment URL" entry should be the new url you wish to use

 - Click the "Swap" button

  - After a while, the URL that was specified will now point to the correct API instance

 - After the URLs have switched, navigate to the new environment

 - Click the "Environment actions" button and select "Terminate environment" from the dropdown

 - Follow the prompt that comes up, this will remove this extra environment and save on server time
		

To connect to Solr
---

1. Due to the way AWS handles its urls for online ec2 instances, stopping and restarting the instances hosting solr can break the connection the API has to Solr. If that happens:
	
- Open the CAP_API.py file in an editor
	
- Start the ec2 instances meant for hosting Solr
	
- In the AWS ec2 instances page, copy the "Public DNS" column data for the primary solr instance, normally "Solr1"
	
- Modify the "solr_server" variable at the top of the CAP_API file to match the info from the AWS page
 - It should be something like `http://<old DNS>:8983/solr/collection1/select?` -> `http://<new DNS>:8983/solr/collection1/select?`

To Update the API code
---

1. Zip up the requirements.txt file and ALL of the needed .py files

- Navigate to the environment that is hosting the API

- Click the "Upload and deploy" button

- Click the "Choose file" button, and select the zip file created earlier from the dialog that appears

- Modify the "Version Label" if desired, and click "Deploy"

 - After a few minutes, the API will be updated, and the changes made will be available at the URL for the environment used
		