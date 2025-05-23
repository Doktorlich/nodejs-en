const path = require("node:path");
const fs = require("node:fs");

const clearImage = filePath => {
    filePath = path.join(__dirname, "..", filePath);
    fs.unlink(filePath, err => console.log(err));
};

module.exports = clearImage;
