const hashPassword = require('../utils');
const bcrypt = require('bcrypt');
const db = require("../config/sequalize");
const User = db.models.User;
const basicAuthentication = require('../utils');
const comparePasswords = require('../utils');
const logger = require('../logging');
const StatsD = require("node-statsd");
const metricCounter = new StatsD({
    host: "localhost",
    port: 8125
});

exports.createUser = async function (req, res) {
    logger.info("User Creation Post Call");
    metricCounter.increment('POST/v1/user');
    try {
        const fields = req.body;
        for (const key in fields) {
            if (
                key !== "first_name" &&
                key !== "last_name" &&
                key !== "password" &&
                key !== "username"
            ) {
                logger.error("Not a valid request, Invalid fields provided");
                return res.status(400).send({
                    error: "Invalid field in request body",
                });
            }
        }

        if (
            !req.body.username ||
            !req.body.password ||
            !req.body.first_name ||
            !req.body.last_name
        ) {
            logger.error("Null field in request");
            return res.status(400).send({
                error: "Null field in request body",
            });
        }
        const userMail = req.body.username;
        const emailRegex =
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (emailRegex.test(userMail)) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const {
                username,
                first_name,
                last_name
            } = req.body;

            const checkEmail = await User.findOne({
                where: {
                    username: username
                }
            });
            if (checkEmail) {
                logger.error("Duplicate email provided");
                return res.status(400).send({
                    error: "Duplicate email",
                });
            }

            const user = await User.create({
                username: username,
                password: hashedPassword,
                first_name: first_name,
                last_name: last_name,
                account_created: new Date().toISOString(),
                account_updated: new Date().toISOString(),
            });
            logger.info('User successfully created');
            res.status(201).send({
                id: user.id,
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
                account_created: user.account_created,
                account_updated: user.account_updated,
            });
            console.log(user);
        } else {
            logger.error("Not a valid email");
            throw Error("Please enter valid email");
        }
    } catch (err) {
        res.status(400).json({
            message: "Bad Request",
            error: err.message
        });
    }

}

exports.getUser = async function (req, res) {
    logger.info("User Retrieval Get Call");
    metricCounter.increment('GET/v1/user/userId');
    try {
        const id = req.params.userId;
        const results = await User.findOne({
            where: {
                id: id
            }
        });
        res.status(200).send({
            id: results.dataValues.id,
            username: results.dataValues.username,
            first_name: results.dataValues.first_name,
            last_name: results.dataValues.last_name,
            account_created: results.dataValues.account_created,
            account_updated: results.dataValues.account_updated,
        });
    } catch (err) {
        res.status(500);
        console.log(err);
    }

}

exports.updateUser = async function (req, res) {
    logger.info("User Update Put Call");
    metricCounter.increment('PUT/v1/user/userId'); {
        try {
            const fields = req.body;
            for (const key in fields) {
                if (key !== "first_name" && key !== "last_name" && key !== "password" && key != "username") {
                    logger.error("Invalid field in request");
                    return res.status(400).send({
                        error: "Invalid field in request body",
                    });
                }
            }
            if (!req.body.password || !req.body.first_name || !req.body.last_name) {
                logger.error("Missing field in request");
                return res.status(400).send({
                    error: "Required field missing",
                });
            }

            const {
                password,
                first_name,
                last_name
            } = req.body;
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const id = req.params.userId;

            const updatedUser = await User.update({
                password: hashedPassword,
                first_name: first_name,
                last_name: last_name,
                account_updated: new Date().toISOString(),
            }, {
                where: {
                    id: id
                }
            });
            logger.info('User successfully updated');
            res.status(204).send({
                message: "user updated"
            });
        } catch (err) {
            res.status(400).json({
                message: "Bad Request",
                error: err.message
            });
            console.log(err);
        }
    }

}