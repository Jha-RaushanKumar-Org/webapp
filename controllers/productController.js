const hashPassword = require('../utils');
const Sequelize = require("sequelize");
const bcrypt = require('bcrypt');
const db = require("../config/sequalize");
const User = db.models.User;
const Product = db.models.Product;
const Op = Sequelize.Op;
const basicAuthentication = require('../utils');
const comparePasswords = require('../utils');
const Image = db.models.images;
const logger = require('../logging');
const StatsD = require("node-statsd");
const metricCounter = new StatsD({
    host: "localhost",
    port: 8125
});
const {
    S3Client,
    DeleteObjectCommand
} = require("@aws-sdk/client-s3");

const s3 = new S3Client({
    region: process.env.BUCKET_REGION,

});

exports.createProduct = async function (req, res) {
    logger.info("Product Creation Post Call");
    metricCounter.increment('POST/v1/product');
    try {
        const fields = req.body;
        for (const key in fields) {
            if (
                key !== "name" &&
                key !== "description" &&
                key !== "sku" &&
                key !== "manufacturer" &&
                key != "quantity"
            ) {
                logger.error("Not a valid request, Invalid fields provided");
                return res.status(400).send({
                    error: "Invalid field in request body",
                });
            }
        }
        if (
            !req.body.name ||
            !req.body.description ||
            !req.body.sku ||
            !req.body.manufacturer ||
            req.body.quantity == null
        ) {
            logger.error("Missing field in request");
            return res.status(400).send({
                error: "Missing field in request body",
            });
        }
        const username = getUsername(req);
        const {
            name,
            description,
            sku,
            manufacturer,
            quantity
        } = req.body;

        const owner = await User.findOne({
            where: {
                username: username
            }
        });

        if (!(await checkSku(sku))) {
            if (!Number.isInteger(quantity)) {
                logger.error("Invalid quantity datatype(String)");
                return res.status(400).send({
                    error: "Quantity cannot be string",
                });
            }
            const addProduct = await Product.create({
                name: name,
                description: description,
                sku: sku,
                manufacturer: manufacturer,
                quantity: quantity,
                date_added: new Date().toISOString(),
                date_last_updated: new Date().toISOString(),
                owner_user_id: owner.dataValues.id,
            });
            logger.info('Product successfully created');
            res.status(201).send({
                id: addProduct.dataValues.id,
                name: addProduct.dataValues.name,
                description: addProduct.dataValues.description,
                sku: addProduct.dataValues.sku,
                manufacturer: addProduct.dataValues.manufacturer,
                quantity: addProduct.dataValues.quantity,
                date_added: addProduct.dataValues.date_added,
                date_last_updated: addProduct.dataValues.date_last_updated,
                owner_user_id: addProduct.dataValues.owner_user_id,
            });
        } else {
            logger.error("Duplicate SKU provided");
            res.status(400).send({
                error: "Duplicate SKU",
            });
        }
    } catch (err) {
        res.status(400).json({
            message: "Bad Request",
            error: err.message
        });
        console.log(err);
    }

}

function isString(input) {
    return typeof input === 'string' && Object.prototype.toString.call(input) === '[object String]'
}

exports.getProduct = async function (req, res) {
    logger.info("Product Retrieval Get Call");
    metricCounter.increment('GET/v1/product/productId');
    try {
        const id = req.params.productId;

        const pid = parseInt(id);
        if (pid != id) {
            logger.error("Invalid Product Id provided");
            return res.status(400).send({
                error: "Invalid Product Id",
            });
        }

        const results = await Product.findOne({
            where: {
                id: id
            }
        });
        if (results) {
            res.status(200).send({
                id: results.dataValues.id,
                name: results.dataValues.name,
                description: results.dataValues.description,
                sku: results.dataValues.sku,
                manufacturer: results.dataValues.manufacturer,
                quantity: results.dataValues.quantity,
                date_added: results.dataValues.date_added,
                date_last_updated: results.dataValues.date_last_updated,
                owner: results.dataValues.owner_user_id,
            });
        } else {
            logger.error("Product doesn't exist, not found");
            res.status(404).send({
                message: "Not Found"
            });
        }
    } catch (err) {
        res.status(500);
        console.log(err);
    }


}

