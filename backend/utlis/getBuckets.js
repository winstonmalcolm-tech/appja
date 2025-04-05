const storage = require("../config/appwrite_config");

const getBuckets = async () => {
    const result = await storage.getBucket(
        '6796e19f0003dd5c526c'
    );

    console.log(result);
}

module.exports = getBuckets;