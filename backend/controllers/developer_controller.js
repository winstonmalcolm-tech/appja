const mysql = require("../config/db_config");


const getDeveloper = async (req, res, next) => {

    try {
        const {id} = req.params;
        const developerId = req.id ? req.id : id;

        let data = {};

        let sql = " SELECT first_name, last_name, email, username, profile_image, plan FROM developer_tbl WHERE developer_id = ?";
        let [rows] = await mysql.query(sql, [developerId]);

        data.user = rows[0];

        sql = "SELECT * FROM app_tbl WHERE developer_id = ?";
        [rows] = await mysql.query(sql, [developerId]);

        data.apps = rows;

        sql = "SELECT social_name, social_url FROM social_tbl WHERE developer_id = ?";
        [rows] = await mysql.query(sql, [developerId]);

        data.socials = rows;

        res.status(200).json(data);
    } catch (error) {
        console.log(error)
        next(error.message)
    }
}

const updateDeveloper = async (req, res, next) => {
    try {

        const {email, firstName, lastName, username, socials, profileImage} = req.body;
        let sql;

        if (!profileImage) {
            sql = "UPDATE developer_tbl SET first_name = ?, last_name = ?, email = ?, username = ? WHERE developer_id = ?";
            await mysql.query(sql, [firstName, lastName, email, username, req.id]);  
        } else {
            
            sql = "UPDATE developer_tbl SET first_name = ?, last_name = ?, email = ?, username = ?, profile_image = ? WHERE developer_id = ?";
            await mysql.query(sql, [firstName, lastName, email, username, profileImage, req.id]);        
        }


        sql = "UPDATE social_tbl SET social_url = ? WHERE social_name = ? AND developer_id = ?";
        
        for (let social of JSON.parse(socials)) {
            await mysql.query(sql, [social.url, social.name, req.id]);
        }

        res.status(200).json({message: "Updated successfully"});

    } catch (error) {
        console.log(error);
        next(error);
    }
}

const getPlan = async (req, res, next) => {
    try {
        const {id} = req.params;

        const sql = "SELECT plan FROM developer_tbl WHERE developer_id = ?;";
        const [rows] = await mysql.query(sql, [id]);

        res.status(200).json({plan: rows[0].plan});
    } catch (error) {
        next(error.message)
    }
}

module.exports = { getDeveloper, updateDeveloper, getPlan };

