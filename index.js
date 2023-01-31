var express = require("express");
var mysql = require("mysql");

const conn = require('./database');
const app = express();

const cors = require('cors');
app.use(cors());
app.use(express.json());

const routes = require('./routes/route');

routes(app);
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

app.get("/healthz",(req, res)=>{
    res.status(200).json();    
});

conn.connect((err)=>{
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS users(id int NOT NULL PRIMARY KEY AUTO_INCREMENT, \
            first_name VARCHAR(255), \
            last_name VARCHAR(255), \
            password VARCHAR(255), \
            username VARCHAR(255), \
            account_created VARCHAR(255), \
            account_updated VARCHAR(255)  \
        );`
        
        conn.query(createTable, (err, res) => {
            if (err) throw err;
        })
    } catch (err) {
        console.error(err);
    }
});


