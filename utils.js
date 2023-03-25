const bcrypt = require('bcrypt');

exports.hashPassword = async (password) => {

    try {
        return await bcrypt.hash(password, 10);
    } catch (error) {
        console.log(error)
    }
}

exports.comparePasswords = async (hashedPassword, password) => {

    return await bcrypt.compare(password, hashedPassword);
}

exports.basicAuthentication = (req) => {

    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        return res.status(401).json("Request Unauthorized");
    }
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    return credentials.split(':');
}