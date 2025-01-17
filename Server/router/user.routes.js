const { Router } = require("express");
const {
  registerUser,
  loginUser,
  updateUser,
  getAllUsers,
} = require("../controller/userController");
const auth = require("../middleware/auth");
const router = Router();
const UserRouter = router;

UserRouter.post("/register", registerUser);
UserRouter.post("/login", loginUser);
UserRouter.put("/update", auth, updateUser);
UserRouter.get("/all", auth, getAllUsers);

module.exports = UserRouter;
