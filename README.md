# Building a RESTful Web Service

Built a service that will accept following HTTP request at 
GET - http://localhost:8081/.
POST - http://localhost:8081/register
POST - http://localhost:8081/authenticated
POST - http://localhost:8081/update/
POST - http://localhost:8081/get-user

Responds with following HTTP messages
"400 Bad Request - The server could not understand the request due to invalid syntax.".
"500 Internal Server Error - The server has encountered a situation it does not know how to handle."
"201 Created - The request succeeded, and a new resource was created as a result. This is typically the response sent after POST requests, or some PUT requests"
"200 OK - The request succeeded."
"401 Unauthorized - Although the HTTP standard specifies "unauthorized", semantically this response means "unauthenticated". That is, the client must authenticate itself to get the requested response."

What You Need

* A favorite text editor or IDE

* POSTMAN

* MySQL

* npm 8.5.0

## Instructions:

Download and unzip the source repository for this guide, or clone it using Git:

Step 1: Import the dependencies in the Code
Step 2: Connect the database to your Node JS server.
Step 3: Use the GET command through Postman to hit the API to get authorized.
Step 4: Use the POST command through Postman to hit the API to get registered.
Step 5: Use the POST command through Postman to hit the API to get the user authenticated and here the token will be genereated.
Step 6: Use the POST command through Postman to the API to update the user's details.
Step 7: Use the POST command through Postman to the API to uget User's details but no password.
 

## Test the Service
To check the service is up visit 
http://localhost:8081/, where you should see: "200 OK".
http://localhost:8081/register where you should see: "201 Created".
http://localhost:8081/authenticated where you should see: "200 OK".
http://localhost:8081/update/ where you should see: "201 Created".
http://localhost:8081/get-user where you should use: "200 OK".
