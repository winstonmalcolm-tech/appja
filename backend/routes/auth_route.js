const router = require("express").Router();
const {register, verify, login, refreshToken, logout} = require("../controllers/auth_controller");

router.post("/register", register);

router.get("/verify/:token", verify);

router.post("/login", login);

router.post("/refresh_token", refreshToken);

router.post("/logout", logout);


module.exports = router;