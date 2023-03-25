const bcrypt = require('bcrypt');
const db = require("./config/sequalize");
const User = db.models.User;
const logger = require('./logging');
const auth = async (req, res, next) => {
    const authorization = req.headers.authorization;
    if (authorization) {
        const id = req.params.userId;
        const encoded = req.get("Authorization");
        const decoded = Buffer.from(
            req.get("Authorization").split(" ")[1],
            "base64"
        ).toString();
        const [username, pass] = decoded.split(":");

        const authenticatedUser = await User.findOne({
            where: {
                username: username
            },
        });

        if (!authenticatedUser) {
            logger.error("Unauthorized user");
            return res.status(401).send({
                message: "Unauthorized"
            });
        }

        const match = await bcrypt.compare(
            pass,
            authenticatedUser.dataValues.password
        );

        if (!match) {
            logger.error("Unauthorized user");
            return res.status(401).send({
                message: "Unauthorized"
            });
        } else {
            if (authenticatedUser.dataValues.id != req.params.userId) {
                logger.error("User Forbidden");
                return res.status(403).send({
                    message: "Forbidden"
                });
            }
            next();
        }
    } else {
        logger.error("Unauthorized user");
        return res.status(401).send({
            error: "Unauthorized: Missing auth headers",
        });
    }
};

module.exports = auth;