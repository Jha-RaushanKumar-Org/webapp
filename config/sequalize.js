const config = require('../database');
const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: "mysql"
});

const db = {};
db.sequelize = sequelize;
db.models = {};
db.models.User = require('./user')(sequelize, Sequelize.DataTypes);
db.models.Product = require('./product')(sequelize, Sequelize.DataTypes);
db.models.images = require("./image")(sequelize, Sequelize);
(async () => {
    await db.sequelize.sync({
        alter: true
    });
})();
module.exports = db;