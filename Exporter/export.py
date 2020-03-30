import mysql.connector
from mysql.connector import Error
import sys
import csv

try:
    connection = mysql.connector.connect(host='db-mysql-cap.cilr4i0zh8cq.us-east-1.rds.amazonaws.com',
                                        database='CAP',
                                        user='admin',
                                        password='Group21capdb')

    if connection.is_connected():
        db_info = connection.get_server_info()
        print("Connected to MySQL Server version ", db_info)
        query = "SELECT * FROM articles"
        ## query = "SELECT * FROM articles WHERE article_text LIKE '%atc%' OR article_text LIKE '%old' "

        ## Prevent mySQL injection attack with Prepared statement
        cursor = connection.cursor(prepared=True)
        cursor.execute(query)
        records = cursor.fetchall()

        if (len(records) > 250):
            print("File exceeds 250 rows and is unable to be created. Please narrow down your query if you would like to export your results.")

        firstrow = ["Title", "Article Text", "Newspaper", "Publisher", "Published Date", "City", "State", "Latitude", "Longitude", "URL"]

        ## The included rows correspond to the columns of the database.
        ## Since all articles have the same information and no new information
        ## will be added, it is safe to use include these columns in the .csv file
        included_rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        c = csv.writer(open('export_results.csv', 'w', encoding='utf-8'))
        c.writerow(firstrow)

        for row in records:
            results = list(row[i] for i in included_rows)
            c.writerow(results)

except Error as e:
    print("Error connecting")

finally:
    if(connection.is_connected()):
        connection.close()
        print("MySQL connection is closed")
