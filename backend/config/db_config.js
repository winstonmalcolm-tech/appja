const mysql = require("mysql2/promise");


//const url = `mysql://avnadmin:${process.env.MYSQLPASSWORD}@mysql-11289512-jobboard-97.g.aivencloud.com:27784/appja_db?ssl-mode=REQUIRED`;

const connection = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB
});

module.exports = connection;


