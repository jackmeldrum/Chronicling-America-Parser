import ast
import binascii
import hashlib
import json
import os
import random
import string
import urllib
import uuid
from urllib.request import *

import flask_cors
import pymysql as sql
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
# for Beanstalk
application = app
CORS(application)

# Connect to database
db = sql.connect(host='db-mysql-cap.cilr4i0zh8cq.us-east-1.rds.amazonaws.com',
                 database='CAP',
                 user='admin',
                 password='Group21capdb')
db_cursor = db.cursor()

# store solr server
solr_server = 'http://ec2-52-91-24-85.compute-1.amazonaws.com:8983/solr/collection1/select?'


@app.route('/')
@flask_cors.cross_origin()
def hello_world():
    return 'Hello, world!'


# noinspection PyUnresolvedReferences
@app.route('/queryalldata', methods=["POST"])
@flask_cors.cross_origin()
def query_database_all_content():
    # Pull info from JSON payload
    try:
        year_start = request.json["startYear"]
        year_end = request.json["endYear"]
        any_terms = request.json["any"]
        all_terms = request.json["all"]
        exact_terms = request.json["exact"]
        not_terms = request.json["not"]
        within_terms = request.json["within"]
        within_num = request.json["withinNum"]
        newspapers = request.json["newspapers"]
        states = request.json["states"]
    except KeyError as error:
        import traceback

        print("Keyerror, json payload missing the {} field".format(str(error)))

        return jsonify(success=False, jsonKeyError="Request failed because field is missing from JSON payload",
                       missingKey=str(error))

    rowcount = request.json.get("resultCount", 250)

    if rowcount > 250:
        rowcount = 250

    end_tags = '&wt=json&rows={}'.format(str(rowcount))
    is_searching_articles = any_terms or all_terms or exact_terms or not_terms or (within_terms and within_num)
    query = 'q='
    if is_searching_articles:
        query = query + 'article_text:('
        # Handling if the user didnt provide any specific terms
        if any_terms:
            query = query + '({}) AND '.format(any_terms)
        if all_terms:
            article_text_all = '{}'.format(all_terms.replace(" ", " AND "))
            query = query + '({}) AND '.format(article_text_all)
        # Default operator is OR, so need to separate required terms with AND
        if exact_terms:
            query = query + '("{}") AND '.format(exact_terms)
        if not_terms:
            query = query + '-({}) AND '.format(not_terms)
        if within_terms and within_num:
            article_text_within = '"{}"~'.format(within_terms) + str(within_num)
            query = query + '({})'.format(article_text_within)

        if query.endswith(" AND "):
            query = query[:-len(" AND ")]
        query = query + ')'

    # properly format newspapers and states
    if newspapers:
        newspapers_text = ''.join('"{}"'.format(n) for n in newspapers)
        if is_searching_articles:
            query = query + ' AND newspaper:({})'.format(newspapers_text)
        else:
            query = query + 'newspaper:({})'.format(newspapers_text)

    if states:
        states_text = ''.join('"{}"'.format(s) for s in states)
        if is_searching_articles or newspapers:
            query = query + ' AND state:({})'.format(states_text)
        else:
            query = query + 'state:({})'.format(states_text)

    # Properly format date range
    if year_start and year_end:
        start_suffix = '-01-01T00:00:00Z'
        end_suffix = '-12-31T23:59:59Z'
        date_subquery = '["{}{}" TO "{}{}"]'.format(year_start, start_suffix, year_end, end_suffix)
        if is_searching_articles or newspapers or states:
            query = query + ' AND publish_date:{}'.format(date_subquery)

    full_url = solr_server + urllib.parse.quote(query, "&=()") + end_tags

    # Execute built query
    connection = urlopen(full_url)

    # Pull data out of query results
    response = json.load(connection)
    articles = {'articles': response['response']['docs']}

    return jsonify(articles)


