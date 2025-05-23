const mysql = require("../config/db_config");
const megabyteConversion = require("../utlis/byte_to_megabyte");
const path = require("path");
const fs = require("fs");

const upload = async (req, res, next) => {

    try {
        const { app_name, app_category, app_description, app_url, icon_url, app_size, imagesArr, supabase_app_id } = req.body;
        
        if (!app_name || !app_category || !app_description) {
            res.status(400);
            throw new Error("Please enter all fields");
        }

        const appCountSQL = "SELECT COUNT(developer_id) as appTotal FROM app_tbl WHERE developer_id = ?;";
        let [rows] = await mysql.query(appCountSQL, [req.id]);

        const appCount = rows[0].appTotal;

        const appNameAvailableSQL = "SELECT COUNT(app_name) as namesCount FROM app_tbl WHERE app_name = ?;";
        [rows] = await mysql.query(appNameAvailableSQL, [app_name]);

        const appNamesCount = rows[0].namesCount;

        const getPlanTypeSQL = "SELECT plan FROM developer_tbl WHERE developer_id = ?;";
        [rows] = await mysql.query(getPlanTypeSQL, [req.id]);

        const planType = rows[0].plan;

        if (appNamesCount > 0) {
            res.status(400);
            throw new Error("App name already taken");
        }

        if (planType == "Hobbyist" && appCount == 3) {
            res.status(403);
            throw new Error("You have reached the maximum amount of uploads, remove existing apps or upgrade plan");
        }

        if (planType == "Standard" && appCount == 10) {
            res.status(403);
            throw new Error("You have reached the maximum amount of uploads, remove existing apps to upload more");
        }

        const apk_size = Math.ceil(megabyteConversion(app_size));

        if (planType == "Hobbyist" && apk_size > 100) {
            res.status(400);
            throw new Error("App size exceeds what current plan offers");
        }

        if (planType == "Standard" && apk_size > 200) {
            res.status(400);
            throw new Error("App size exceeds what current plan offers");
        }

        let sql = "INSERT INTO app_tbl (developer_id, app_name, app_category, app_size, app_url, app_icon_url, app_description, supabase_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?);";

        const [result] = await mysql.query(sql, [req.id, app_name, app_category, apk_size, app_url, icon_url, app_description, supabase_app_id]);

        
        sql = "INSERT INTO image_tbl (app_id, image_url, supabase_id) VALUES (?,?,?);";

        const images = JSON.parse(imagesArr);

        if (images.length > 4) {
            for (let i=0; i<4; i++) { 
                await mysql.query(sql, [result.insertId, images[i].imageUrl, images[i].id]);
            }
        } else {
            for (let i=0; i < images.length; i++) {
                await mysql.query(sql, [result.insertId, images[i].imageUrl, images[i].id]);
            }
        }

        res.status(200).json({message: "Uploaded successfully"});

    } catch (error) {
        console.log(error);
        next(error.message);
    }
}

const download = async (req,res,next) => {
    try {
        const { developerId } = req.body;
        const { appId } = req.params;
        let sql = "";

        sql = "SELECT number_of_downloads FROM app_tbl WHERE app_id = ?";
        let [rows] = await mysql.query(sql, appId);

        const newDownloadCount = rows[0].number_of_downloads + 1;

        sql = "UPDATE app_tbl SET number_of_downloads = ? WHERE app_id = ?";
        await mysql.query(sql, [newDownloadCount, appId]);

        sql = "SELECT email FROM developer_tbl WHERE developer_id = ?";
        [rows] = await mysql.query(sql, [developerId]);

        const devEmail = rows[0].email;

        //Send Email to developer

        res.status(200).json({message: "Success"});
    } catch (error) {
        next(error.message);
    }
}

const updateApp = async (req, res, next) => {
    try {
        const {id} = req.params;
        const { description, deletedImages, app_name, newImages, appUrl, iconUrl, appSize } = req.body;
        let sql = "";

        if (description == null || description == "") {
            res.status(400);
            throw new Error("Please enter a description");
        }

        sql = "UPDATE app_tbl SET app_description = ? WHERE app_id = ?";
        await mysql.query(sql, [description, id]);

        if (deletedImages) {
            const deletedImagesArr = JSON.parse(deletedImages);

            for (let image of deletedImagesArr) {
                sql = "DELETE FROM image_tbl WHERE image_url = ?";
                await mysql.query(sql, image.image_url);
            }
        }

        const app_size = appUrl ? Math.ceil(megabyteConversion(appSize)) : null;

        if (appUrl) {
            sql = "UPDATE app_tbl SET app_size = ?, app_url = ? WHERE app_id = ?";
            await mysql.query(sql, [app_size, appUrl, id]);
        }

        if (iconUrl) {
            sql = "UPDATE app_tbl SET app_icon_url = ? WHERE app_id = ?";
            await mysql.query(sql, [iconUrl, id]);
        }


        if (newImages) {
            const images = JSON.parse(newImages);

            if (images != null) {
                
                sql = "INSERT INTO image_tbl (app_id, image_url, supabase_id) VALUES (?,?,?);";

                for (let image of images) {
                    await mysql.query(sql, [id, image.imageUrl, image.id]);
                }
            }
        }
        

        res.status(200).json({message: "Update succesful"});

    } catch (error) {
        res.status(400);
        console.log(error);
        next(error.message);
    }
} 

const getApps = async (req, res, next) => {

    try {
        const sql = "SELECT app_tbl.*, dev.username FROM app_tbl, developer_tbl AS dev WHERE dev.developer_id = app_tbl.developer_id;";

        const [rows] = await mysql.query(sql);

        res.status(200).json({apps: rows});

    } catch (error) {
        next(error.message);
    }
}

const getApp = async (req, res, next) => {

    //
    try {
        const appId = req.params.id;
        let sql = "";
        let data = {};

        sql = "SELECT app.app_name, app.app_category, app.app_url, app.app_icon_url, app.app_description, app.app_size, app.number_of_downloads, dev.username, dev.developer_id FROM app_tbl AS app, developer_tbl AS dev WHERE dev.developer_id = app.developer_id AND app_id = ?;"
        let [rows] = await mysql.query(sql, [appId]);

        data.app = rows[0];

        sql = "SELECT image_url FROM image_tbl WHERE app_id = ?";
        [rows] = await mysql.query(sql,[appId]);

        data.media = rows;

        sql = "SELECT review.*, dev.username, dev.profile_image, dev.first_name, dev.last_name FROM review_tbl AS review, developer_tbl AS dev WHERE dev.developer_id = review.developer_id AND review.app_id = ?";
        [rows] = await mysql.query(sql, [appId]);

        data.reviews = rows;

        res.status(200).json(data);
    } catch (error) {
        next(error.message);
    }
}



const remove = async (req, res, next) => {
    try {

        const {id} = req.params;

        let sql = "";
        
        sql = "DELETE app_tbl, image_tbl, review_tbl FROM app_tbl LEFT JOIN image_tbl ON app_tbl.app_id = image_tbl.app_id LEFT JOIN review_tbl ON app_tbl.app_id = review_tbl.app_id WHERE app_tbl.app_id =?;";
        await mysql.query(sql, [id]);

        res.status(200).json({message: "Deleted"});

    } catch (error) {
        next(error.message)
    }
}

module.exports = {
    upload,
    remove,
    getApp,
    download,
    updateApp,
    getApps
}