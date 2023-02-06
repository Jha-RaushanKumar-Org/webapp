const userControl = require('../controllers/userController');
const productControl = require('../controllers/productController');
module.exports = (app) => {
    app.post("/v1/user", userControl.createUser);
    app.get("/v1/user/:id", userControl.getUser);
    app.put("/v1/user/:id", userControl.updateUser);
    app.post("/v1/product", productControl.createProduct);
    app.get("/v1/product/:id", productControl.getProduct);
    app.delete("/v1/product/:id", productControl.deleteProduct);
    app.put("/v1/product/:id", productControl.updateProduct);
    app.patch("/v1/product/:id", productControl.updateProduct);
};