@app.route('/getnewspapers', methods=["POST"])
@flask_cors.cross_origin()
def get_newspapers():
    # Create sql statement that returns unique values and execute it
    query = solr_server + "&q=newspaper%3A*&group=true&group.field=newspaper&wt=json"
    # noinspection PyUnresolvedReferences
    try:
        connection = urlopen(query)
    except urllib.error.URLError as fail:
        import traceback

        print("exception")
        print(fail)
        print(fail.__class__)
        traceback.print_tb(fail.__traceback__)
        return jsonify(response="exception")

    # Pull data out of query results
    response = json.load(connection)
    groups = response["grouped"]["newspaper"]["groups"]
    newspapers = []
    for group in groups:
        newspapers.append(group["groupValue"])
    # query = "SELECT DISTINCT newspaper FROM articles"
    # db.ping(True)
    # db_cursor.execute(query)

    # Pull data from results
    # data = db_cursor.fetchall()

    return jsonify(newspapers=newspapers)


@app.route('/getarticlecontent', methods=["POST"])
@flask_cors.cross_origin()
def get_article_content():
    # Pull article ids out of JSON payload, Payload in form of:
    # {"articleIDs" : ["000", "001", "002"]}
    article_ids = request.json["articleIDs"]

    # TODO: Create DB query
    # Turn list into string of numbers, separated by a comma
    in_delimiter = ","
    in_parameter = in_delimiter.join([str(elem) for elem in article_ids])

    # Build the DB query and execute
    query = "SELECT * FROM articles WHERE articleID IN (%s)"
    db.ping(True)
    db_cursor.execute(query, (in_parameter,))

    # Pull out ALL article data from results
    data = db_cursor.fetchall()
    # TODO: Add article Data to JSON response payload

    return jsonify(articles=data)


@app.route('/checkemailavailable', methods=["POST"])
@flask_cors.cross_origin()
def check_email_availability():
    # grab email from request
    try:
        email_to_check = request.json["email"]
    except KeyError as error:
        import traceback

        print("Keyerror, json payload missing the {} field".format(str(error)))

        return jsonify(success=False, jsonKeyError="Request failed because field is missing from JSON payload",
                       missingKey=str(error))

    is_available = not check_email(email_to_check)

    return jsonify(emailAvailable=is_available)


@app.route('/createaccount', methods=["POST"])
@flask_cors.cross_origin()
def create_new_account():
    # grab user email and password from request
    try:
        new_email = request.json["newAccountEmail"]
        new_password = request.json["newAccountPassword"]
    except KeyError as error:
        import traceback

        print("Keyerror, json payload missing the {} field".format(str(error)))

        return jsonify(success=False, jsonKeyError="Request failed because field is missing from JSON payload",
                       missingKey=str(error))

    # double-check that the email is available to be used
    email_available = not check_email(new_email)
    if email_available:
        # Hash and salt the password for storing
        salted_password = hash_password(new_password)

        # Build query for creating account
        query = "INSERT INTO users(email, password) VALUES(%s, %s)"

        # Execute the query
        db.ping(True)
        db_cursor.execute(query, (new_email, salted_password))
        db.commit()

        return jsonify(email=new_email, success=True)
    else:
        return jsonify(success=False, reason="email already in use")


@app.route('/login', methods=["POST"])
@flask_cors.cross_origin()
def login():
    # Get Email and Password from request
    try:
        email = request.json["email"]
        password = request.json["password"]
    except KeyError as error:
        import traceback

        print("Keyerror, json payload missing the {} field".format(str(error)))

        return jsonify(success=False, jsonKeyError="Request failed because field is missing from JSON payload",
                       missingKey=str(error))

    # Get encrypted PW from database
    pw_query = "SELECT user_id FROM users WHERE email = %s"
    db.ping(True)
    db_cursor.execute(pw_query, (email,))
    results = db_cursor.fetchone()
    user_id = results[0]

    if not user_id:
        return jsonify(success=False, session_token="")
    # Pull encrypted password from db to check
    check_success = verify_password(user_id, password)

    # Log the user in by creating a UUID for the session token
    if check_success:
        token = str(uuid.uuid4())
        # Update the session
        query = "UPDATE users SET session_token = %s WHERE email = %s"
        db.ping(True)
        db_cursor.execute(query, (token, email))
        db.commit()
        # query = "COMMIT"
        # db_cursor.execute(query)
        # Respond to website
        return jsonify(success=check_success, session_token=token)
    else:
        # Bad password, alert website that the login attempt failed
        return jsonify(success=check_success, session_token="")


