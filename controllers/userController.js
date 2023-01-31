const conn = require('../database');
const hashPassword = require('../utils');
const bcrypt = require('bcrypt');

const basicAuthentication = require('../utils');
const comparePasswords = require('../utils');


exports.createUser = async function (req, res){
    let reqBody;
    if (req.body) {
        reqBody = Object.keys(req.body);
    } else {
        reqBody = null;
    }

    if (Object.keys(req.body).length === 0) {
        return res.status(400).json('No user created');
    }

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(req.body.username)) {
        return res.status(400).json("Enter valid Email Address (abc@xyz.com).");
    }


    var hashedPassword = await bcrypt.hash(req.body.password, 10);
    const first_name=req.body.first_name;
    const last_name=req.body.last_name;
    const username=req.body.username;
    const password=req.body.password;
    const account_created = new Date().toISOString();
    const account_updated = new Date().toISOString();

    if (!first_name || !last_name || !password || !username) {
        return res.status(400).json("Data Incomplete");
    }
    if (req.body.account_created || req.body.account_updated) {
        return res.status(400).json("Enter only first_name, last_name, password and username");
    }
    conn.query('SELECT count(*) AS cnt FROM users WHERE username = ?',[req.body.username], (err, response) => {
        if (response[0].cnt != 0) {
            return res.status(400).json("User already exists. Enter new user");
        }
        else{
            conn.query('INSERT INTO users VALUES (null,?,?,?,?,?,?)',[first_name,last_name,hashedPassword,username,account_created,account_updated],(error,result)=>{
                if(error){
                    console.log(error);
                    return res.status(400).json("Error creating user in Database.");
                }
                else{
                    conn.query('SELECT * FROM users WHERE username = ?',[username], async (err, response) =>{
                        delete response[0].password;
                        return res.status(201).json(response[0]);
                    });
        
                }
            });
        }
    });
    
}

exports.getUser = async function (req, res){

    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1){
        return res.status(401).json("Request Unauthorized");
    } 
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':'); 


    if (!username || !password) {
        return res.status(401).json("Invalid Authentication");
    }
    
    conn.query('SELECT count(*) as cnt FROM users WHERE username = ?',[username], async (err, response) =>{
        if(response[0].cnt ==0){
            return res.status(401).json("Invalid Authentication");
        }
        else{
            conn.query('SELECT * FROM users WHERE username = ?',[username], async (err, response) =>{
                if(response[0].id != req.params.id){
                    return res.status(403).json("Forbidden");
                }
                else{
                    const passauthentication = await bcrypt.compare(password, response[0].password);
                    if(!passauthentication){
                        return res.status(401).json("Invalid Authentication");
                    }
                    else{
                        delete response[0].password;
                        return res.status(200).json(response[0]);
                    }
                }
            });
        }
    });
    
}

exports.updateUser = async function (req, res){

    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1){
        return res.status(401).json("Request Unauthorized");
    } 
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':'); 


    if (!username || !password) {
        return res.status(401).json("Invalid Authentication");
    }
    if (req.body.account_created || req.body.account_updated) {
        return res.status(400).json("Enter only first_name, last_name, password and username");
    }
    
    conn.query('SELECT count(*) as cnt FROM users WHERE username = ?',[username], async (err, response) =>{
        if(response[0].cnt ==0 ){
            return res.status(401).json("Invalid Authentication");
        }
        else{
            conn.query('SELECT * FROM users WHERE username = ?',[username], async (err, response) =>{
                if(response[0].id != req.params.id){
                    return res.status(403).json("Forbidden");
                }
                else{
                    const passauthentication = await bcrypt.compare(password, response[0].password);
                    if(!passauthentication){
                        return res.status(401).json("Invalid Authentication");
                    }
                    else{
                        const existing_first_name=req.body.first_name;
                        const existing_last_name=req.body.last_name;
                        const existing_username=req.body.username;
                        const existing_password=req.body.password;
                        const account_updated = new Date().toISOString();
                        var hashedPassword = await bcrypt.hash(req.body.password, 10);
                        
                        if (!existing_first_name || !existing_last_name || !existing_password || !existing_username) {
                            return res.status(400).json("Data Incomplete");
                        }
                        if(username != existing_username){
                            return res.status(400).json("User name can't be updated.");
                        }
                        if (req.body.account_created) {
                            return res.status(400).json("Enter only first_name, last_name, password and username");
                        }
        
                        conn.query('UPDATE users SET first_name = ?,last_name = ?,password = ?,account_updated  = ? WHERE username = ?',[existing_first_name,existing_last_name,hashedPassword,account_updated,username],(error,result)=>{
                            if(error){
                                console.log(error);
                                return res.status(400).json("Error updating user in Database.");
                            }
                            else{
                                return res.status(204).json('User successfully updated');
                    
                            }
                        });
        
                        
                        //delete response[0].password;
                        //return res.status(200).json(response[0]);
                    }
                }
            });
        }
    });
    
}
