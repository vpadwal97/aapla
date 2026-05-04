const admin = require("../config/firebase");

module.exports = async function firebaseAuth(req, res, next) {
  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    req.user = decoded; // contains uid, email, name etc.
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid Firebase token" });
  }
};
