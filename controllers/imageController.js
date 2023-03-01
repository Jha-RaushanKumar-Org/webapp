const db = require("../config/sequalize");
const User = db.models.User;
const Images = db.models.images;
const Product = db.models.Product;
const Crypto = require("crypto");

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
  try {
    const {
      productId
    } = req.params;

    const productIdCheck = parseInt(productId);
    if (productIdCheck != productId) {
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
    } else {
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
  try {
    const {
      productId,
      imageId
    } = req.params;

    const productIdCheck = parseInt(productId);
    if (productIdCheck != productId) {
      return res.status(400).send({
        error: "Invalid Product Id",
      });
    }

    const id = req.params.imageId;
    const imgIdCheck = parseInt(id);
    if (imgIdCheck != id) {
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
        res.json(image);
      } else {
        res.status(404).json({
          message: "Image not found"
        });
      }
    } else {
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
  try {
    const {
      productId
    } = req.params;

    const productIdCheck = parseInt(productId);
    if (productIdCheck != productId) {
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
        res.json(images);
      } else {
        res.status(404).json({
          message: "Images not found"
        });
      }
    } else {
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
  try {
    const {
      productId,
      imageId
    } = req.params;

    const productIdCheck = parseInt(productId);
    if (productIdCheck != productId) {
      return res.status(400).send({
        error: "Invalid Product Id",
      });
    }

    const id = req.params.imageId;
    const imgIdCheck = parseInt(id);
    if (imgIdCheck != id) {
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
        res.status(204).json({
          message: "Image deleted successfully"
        });
      }
    } else {
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