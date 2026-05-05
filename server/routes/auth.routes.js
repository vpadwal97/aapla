const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/token");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { username, password, userType } = req.body;
    if (!username || !password || !userType) {
      // throw new Error("All fields are require");
      return res.status(401).json({
        message: "Please fill al the required fields",
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashed,
      userType,
      refreshTokens: [],
    });

    res.json({ message: "User created", userId: user._id });
  } catch (error) {
    console.error(error); // log for debugging

    res.status(500).json({
      message: "Something went wrong",
      error: error.message, // optional (avoid exposing sensitive info in production)
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ message: "Invalid user" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Wrong password" });

  const payload = {
    id: user._id,
    username: user.username,
    userType: user.userType,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.refreshTokens.push(refreshToken);
  await user.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  });

  res.json({ accessToken, userType: user.userType });
});

// REFRESH TOKEN
router.post("/refresh", async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(401);

  const user = await User.findOne({ refreshTokens: token });
  if (!user) return res.sendStatus(403);

  try {
    const data = verifyRefreshToken(token);

    const newAccessToken = generateAccessToken({
      id: data.id,
      username: data.username,
      userType: data.userType,
    });

    const newRefreshToken = generateRefreshToken({
      id: data.id,
      username: data.username,
      userType: data.userType,
    });

    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    res.json({ accessToken: newAccessToken });
  } catch {
    res.sendStatus(403);
  }
});

// LOGOUT
router.post("/logout", async (req, res) => {
  const token = req.cookies.refreshToken;

  const user = await User.findOne({ refreshTokens: token });
  if (user) {
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    await user.save();
  }

  res.clearCookie("refreshToken");
  // res.sendStatus(200).json({
  //   message: "Logged out successfully"
  // });
  res.status(200).json({
    message: "Logged out successfully"
  });
});


module.exports = router;
