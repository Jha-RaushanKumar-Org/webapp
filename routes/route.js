const productAuth = require("./../auth");
const userControl = require('../controllers/userController');
const productControl = require('../controllers/productController');
const imageControl = require('../controllers/imageController');
const upload = require("./../upload");
module.exports = (app) => {
    app.post("/v1/user", userControl.createUser);
    app.get("/v1/user/:id", userControl.getUser);
    app.put("/v1/user/:id", userControl.updateUser);
    app.post("/v1/product", productControl.createProduct);
    app.get("/v1/product/:id", productControl.getProduct);
    app.delete("/v1/product/:id", productControl.deleteProduct);
    app.put("/v1/product/:id", productControl.updateProduct);
    app.patch("/v1/product/:id", productControl.updatePatchProduct);
    app.get("/v1/product/:productId/image", productAuth, imageControl.getAllImages);
    app.get("/v1/product/:productId/image/:imageId", productAuth, imageControl.getImage);
    app.post("/v1/product/:productId/image", productAuth, upload.single("image"), imageControl.addImage);
    app.delete("/v1/product/:productId/image/:imageId", productAuth, imageControl.deleteImage);
};
