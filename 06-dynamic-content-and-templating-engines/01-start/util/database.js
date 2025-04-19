const mysql = require("mysql2");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    database: "node-complete",
    password: process.env.DB_PASSWORD,
});
module.exports = pool.promise();
