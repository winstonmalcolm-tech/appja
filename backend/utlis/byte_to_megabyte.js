
const byteToMegabyte = (byte) => {
    return parseFloat((byte / 1048576).toFixed(2));
}

module.exports = byteToMegabyte;