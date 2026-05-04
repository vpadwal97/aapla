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
  const { username, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    password: hashed,
    refreshTokens: [],
  });

  res.json({ message: "User created", userId: user._id });
});

// LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ message: "Invalid user" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Wrong password" });

  const payload = { id: user._id, username: user.username };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.refreshTokens.push(refreshToken);
  await user.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  });

  res.json({ accessToken });
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
    });

    const newRefreshToken = generateRefreshToken({
      id: data.id,
      username: data.username,
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
  res.sendStatus(204);
});

module.exports = router;
