const jwt = require("jsonwebtoken");

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_SECRET, {
    expiresIn: "1m",
  });
}

function generateRefreshToken(user) {
  return jwt.sign(user, process.env.REFRESH_SECRET, {
    expiresIn: "7d",
  });
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.REFRESH_SECRET);
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.ACCESS_SECRET);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
};