@app.route('/confirmsession', methods=["POST"])
@flask_cors.cross_origin()
def confirm_session_token():
    # Pull info from request
    try:
        email = request.json["email"]
        token = request.json["sessionToken"]
    except KeyError as error:
        import traceback

        print("Keyerror, json payload missing the {} field".format(str(error)))

        return jsonify(success=False, jsonKeyError="Request failed because field is missing from JSON payload",
                       missingKey=str(error))

    # Pull email attached to session token from db
    query = "SELECT email FROM users WHERE session_token = %s"
    db.ping(True)
    db_cursor.execute(query, (token,))
    results = db_cursor.fetchone()
    db_email = results[0]

    # Check if database email matches with the email given by response
    is_session_token_valid = email == db_email

    # Return true if the email and session token are connected
    return jsonify(success=is_session_token_valid)


@app.route('/checkpermissions', methods=["POST"])
@flask_cors.cross_origin()
def check_session_token_permissions():
    # Pull token from request
    try:
        token = request.json["sessionToken"]
    except KeyError as error:
        import traceback

        print("Keyerror, json payload missing the {} field".format(str(error)))

        return jsonify(success=False, jsonKeyError="Request failed because field is missing from JSON payload",
                       missingKey=str(error))

    # Pull user permissions data using session token

    query = "SELECT user_id, email, isAdmin, isMod FROM users WHERE session_token = %s"
    db.ping(True)
    db_cursor.execute(query, (token,))
    results = db_cursor.fetchone()
    user_id = results[0]
    email = results[1]
    is_admin = results[2] == 1
    is_mod = results[3] == 1

    # Return that info back to the website
    return jsonify(userID=user_id, email=email, isAdmin=is_admin, isMod=is_mod)


# noinspection PyUnreachableCode
@app.route('/changepassword', methods=["POST"])
@flask_cors.cross_origin()
def change_password():
    # Grab info from request
    try:
        user_email = request.json["email"]
        old_password = request.json["oldPassword"]
        new_password = request.json["newPassword"]
        session_token = request.json["sessionToken"]
    except KeyError as error:
        import traceback

        print("Keyerror, json payload missing the {} field".format(str(error)))

        return jsonify(success=False, jsonKeyError="Request failed because field is missing from JSON payload",
                       missingKey=str(error))

    # Confirm session token
    if check_session_token(user_email, session_token):
        # Confirm old password validity
        query = "SELECT user_id FROM users WHERE email = %s"
        db.ping(True)
        db_cursor.execute(query, (user_email,))
        results = db_cursor.fetchone()
        # noinspection PyPep8Naming
        user_ID = results[0]
        if verify_password(user_ID, old_password):
            # old password checks out
            # Encrypt new password
            encrypted_password = hash_password(new_password)

            # Update password info for the selected user
            query = "UPDATE users SET password = %s WHERE user_id = %s"
            db.ping(True)
            db_cursor.execute(query, (encrypted_password, user_ID))
            query = "COMMIT"
            db_cursor.execute(query)
            return jsonify(success=True, reason="Password changed successfully")
        else:
            # Old password not correct
            return jsonify(success=False, reason="Existing password incorrect")
    else:
        # Session token did not match
        return jsonify(success=False, reason="Session Token did not match")

    # some other thing failed
    return jsonify(success=False, reason="Something went wrong")


