const express = require("express");
const auth = require("../middlewares/auth");
const { signup, signin, updateUserProfile, updatePassword, forgetPassword, resetPassword } = require("../controllers/userController");
const userRouter = express.Router();


userRouter.post("/signup", signup);
userRouter.post("/signin", signin);
userRouter.put('/signin/update-profile',auth,  updateUserProfile)

//Password routes
// Route for updating password
userRouter.put("/update-password", auth, updatePassword);

// Route for forgetting password
userRouter.post("/forget-password", forgetPassword);

// Route for resetting password
userRouter.post("/reset-password", resetPassword);

module.exports = userRouter;