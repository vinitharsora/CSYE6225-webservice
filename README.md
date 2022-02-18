# Building a RESTful Web Service

Built a service that will accept following HTTP request at 

GET - http://localhost:8081/healthz/

POST - http://localhost:8081/v1/user/

PUT - http://localhost:8081/v1/user/self/

POST - http://localhost:8081/v1/user/self

Responds with following HTTP messages

"400 Bad Request - The server could not understand the request due to invalid syntax."

"500 Internal Server Error - The server has encountered a situation it does not know how to handle."

"201 Created - The request succeeded, and a new resource was created as a result. This is typically the response sent after POST requests, or some PUT requests"

"200 OK - The request succeeded."

"401 Unauthorized - Although the HTTP standard specifies "unauthorized", semantically this response means "unauthenticated". That is, the client must authenticate itself to get the requested response."

# What you Need 

* A favorite text editor or IDE (VScode)

* POSTMAN

* MySQL

* npm 8.5.0

* JavaScript

# Instructions:

Step 1: Download and unzip the source repository for this guide, or clone it using Git.

Step 2: Create appropriate files in the IDE and write the code to test the API call in Postman.

Step 3: Open Postman and Test the API's

Step 4: Check the Database after each and every API is called to see the status in Database. 


# Test the Service

To check the service is up visit 

http://localhost:8081/healthz/, where you should see: "200 OK".

http://localhost:8081/v1/user/ where you should see: "201 Created".

http://localhost:8081/v1/user/self/ where you should see: "201 Created".

http://localhost:8081/v1/user/self where you should use: "200 OK".

# Important Commands

brew install mysql

nodemon server.js 
