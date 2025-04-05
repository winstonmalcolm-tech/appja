const mysql = require("../config/db_config");

const newReview = async (req, res, next) => {
    try {
        const { appID, reviewText } = req.body;

        if (!appID || !reviewText) {
            res.status(400);
            throw new Error("Please fill all fields");
        }

        let sql = "INSERT INTO review_tbl (developer_id, app_id, review_text) VALUES (?, ?, ?);";

        await mysql.query(sql, [req.id, appID, reviewText]);

        res.status(201).json({message: "Review posted"});

    } catch (error) {
        next(error.message);
    }
}

const getReviews = async (req, res, next) => {
    try {
        const appID = req.params.appID;

        if (!appID) {
            res.status(400);
            throw new Error("appID missing");
        }

        let sql = "SELECT * FROM review_tbl WHERE app_id = ?";
        
        const [ rows ] = await mysql.query(sql, [appID]);

        res.status(200).json({reviews: rows});
    } catch (error) {
        next(error.message)
    }
}

module.exports = {
    newReview,
    getReviews
}