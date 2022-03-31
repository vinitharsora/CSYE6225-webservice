#!/bin/bash

#start app
cd /home/ec2-user/webservice
pm2 kill
sudo pm2 start index.js
sudo pm2 save
sudo pm2 startup systemd