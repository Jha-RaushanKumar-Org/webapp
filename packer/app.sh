#!/bin/bash
sleep 30
sudo yum update -y
sudo yum upgrade -y
sudo amazon-linux-extras install nginx1.12 -y

sudo yum install -y gcc-c++ make
curl -sL https://rpm.nodesource.com/setup_16.x | sudo -E bash -
sudo yum install -y nodejs


sudo rpm --import https://repo.mysql.com/RPM-GPG-KEY-mysql-2022
wget http://dev.mysql.com/get/mysql57-community-release-el7-8.noarch.rpm
sudo yum localinstall -y mysql57-community-release-el7-8.noarch.rpm
sudo yum install -y mysql-community-server
sudo systemctl start mysqld
sudo systemctl enable mysqld

sudo grep 'temporary password' /var/log/mysqld.log | awk '{print $NF}' > /tmp/mysql.password
MYSQL_ROOT_PASSWORD=$(cat /tmp/mysql.password)
mysql -u root --password=$MYSQL_ROOT_PASSWORD --connect-expired-password -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'Raushan@123';"

echo "##Unzipping of Application##"

sudo yum install unzip -y


mkdir ~/webapp

unzip webapp.zip -d ~/webapp
cd ~/webapp && npm i

cd ~/webapp

sudo touch .env
sudo chmod 777 .env

echo "DB_HOST=localhost" >> .env
echo "DB_PORT=3000" >> .env
echo "DB_USER=root" >> .env
echo "DB_PASSWORD=Raushan@123" >> .env
echo "DB_NAME=csye_6225" >> .env

sudo mv /tmp/webapp.service /etc/systemd/system/webapp.service
sudo systemctl enable webapp.service
sudo systemctl start webapp.service
sudo systemctl status webapp.service