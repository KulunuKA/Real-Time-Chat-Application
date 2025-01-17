const { Router } = require("express");
const UserRouter = require("./user.routes");
const ChatRouter = require("./chat.routes");

const router = Router();

router.use("/user", UserRouter);
router.use("/chat", ChatRouter);
module.exports = router;
