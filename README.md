# Chronicling-America-Parser

Connecting the API to the Solr instance after restarting
---

1. Due to the way AWS handles its urls for online ec2 instances, stopping and restarting the instances hosting solr can break the connection the API has to Solr. If that happens:
	
- Open the CAP_API.py file in an editor
	
- Start the ec2 instances meant for hosting Solr
	
- In the AWS ec2 instances page, copy the "Public DNS" column data for the primary solr instance, normally "Solr1"
	
- Modify the "solr_server" variable at the top of the CAP_API file to match the info from the AWS page
 - It should be something like `http://<old DNS>:8983/solr/collection1/select?` -> `http://<new DNS>:8983/solr/collection1/select?`