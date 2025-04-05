const crypto = require("crypto");

const emailTokenGenerator = () => {
    const verificationToken = crypto.randomBytes(32).toString("hex");

    return verificationToken;
}

module.exports = emailTokenGenerator;