const User = require("../models/User");

const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({
        data: {},
        code: 1,
        msg: "Email and password are required",
      });
    }

    const user = new User(req.body);
    await user.save();

    const { _id, username, profilePicture } = user;
    const token = await user.generateAuthToken();

    res.status(201).send({
      data: {
        id: _id,
        username: username,
        email: email,
        profilePicture: profilePicture,
        token: token,
      },
      code: 0,
      msg: "User registered successfully",
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      res.status(409).send({
        data: {},
        code: 1,
        msg: "User with this email is already registered",
      });
    } else {
      console.log(error);
      res.status(400).send({
        data: {},
        code: 1,
        msg: "Server error",
      });
    }
  }
};

const loginUser = async (req, res) => {
  try {
    if ((!req.body.email, !req.body.password)) {
      res.status(400).send({
        data: {},
        msg: "Email and password are required",
        code: 1,
      });
    }

    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const { _id, username, email, profilePicture } = user;

    const token = await user.generateAuthToken();

    res.status(200).send({
      data: {
        id: _id,
        username: username,
        email: email,
        profilePicture: profilePicture,
        token: token,
      },
      code: 0,
      msg: "User logged in successfully",
    });
  } catch (error) {
    res.status(400).send({
      data: {},
      code: 1,
      msg: error.message || "Login failed",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["id", "username", "email", "profilePicture"];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).send({
        data: {},
        code: 1,
        msg: "Invalid updates",
      });
    }

    const user = await User.findByIdAndUpdate(req.body.id, req.body);
    await user.save();

    const { _id, username, email, profilePicture } = user;
    const token = req.header("Authorization").replace("Bearer ", "");

    res.status(200).send({
      data: {
        id: _id,
        username: username,
        email: email,
        profilePicture: profilePicture,
        token: token,
      },
      code: 0,
      msg: "User updated successfully",
    });
  } catch (error) {
    res.status(400).send({
      data: {},
      code: 1,
      msg: "Server error",
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(
      {},
      { _id: 1, email: 1, username: 1, profilePicture: 1,onlineStatus:1,lastSeen:1 }
    );
    const userList = users.map((user) => {
      return {
        id: user._id,
        email: user.email,
        username: user.username,
        profilePicture: user.profilePicture,
        onlineStatus:user.onlineStatus,
        lastSeen:user.lastSeen
      };
    });
    res.status(200).send({
      data: userList,
      code: 0,
      msg: "Users fetched successfully",
    });
  } catch (error) {
    res.status(400).send({
      data: {},
      code: 1,
      msg: "Server error",
    });
  }
};

module.exports = { registerUser, loginUser, updateUser, getAllUsers };
