# webservice

A Node.Js app which returns status code 200 on calling of /healthz.

---
## Requirements

For development, you will need Node.js and npm installed in your environement.

### Node
- #### Node installation

  You can install nodejs and npm easily with apt install, just run the following commands.

      $ sudo apt install nodejs
      $ sudo apt install npm

- #### Other Operating Systems
  You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).

If the installation was successful, you should be able to run the following command.

    $ node --version
    v17.3.0

    $ npm --version
    8.3.0

###
### Yarn installation (optional)
  After installing node, this project will need yarn too, so just run the following command.

      $ npm install -g yarn

---

## Build & Install

    $ git clone git@github.com:spring2022-CloudComputing/webservice.git
    $ cd cd webwebservice/API-test1
    $ npm install
## Running the project

    $ npm run start:server

## Running Unit Test cases

    $ npm test