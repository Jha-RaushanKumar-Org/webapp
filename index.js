var express = require("express");
var mysql = require("mysql");

const conn = require('./database');
const app = express();

const cors = require('cors');
app.use(cors());
app.use(express.json());

const routes = require('./routes/route');
app.get("/healthz",(req, res)=>{
    res.status(200).json();    
});

routes(app);



module.exports = app;
