const mysql = require("mysql2/promise");


const url = `mysql://avnadmin:${process.env.MYSQL_PASSWORD}@${process.env.MYSQL_HOST}:${process.env.MYSQL_PORT}/${process.env.MYSQL_DB}?ssl-mode=REQUIRED`;

const connection = mysql.createPool(url)
// const connection = mysql.createPool({
//     host: process.env.MYSQL_HOST,
//     user: process.env.MYSQL_USER,
//     password: process.env.MYSQL_PASSWORD,
//     database: process.env.MYSQL_DB
// });

module.exports = connection;


