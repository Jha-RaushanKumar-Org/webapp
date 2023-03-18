#!/bin/bash
sleep 30
sudo yum update -y
sudo yum upgrade -y

sudo yum install -y gcc-c++ make
curl -sL https://rpm.nodesource.com/setup_16.x | sudo -E bash -
sudo yum install -y nodejs
sleep 10
sudo mv /tmp/cloudwatch-config.json cloudwatch-config.json
sleep 10
mkdir log

sleep 10
echo "CloudwatchAgent Installation Started"
sudo yum install amazon-cloudwatch-agent -y 

sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
-a fetch-config \
-m ec2 \
-c file:/home/ec2-user/webapp/cloudwatch-config.json \
-s
echo "CloudwatchAgent Installation Completed!"

echo "##Unzipping of Application##"

sudo yum install unzip -y


mkdir ~/webapp

unzip webapp.zip -d ~/webapp
cd ~/webapp && npm i

sudo mv /tmp/webapp.service /etc/systemd/system/webapp.service
sudo systemctl enable webapp.service
sudo systemctl start webapp.service
sudo systemctl status webapp.service