@app.route('/resetpassword', methods=["POST"])
@flask_cors.cross_origin()
def reset_password():
    website_url = "http://ec2-34-205-156-237.compute-1.amazonaws.com/"
    # Check if the email is one in the database
    try:
        receiver_email = request.json["email"]
    except KeyError as error:
        import traceback

        print("Keyerror, json payload missing the {} field".format(str(error)))

        return jsonify(success=False, jsonKeyError="Request failed because field is missing from JSON payload",
                       missingKey=str(error))

    if check_email(receiver_email):
        # The email is registerd as a user
        user_id = grab_ID_from_email(receiver_email)
        # Generate a new random password
        characters = string.ascii_letters + string.digits
        # noinspection PyUnusedLocal
        new_password = ''.join(random.choice(characters) for i in range(8))

        # Encrypt the new password
        encrypted_password = hash_password(new_password)

        # Change the password for the user entry
        query = "UPDATE users SET password = %s WHERE user_id = %s"
        db.ping(True)
        db_cursor.execute(query, (encrypted_password, user_id))
        db.commit()

        # Email the user their new password 
        import smtplib
        import ssl
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart

        port = 465  # For SSL
        password = "xebT9TMMm9qh3it"

        context = ssl.create_default_context()
        sender_email = "caar.info.service@gmail.com"

        message = MIMEMultipart("alternative")
        message["Subject"] = "CAAR Password reset request"
        message["From"] = sender_email
        message["To"] = receiver_email
        text = """\
            Hello, 
            
            A password reset for the Chronicling America Article Repository account associated with this email has been requested.
            
            Your new password is: {}
            
            You can log in with your email and your new password here: {} 
        """.format(new_password, website_url)
        html = """\
            <html>
                <body>
                    <p>Hello, <br>
                    A password reset for the <a href="{}">Chronicling America Article Repository</a> account associated with this email has been requested.<br>
                    your new password is: <b>{}</b><br>
                    You can log in with your email and new password by clicking the link above</p>
                </body>
            </html>
        """.format(website_url, new_password)

        text_part = MIMEText(text, "plain")
        html_part = MIMEText(html, "html")

        message.attach(text_part)
        message.attach(html_part)
        with smtplib.SMTP_SSL("smtp.gmail.com", port, context=context) as server:
            server.login("caar.info.service@gmail.com", password)
            server.sendmail(sender_email, receiver_email, message.as_string())

        return jsonify(success=True, message="The email was sent")
    else:
        return jsonify(success=False, message="This email is not registered")


@app.route('/savenewquery', methods=["POST"])
@flask_cors.cross_origin()
def save_new_query():
    # Pull the JSON from the request
    try:
        query_data = request.get_json()
        # print("json = " + query_data)
        # Grab the query name and trim the JSON payload
        query_name = request.json["queryName"]
        # Grab the session token and trim the JSON payload
        session_token = request.json["sessionToken"]
        query_string = str(query_data["queryContent"])
    except KeyError as error:
        import traceback

        print("Keyerror, json payload missing the {} field".format(str(error)))

        return jsonify(success=False, jsonKeyError="Request failed because field is missing from JSON payload",
                       missingKey=str(error))

    # user_ID = grab_ID(session_token)

    query = "INSERT INTO queries(query_name, query_content, user_id) VALUES( %s, %s, (SELECT user_id FROM users WHERE " \
            "session_token = %s)) "
    db.ping(True)
    db_cursor.execute(query, (query_name, query_string, session_token))
    query = "COMMIT"
    db_cursor.execute(query)

    return jsonify(success=True)


@app.route('/recalluserqueries', methods=["POST"])
@flask_cors.cross_origin()
def list_user_queries():
    # Grab session token from request, then the user id
    session_token = request.json["sessionToken"]
    user_id = grab_ID_from_token(session_token)

    query = "SELECT * FROM queries WHERE user_id = %s"
    db.ping(True)
    db_cursor.execute(query, (user_id,))

    if db_cursor.rowcount:
        query_rows = db_cursor.fetchall()
        query_contents = {"queries": []}
        for row in query_rows:
            # Pull data from row
            q_id = row[0]
            u_id = row[1]
            name = row[2]
            content_string = row[3]

            # convert content from string to json object
            content_dict = ast.literal_eval(content_string)
            # build queries list entry
            query_entry = {
                "queryID": q_id,
                "userID": u_id,
                "queryName": name,
                "queryContent": content_dict
            }

            # add entry to dictionary
            query_contents["queries"].append(query_entry)

        return jsonify(query_contents)
    else:
        return jsonify(success=False)


