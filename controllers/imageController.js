const db = require("../config/sequalize");
const User = db.models.User;
const Images = db.models.images;
const Product = db.models.Product;
const Crypto = require("crypto");
const logger = require('../logging');
const StatsD = require("node-statsd");
const metricCounter = new StatsD({
    host: "localhost",
    port: 8125
});
const {
  S3Client,
  DeleteObjectCommand,
  PutObjectCommand
} = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: process.env.BUCKET_REGION,

});

const randomImageName = (filename) => {
  const randomString = Crypto.randomBytes(16).toString("hex");
  const ext = filename.split(".").pop();
  return `${randomString}-${filename}`;
};

const getUsername = (req) => {
  const decoded = Buffer.from(
    req.get("Authorization").split(" ")[1],
    "base64"
  ).toString();
  const [username, pass] = decoded.split(":");
  return username;
};

const authUser = async (req, productId) => {
  const username = getUsername(req);
  const userId = await User.findOne({
    where: {
      username: username
    }
  });
  console.log(userId.id);
  const product = await Product.findOne({
    where: {
      id: productId
    }
  });
  console.log(product.owner_user_id);

  if (product.owner_user_id !== userId.id) {
    return false;
  }

  return true;
};

const addImage = async (req, res, next) => {
  logger.info("Image Addition Post Call");
  metricCounter.increment('POST/v1/product/productId/image');
  try {
    const {
      productId
    } = req.params;

    const productIdCheck = parseInt(productId);
    if (productIdCheck != productId) {
      logger.error("Invalid Product Id provided");
      return res.status(400).send({
        error: "Invalid Product Id",
      });
    }

    if (await authUser(req, productId)) {
      const {
        filename,
        path
      } = req.file;

      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: randomImageName(req.file.originalname),
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      const data = await s3.send(new PutObjectCommand(params));

      const image = await Images.create({
        product_id: productId,
        file_name: req.file.originalname,
        s3_bucket_path: "s3://" + process.env.BUCKET_NAME + "/" + params.Key,
        date_created: new Date(),
      });
      res.status(201).send({
        image_id: image.dataValues.image_id,
        product_id: image.dataValues.product_id,
        file_name: image.dataValues.file_name,
        s3_bucket_path: image.dataValues.s3_bucket_path,
        date_created: image.dataValues.date_created,
      });
      logger.info('Image successfully added');
    } else {
      logger.error("User not authorized");
      return res.status(403).json({
        message: "Not authorized to add images to this product.",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Failed to add image"
    });
  }
};

const getImage = async (req, res, next) => {
  logger.info("Image Retrieval Get Call");
  metricCounter.increment('GET/v1/product/productId/image/imageId');
  try {
    const {
      productId,
      imageId
    } = req.params;

    const productIdCheck = parseInt(productId);
    if (productIdCheck != productId) {
      logger.error("Invalid Product Id provided");
      return res.status(400).send({
        error: "Invalid Product Id",
      });
    }

    const id = req.params.imageId;
    const imgIdCheck = parseInt(id);
    if (imgIdCheck != id) {
      logger.error("Invalid Image Id provided");
      return res.status(400).send({
        error: "Invalid Image Id",
      });
    }
    if (await authUser(req, productId)) {
      const image = await Images.findOne({
        where: {
          product_id: productId,
          image_id: imageId
        },
      });
      if (image) {
        logger.info('Image successfully retrieved');
        res.json(image);
      } else {
        logger.error("Image doesn't exist, not found");
        res.status(404).json({
          message: "Image not found"
        });
      }
    } else {
      logger.error("User not authorized");
      return res.status(403).json({
        message: "Not authorized to view images of this product.",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Failed to get product image"
    });
  }
};

const getAllImages = async (req, res, next) => {
  logger.info("Images Retrieval Get Call");
  metricCounter.increment('GET/v1/product/productId/image');
  try {
    const {
      productId
    } = req.params;

    const productIdCheck = parseInt(productId);
    if (productIdCheck != productId) {
      logger.error("Invalid Product Id provided");
      return res.status(400).send({
        error: "Invalid Product Id",
      });
    }

    if (await authUser(req, productId)) {
      const images = await Images.findAll({
        where: {
          product_id: productId
        },
      });
      if (images) {
        logger.info('Images Retrieved successfully');
        res.json(images);
      } else {
        logger.error("Image doesn't exist, not found");
        res.status(404).json({
          message: "Images not found"
        });
      }
    } else {
      logger.error("User not authorized");
      return res.status(403).json({
        message: "Not authorized to view images of this product.",
      });
    }
  } catch (error) {
    res.status(400).json({
      message: "Failed to get product images"
    });
  }
};

const deleteImage = async (req, res, next) => {
  logger.info("Images Deletion delete Call");
  metricCounter.increment('DELETE/v1/product/productId/image/imageId');
  try {
    const {
      productId,
      imageId
    } = req.params;

    const productIdCheck = parseInt(productId);
    if (productIdCheck != productId) {
      logger.error("Invalid Product Id provided");
      return res.status(400).send({
        error: "Invalid Product Id",
      });
    }

    const id = req.params.imageId;
    const imgIdCheck = parseInt(id);
    if (imgIdCheck != id) {
      logger.error("Invalid Image Id provided");
      return res.status(400).send({
        error: "Invalid Image Id",
      });
    }

    if (await authUser(req, productId)) {
      const image = await Images.findOne({
        where: {
          image_id: imageId,
          product_id: productId
        },
      });
      if (!image) {
        logger.error("Image doesn't exist, not found");
        res.status(404).json({
          message: "Image not found"
        });
      } else {
        console.log(image.image_id);
        console.log(image.s3_bucket_path);
        console.log(process.env.BUCKET_NAME);
        var url = image.s3_bucket_path;
        var filename = url.split('/').pop();
        console.log(filename);
        const params = {
          Bucket: process.env.BUCKET_NAME,
          Key: filename,
        };
        const data = await s3.send(
          new DeleteObjectCommand(params)
        );
        await image.destroy();
        logger.info('Image successfully deleted');
        res.status(204).json({
          message: "Image deleted successfully"
        });
      }
    } else {
      logger.error("User not authorized");
      return res.status(403).json({
        message: "Not authorized to delete images of this product.",
      });
    }
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete image"
    });
  }
};

module.exports = {
  addImage,
  getImage,
  getAllImages,
  deleteImage
};