const fs = require("node:fs");

const deleteFile = filePath => {
    fs.unlink(filePath, err => {
        if (err) {
            throw err;
        }
    });
};
module.exports = { deleteFile };
