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

echo "##Unzipping of Application##"

sudo yum install unzip -y

mkdir ~/webapp 

unzip webapp.zip -d ~/webapp
echo "CloudwatchAgent Installation Started"
sudo wget https://s3.us-east-1.amazonaws.com/amazoncloudwatch-agent-us-east-1/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm

echo "CloudwatchAgent Installation Completed!"

cd ~/webapp && npm i



sudo mv /tmp/webapp.service /etc/systemd/system/webapp.service
sudo systemctl enable webapp.service
sudo systemctl start webapp.service
sudo systemctl status webapp.service