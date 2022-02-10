# webservice

## Prerequisites for building and deploying your application locally.
Springboot
Java 11
Postman
GitHub Account
Apache Tomcat

## Build and Deploy instructions for the web application.
Open the RestAPI project from Spring boot Suite Tool Application.
Check for the StatusCheck.java file that points to our get request(/getstatus) that will return us the status code of 200 and output as null as it is passed in the body section.
If the port number is listening to another application you can do this (go to application.properties--> type command server.port=8090) and it should work.
Open any browser and type (localhost:8080/getstatus) it will print the output as null which means our API part is working properly.
Open the Postman Application as well to test it as an client and the same can be observed.
To run the test case for the code we will switch to RestApiApplicationTests.java file and create a test case that will be linked to our java class and we will run it with JUnit. Once the test case is build we will push our code to GitHub.
In the Git All the work would be done in my namespace folder and then merged in the Organization's main branch.
At the end We have to make sure all the branches at an equal commits.

