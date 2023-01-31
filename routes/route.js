const userControl = require('../controllers/userController');

module.exports = (app) => {
    app.post("/v1/user", userControl.createUser);
    app.get("/v1/user/:id", userControl.getUser);
    app.put("/v1/user/:id", userControl.updateUser);
};
