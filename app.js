const app = require('./index');
require('dotenv').config();
const db = require("./config/sequalize");
const PORT = process.env.DB_PORT;
app.listen(PORT, () => console.log(`Server running on :${PORT}`));
// var new_db = process.env.DB_NAME;
// connection.connect((err)=>{
//     //console.error(err);
// });
// conn.connect((err)=>{
//     try {

//         conn.query(`CREATE DATABASE IF NOT EXISTS ${new_db}`,(error,result)=>{
//             if(error){
//                 console.log(result);
//                 //return res.status(400).json("Error creating Database.");
//             }
//             (async () => {
//                 await db.sequelize.sync();
//             })();
//         });
//         conn.query(`USE ${new_db}`,(error,result)=>{

//         });
//         /*
//         const createTable = `CREATE TABLE IF NOT EXISTS users(id int NOT NULL PRIMARY KEY AUTO_INCREMENT, \
//             first_name VARCHAR(255), \
//             last_name VARCHAR(255), \
//             password VARCHAR(255), \
//             username VARCHAR(255), \
//             account_created VARCHAR(255), \
//             account_updated VARCHAR(255)  \
//         );`

//         conn.query(createTable, (err, res) => {
//             if (err) throw err;
//         })*/
//     } catch (err) {
//         console.error(err);
//     }
// });