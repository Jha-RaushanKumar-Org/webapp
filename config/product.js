module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define("product", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.STRING
        },
        sku: {
            type: DataTypes.STRING
        },
        manufacturer: {
            type: DataTypes.STRING
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0,
                max: 100,
            },
        },
        date_added: {
            type: DataTypes.STRING
        },
        date_last_updated: {
            type: DataTypes.STRING
        },
        owner_user_id: {
            type: DataTypes.INTEGER
        }
    }, {
        freezeTableName: true,
        createdAt: false,
        updatedAt: false
    });
    return Product;
};