@app.route('/deleteuserquery', methods=["POST"])
@flask_cors.cross_origin()
def delete_user_query():
    session_token = request.json["sessionToken"]
    saved_query_id = request.json["queryIDToDelete"]

    request_user_id = grab_ID_from_token(session_token)

    query = "SELECT user_id FROM queries WHERE query_id = %s"
    db.ping(True)
    db_cursor.execute(query, (saved_query_id,))
    results = db_cursor.fetchone()
    database_user_id = results[0]

    if request_user_id == database_user_id:
        # the logged in user owns the query, can delete it
        query = "DELETE FROM queries WHERE query_id = %s"
        db.ping(True)
        db_cursor.execute(query, (saved_query_id,))
        query = "COMMIT"
        db_cursor.execute(query)
        return jsonify(success=True, reason="The query was deleted successfully")
    else:
        return jsonify(success=False, reason="This user does not own this query")


@app.route('/changeuserpermissions', methods=["POST"])
@flask_cors.cross_origin()
def modify_user_permissions():
    # Get session token to verify permissions
    try:
        token = request.json["sessionToken"]
        promoted_user = request.json["emailToChange"]
        promote = request.json["isPromoted"]
    except KeyError as error:
        import traceback

        print("Keyerror, json payload missing the {} field".format(str(error)))

        return jsonify(success=False, jsonKeyError="Request failed because field is missing from JSON payload",
                       missingKey=str(error))

    admin_status = check_admin(token)

    if admin_status[0]:
        is_admin = admin_status[1]
    else:
        return jsonify(success=False, message="no user found for session token: {}".format(token))

    if is_admin and check_email(promoted_user):
        query = "UPDATE users SET isMod = %s WHERE email = %s"
        success = db_cursor.execute(query, (promote, promoted_user))
        db.commit()

        return jsonify(success=success == 1)
    else:
        return jsonify(success=False,
                       message="The request failed, either the request was not initiated by an admin or the desired user to promote was not found")


@app.route('/getallusers', methods=["POST"])
@flask_cors.cross_origin()
def get_all_users():
    # Get session token to verify permissions
    try:
        token = request.json["sessionToken"]
    except KeyError as error:
        import traceback

        print("Keyerror, json payload missing the {} field".format(str(error)))

        return jsonify(success=False, jsonKeyError="Request failed because field is missing from JSON payload",
                       missingKey=str(error))
    admin_status = check_admin(token)

    if admin_status[0]:
        is_admin = admin_status[1]
    else:
        return jsonify(success=False, message="no user found for session token: {}".format(token))

    # query = "SELECT isAdmin FROM users WHERE session_token = %s"
    # db_cursor.execute(query, (token,))
    # results = db_cursor.fetchone()

    # if results:
    #    is_admin = results[0] == 1
    # else:
    #    return jsonify(success=False, message="no user found for session token: {}".format(token))

    if is_admin:
        query = "SELECT user_id, email, isMod, isAdmin FROM users WHERE session_token <> %s"
        db_cursor.execute(query, (token,))
        results = db_cursor.fetchall()
        users_list = []
        for entry in results:
            user = {
                "userID": entry[0],
                "email": entry[1],
                "isMod": entry[2] == 1,
                "isAdmin": entry[3] == 1
            }

            users_list.append(user)

        return jsonify(success=True, users=users_list)

    else:
        # The request was made by someone who isn't an admin
        return jsonify(success=False, message="Invalid Session Token")


def check_email(email):
    # create query
    query = "SELECT * FROM users WHERE email = %s"
    db.ping(True)
    db_cursor.execute(query, (email,))

    if db_cursor.rowcount:
        return True
    else:
        return False


def hash_password(password):
    """Hash a password for storing."""
    salt = hashlib.sha256(os.urandom(60)).hexdigest().encode('ascii')
    pwdhash = hashlib.pbkdf2_hmac('sha512', password.encode('utf-8'),
                                  salt, 100000)
    pwdhash = binascii.hexlify(pwdhash)
    return (salt + pwdhash).decode('ascii')


