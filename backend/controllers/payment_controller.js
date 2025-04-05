const mysql = require("../config/db_config");
const paypal = require("../services/paypal");


const makePayment = async (req, res, next) => {
    try {  
        const {planType, cost, benefits} = req.body;

        const paymentUrl = await paypal.createOrder(req.id, planType, cost, JSON.stringify(benefits));

        res.status(200).json({"url": paymentUrl});

    } catch (error) {
        console.log(error)
        next(error.message);
    }
}

const completeOrder = async (req, res, next) => {
    
    try {
        const {id} = req.params;

       await paypal.capturePayment(req.query.token);
        
       const sql = "UPDATE developer_tbl SET plan = ? WHERE developer_id = ?";

        await mysql.query(sql, ["Standard", id]);

        res.redirect(301,process.env.CLIENT_BASE_URL+"/complete-order");
        
    } catch (error) {
        console.log(error);
        next(error.message);
    }
}

module.exports = {
    makePayment,
    completeOrder
}