exports.deleteProduct = async function (req, res) {
    logger.info("Product Deletion Delete Call");
    metricCounter.increment('DELETE/v1/product/productId');
    try {
        const username = getUsername(req);
        const id = req.params.productId;
        const pid = parseInt(id);
        if (pid != id) {
            logger.error("Invalid Product Id provided");
            return res.status(400).send({
                error: "Invalid Product Id",
            });
        }

        const searchProduct = await Product.findOne({
            where: {
                id: id
            }
        });

        if (searchProduct == null) {
            logger.error("Product doesn't exist, not found");
            return res.status(404).send({
                message: "Product Not Found"
            });
        }

        if (await authUser(username, id)) {
            const images = await Image.findAll({
                where: {
                    product_id: id
                }
            });
            if (images && images.length > 0) {
                for (let i = 0; i < images.length; i++) {
                    const params = {
                        Bucket: process.env.BUCKET_NAME,
                        Key: images[i].dataValues.s3_bucket_path.split("/").pop(),
                    };
                    await s3.send(new DeleteObjectCommand(params));
                }
                await Image.destroy({
                    where: {
                        product_id: id
                    }
                });
            }


            const results = await Product.destroy({
                where: {
                    id: id
                }
            });
            logger.info('Product successfully deleted');
            res.status(204).send();
        } else {
            logger.error("User not permitted to deleted this product");
            res.status(403).send({
                message: "Forbidden"
            });
        }
    } catch (err) {
        res.status(500);
        console.log(err);
    }

}

exports.updateProduct = async function (req, res) {
    logger.info("Product Update Put Call");
    metricCounter.increment('PUT/v1/product/productId');
    try {
        const username = getUsername(req);

        const id = req.params.productId;

        const pid = parseInt(id);
        if (pid != id) {
            logger.error("Invalid Product Id provided");
            return res.status(400).send({
                error: "Invalid Product Id",
            });
        }

        const {
            name,
            description,
            sku,
            manufacturer,
            quantity
        } = req.body;

        const searchProduct = await Product.findOne({
            where: {
                id: id
            }
        });

        if (searchProduct == null) {
            logger.error("Product doesn't exist, not found");
            return res.status(404).send({
                message: " Product Not Found"
            });
        }

        if (await authUser(username, id)) {
            const fields = req.body;
            for (const key in fields) {
                if (
                    key !== "name" &&
                    key !== "description" &&
                    key !== "sku" &&
                    key !== "manufacturer" &&
                    key != "quantity"
                ) {
                    return res.status(400).send({
                        error: "Invalid field in request body",
                    });
                }
            }

            if (
                !req.body.name ||
                !req.body.description ||
                !req.body.sku ||
                !req.body.manufacturer ||
                req.body.quantity == null
            ) {
                logger.error("Missing field in request");
                return res.status(400).send({
                    error: "Missing field in request body",
                });
            }

            if (!(await checkSku(sku, id))) {
                if (!Number.isInteger(quantity)) {
                    logger.error("Invalid quantity datatype(String)");
                    return res.status(400).send({
                        error: "Quantity cannot be string",
                    });
                }
                const updateProduct = await Product.update({
                    name: name,
                    description: description,
                    sku: sku,
                    manufacturer: manufacturer,
                    quantity: quantity,
                    date_last_updated: new Date().toISOString(),
                }, {
                    where: {
                        id: id
                    }
                });
                logger.info('Product successfully updated');
                res.status(204).send();
            } else {
                logger.error("Duplicate SKU provided");
                res.status(400).send({
                    error: "Duplicate SKU",
                });
            }
        } else {
            logger.error("User not permitted to deleted this product");
            res.status(403).send({
                message: "Forbidden"
            });
        }
    } catch (err) {
        res.status(400).json({
            message: "Bad Request",
            error: err.message
        });
        console.log(err);
    }

}