def verify_password(userid, provided_password):
    """Verify a stored password against one provided by user"""
    # Get stored password for given id
    query = "SELECT password FROM users WHERE user_id = %s"
    db.ping(True)
    db_cursor.execute(query, (userid,))
    results = db_cursor.fetchone()
    stored_password = results[0]
    salt = stored_password[:64]
    stored_password = stored_password[64:]
    pwdhash = hashlib.pbkdf2_hmac('sha512',
                                  provided_password.encode('utf-8'),
                                  salt.encode('ascii'),
                                  100000)
    pwdhash = binascii.hexlify(pwdhash).decode('ascii')
    return pwdhash == stored_password


def check_session_token(email, session_token):
    query = "SELECT email FROM users WHERE session_token = %s"
    db.ping(True)
    db_cursor.execute(query, (session_token,))
    results = db_cursor.fetchone()
    db_email = results[0]

    return email == db_email


# noinspection PyPep8Naming
def grab_ID_from_token(session_token):
    query = "SELECT user_id FROM users WHERE session_token = %s"
    db.ping(True)
    db_cursor.execute(query, (session_token,))
    results = db_cursor.fetchone()
    db_id = results[0]

    return db_id


# noinspection PyPep8Naming
def grab_ID_from_email(email):
    query = "SELECT user_id FROM users WHERE email = %s"
    db.ping(True)
    db_cursor.execute(query, (email,))
    results = db_cursor.fetchone()
    db_id = results[0]

    return db_id


def check_admin(session_token):
    query = "SELECT isAdmin FROM users WHERE session_token = %s"
    db.ping(True)
    db_cursor.execute(query, (session_token,))
    results = db_cursor.fetchone()

    if results:
        return True, results[0] == 1
    else:
        return False, False


# noinspection PyUnresolvedReferences
@app.route('/debugsolr', methods=["POST"])
@flask_cors.cross_origin()
def debugsolr():
    # from flask.ext.solrquery import solr
    try:
        any_terms = request.json["any"]
        article_text_any = '(' + any_terms + ')'

        debug_solr_server = 'http://ec2-3-95-187-89.compute-1.amazonaws.com:8983/solr/collection1/select?'
        end_tags = '&wt=json&rows=250'
        # query = 'q=article_text:(Richardson OR uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu)'
        query = 'q=article_text:({})'.format(article_text_any)
        # url = solr_server + query + json_response
        # print(url)
        # url = url.replace(' ', '%20')
        # print(url)
        url = debug_solr_server + urllib.parse.quote(query, "&=()") + end_tags
        print(url)
        connection = urlopen(url)
        # connection = urlopen(
        #    'http://ec2-3-95-187-89.compute-1.amazonaws.com:8983/solr/collection1/select?q=article_text:burn&wt=json')
        response = json.load(connection)
        print(response['response']['numFound'], "documents found.")

        # Print the name of each document.

        for document in response['response']['docs']:
            print("  Name = %s", document['article_text'])
    except Exception as fail:
        import traceback

        print("exception")
        print(fail)
        print(fail.__class__)
        traceback.print_tb(fail.__traceback__)
        return jsonify(response="exception")

    real_response = {'articles': response['response']['docs']}

    return real_response
    # return jsonify(response="maybe")


