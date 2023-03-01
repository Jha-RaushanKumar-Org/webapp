module.exports = (sequelize, DataTypes) => {
  const Images = sequelize.define(
    "images", {
      image_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        readOnly: true,
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        readOnly: true,
        references: {
          model: "product",
          key: "id",
        },
      },
      file_name: {
        type: DataTypes.STRING,
        allowNull: false,
        readOnly: true,
      },
      date_created: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        readOnly: true,
      },
      s3_bucket_path: {
        type: DataTypes.STRING,
        allowNull: false,
        readOnly: true,
      },
    }, {
      timestamps: false
    }
  );

  Images.associate = (models) => {
    Images.belongsTo(models.Product, {
      foreignKey: "product_id",
      onDelete: "CASCADE",
    });
  };

  return Images;
};