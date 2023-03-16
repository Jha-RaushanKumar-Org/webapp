# webapp


Author:  `Raushan Kumar Jha`

- Web Application with different APIs functionalities
  - Create, Read and Update functionality to add, read and update user
  - Create, Read, Delete and Update functionality to add, read, delete and update product
  
   1. `POST` -  /v1/user
   2. `GET` - /v1/user/:id
   3. `PUT` - /v1/user/:id
   4. `POST` - /v1/product
   5. `GET` - /v1/product/:id
   6. `DELETE` - /v1/product/:id
   7. `PUT` - /v1/product/:id
   8. `PATCH` - /v1/product/:id

- Health endpoint
   1. `GET` -  /healthz


Pre-requisites:
- Install Node.js
- Install mysql server 

Build and Deploy:
- Clone the repository

- Build and run:
    - cd webapp
    - npm install
    - node app.js

Testing:
 - npm test
    
### AWS Components used:
EC2 Instances, Security Groups, AMI,
