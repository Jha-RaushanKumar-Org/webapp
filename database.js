var mysql = require("mysql");

const conn = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'Raushan@0128',
    database:'db2'
})

module.exports = conn;