exports.updatePatchProduct = async function (req, res) {
    logger.info("Product Update Patch Call");
    metricCounter.increment('PATCH/v1/product/productId');
    try {
        const username = getUsername(req);

        const id = req.params.productId;
        const pid = parseInt(id);
        if (pid != id) {
            logger.error("Invalid Product Id provided");
            return res.status(400).send({
                error: "Invalid Product Id",
            });
        }

        const {
            name,
            description,
            sku,
            manufacturer,
            quantity
        } = req.body;
        const searchProduct = await Product.findOne({
            where: {
                id: id
            }
        });

        if (searchProduct == null) {
            logger.error("Product doesn't exist, not found");
            return res.status(404).send({
                message: " Product Not Found"
            });
        }

        if (await authUser(username, id)) {
            const fields = req.body;
            for (const key in fields) {
                if (
                    key !== "name" &&
                    key !== "description" &&
                    key !== "sku" &&
                    key !== "manufacturer" &&
                    key != "quantity"
                ) {
                    return res.status(400).send({
                        error: "Invalid field in request body",
                    });
                }
            }

            if (
                req.body.name === null ||
                req.body.manufacturer === null ||
                req.body.description === null ||
                req.body.sku === null ||
                req.body.quantity === null
            ) {
                return res
                    .status(400)
                    .send({
                        error: "Value cannot be null"
                    });
            }

            if (
                !req.body.name &&
                !req.body.description &&
                !req.body.sku &&
                !req.body.manufacturer &&
                req.body.quantity == null
            ) {
                return res.status(400).send({
                    error: "Bad Request: Please add atleast one field to update",
                });
            }
            if (sku) {
                if (await checkSku(sku, id)) {
                    logger.error("Duplicate SKU provided");
                    return res.status(400).send({
                        error: "Bad Request: Duplicate SKU",
                    });
                }
            }

            if (quantity) {
                if (!Number.isInteger(quantity)) {
                    logger.error("Invalid quantity datatype(String)");
                    return res.status(400).send({
                        error: "Quantity cannot be string",
                    });
                }
            }
            const item = req.body;
            const patchProduct = await Product.update({
                name: name || searchProduct.dataValues.name,
                description: description || searchProduct.dataValues.description,
                sku: sku || searchProduct.dataValues.sku,
                manufacturer: manufacturer || searchProduct.dataValues.manufacturer,
                quantity: quantity || searchProduct.dataValues.quantity,
                date_added: new Date().toISOString(),
            }, {
                where: {
                    id: id
                },
            });
            logger.info('Product successfully updated');

            res.status(204).send({
                message: "Product Updated"
            });
        } else {
            logger.error("User not permitted to deleted this product");
            res.status(403).send({
                message: "Forbidden"
            });
        }
    } catch (err) {
        res.status(400).json({
            message: "Bad Request",
            error: err.message
        });
        console.log(err);
    }

}

const getUsername = (req) => {
    const decoded = Buffer.from(
        req.get("Authorization").split(" ")[1],
        "base64"
    ).toString();
    const [username, pass] = decoded.split(":");
    return username;
};

const authUser = async (username, id) => {
    const sql1 = await User.findOne({
        where: {
            username: username
        }
    });
    const ownerId1 = sql1.dataValues.id;
    const searchProduct = await Product.findOne({
        where: {
            id: id
        }
    });

    const ownerId2 = searchProduct.dataValues.owner_user_id;

    if (ownerId1 != ownerId2) {
        return false;
    } else {
        return true;
    }
};

const checkSku = async (sku, id) => {
    if (id == null) {
        var sql = await Product.findOne({
            where: {
                sku: sku
            }
        });
    } else {
        var sql = await Product.findOne({
            where: {
                sku: sku,
                id: {
                    [Op.ne]: id
                }
            },
        });
    }
    if (sql) {
        return true;
    } else {
        return false;
    }
};