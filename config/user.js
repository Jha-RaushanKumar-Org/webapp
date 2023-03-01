module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("users", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        first_name: {
            type: DataTypes.STRING
        },
        last_name: {
            type: DataTypes.STRING
        },
        password: {
            type: DataTypes.STRING
        },
        username: {
            type: DataTypes.STRING
        },
        account_created: {
            type: DataTypes.STRING
        },
        account_updated: {
            type: DataTypes.STRING
        }
    }, {
        freezeTableName: true,
        createdAt: false,
        updatedAt: false
    });
    return User;
};