@app.route('/debug', methods=["POST"])
@flask_cors.cross_origin()
def debug():
    db.ping(True)
    """
    #token = uuid.uuid4()
    thing = string.ascii_letters + string.digits
    password = ''.join(random.choice(thing) for i in range(8))
    hash = hash_password(password)

    import smtplib, ssl
    smtp_server = "localhost"
    port = 1025
    sender_email = "my@email.com"
    receiver_email = "your@email.com"

    context = ssl.create_default_context()

    try:
        print("here")
        server = smtplib.SMTP(smtp_server,port)
        print("there")
        #server.starttls(context=context)
        server.ehlo()
        print("what")
        server.sendmail(sender_email,receiver_email,message)
    except Exception as e:
        print("exception")
        print(e)
    finally:
        server.quit()
    """
    # email = request.json['email']
    # pw_query = "SELECT user_id FROM users WHERE email = %s"
    # db_cursor.execute(pw_query, (email,))
    # results = db_cursor.fetchone()
    # print(results)
    # user_id = results[0]
    # user_email = results[1]
    # print("email {}\n userid {}".format(email, user_id))
    # test = request.json["empty"]
    # booleanthing = test or True
    # print(test)
    # if test:
    #    print("here")
    # else:
    #    print("there")
    # query = "select * from users"
    # db_cursor.execute(query)
    # results = db_cursor.fetchall()
    # print(results)
    # query = "SELECT user_id, email, isMod, isAdmin FROM users"
    # db_cursor.execute(query)
    # results = db_cursor.fetchall()
    # usersdict = {"users": []}

    # users_list = []
    # for entry in results:
    #    user = {
    #        "userID": entry[0],
    #        "email": entry[1],
    #        "isMod": entry[2] == 1,
    #        "isAdmin": entry[3] == 1
    #    }
    #
    #    users_list.append(user)
    rowcount = request.json.get("resultCount", 250)

    if rowcount > 250:
        rowcount = 250

    return jsonify(success=True, rowcount=rowcount)
    # return jsonify(thingy)


@app.route('/movesolr', methods=["POST"])
@flask_cors.cross_origin()
def change_solr_link():
    global solr_server
    password = request.json['password']
    new_url = request.json['newSolr']
    encrypted = "67e83ef51e187f7fdbcbbbcf6eda5588c32ba4051cadd15e499ac73f0ae60ffe689387d8f6eb8ad2172d026f3e0bf1e6aa21816c3a1d14db6774b084a6a29328299bc9c31d4b337100ae3f225683547eb8cac066885937339f22a8092b5c7247"

    salt = encrypted[:64]
    stored_password = encrypted[64:]
    pwdhash = hashlib.pbkdf2_hmac('sha512',
                                  password.encode('utf-8'),
                                  salt.encode('ascii'),
                                  100000)
    pwdhash = binascii.hexlify(pwdhash).decode('ascii')

    verified = pwdhash == stored_password

    if verified:
        solr_server = new_url

    return jsonify(working=verified, currentSolr=solr_server)


@app.route('/stopdb', methods=["POST"])
@flask_cors.cross_origin()
def stop_db_connection():
    global db
    password = request.json['password']
    encrypted = "67e83ef51e187f7fdbcbbbcf6eda5588c32ba4051cadd15e499ac73f0ae60ffe689387d8f6eb8ad2172d026f3e0bf1e6aa21816c3a1d14db6774b084a6a29328299bc9c31d4b337100ae3f225683547eb8cac066885937339f22a8092b5c7247"

    salt = encrypted[:64]
    stored_password = encrypted[64:]
    pwdhash = hashlib.pbkdf2_hmac('sha512',
                                  password.encode('utf-8'),
                                  salt.encode('ascii'),
                                  100000)
    pwdhash = binascii.hexlify(pwdhash).decode('ascii')

    verified = pwdhash == stored_password

    if verified:
        db.close()

    return jsonify(success=verified)


@app.route('/startdb', methods=["POST"])
@flask_cors.cross_origin()
def start_db_connection():
    global db
    global db_cursor
    password = request.json['password']
    encrypted = "67e83ef51e187f7fdbcbbbcf6eda5588c32ba4051cadd15e499ac73f0ae60ffe689387d8f6eb8ad2172d026f3e0bf1e6aa21816c3a1d14db6774b084a6a29328299bc9c31d4b337100ae3f225683547eb8cac066885937339f22a8092b5c7247"

    salt = encrypted[:64]
    stored_password = encrypted[64:]
    pwdhash = hashlib.pbkdf2_hmac('sha512',
                                  password.encode('utf-8'),
                                  salt.encode('ascii'),
                                  100000)
    pwdhash = binascii.hexlify(pwdhash).decode('ascii')

    verified = pwdhash == stored_password

    if verified:
        db = sql.connect(host='db-mysql-cap.cilr4i0zh8cq.us-east-1.rds.amazonaws.com',
                         database='CAP',
                         user='admin',
                         password='Group21capdb')
        db_cursor = db.cursor()

    return jsonify(success=verified)
