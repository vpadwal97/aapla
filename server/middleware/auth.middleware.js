const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];

  if (!token) return res.sendStatus(401);

  try {
    const user = jwt.verify(token, process.env.ACCESS_SECRET);
    req.user = user;
    next();
  } catch (err) {
    return res.sendStatus(401);
  }
}

module.exports = authMiddleware;
