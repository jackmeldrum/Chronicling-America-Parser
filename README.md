# Chronicling-America-Parser

Connecting the API to the Solr instance after restarting
---

1. Due to the way AWS handles its urls for online ec2 instances, stopping and restarting the instances hosting solr can break the connection the API has to Solr. If that happens:
	
1. Open the CAP_API.py file in an editor
	
1. Start the ec2 instances meant for hosting Solr
	
1. In the AWS ec2 instances page, copy the "Public DNS" column data for the primary solr instance, normally "Solr1"
	
1. Modify the "solr_server" variable at the top of the CAP_API file to match the info from the AWS page
	- It should be something like `http://<old DNS>:8983/solr/collection1/select?` -> `http://<new DNS>:8983/solr/collection1/select?`

Conntecting the Parser to the Solr instance after restarting
---

In the parser directory - the file `articleToDB.py`, on line 144, ensure that the link to Solr is correct - this must be done every time Solr is taken down and brought back up. More information available in the parser's readme document.

To start the Solr instances after the URLs have changed, view the `Solr Notes` pdf in the `Servers (Solr & Web)` folder in the Google Drive.

