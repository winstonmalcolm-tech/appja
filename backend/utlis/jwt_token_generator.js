const jwt = require("jsonwebtoken");

const generateToken = (id) => {
    const accessToken = jwt.sign({id}, process.env.JWT_ACCESS_SECRET, {expiresIn: "15m"});
    const refreshToken = jwt.sign({id}, process.env.JWT_REFRESH_SECRET, {expiresIn: "7d"});
    return {accessToken, refreshToken};
}

module.exports = generateToken;