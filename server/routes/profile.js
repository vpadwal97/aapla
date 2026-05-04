const express = require("express");
const firebaseAuth = require("../middleware/firebaseAuth.middleware");

const router = express.Router();

// Protected route using Firebase
router.get("/profile", firebaseAuth, (req, res) => {
  res.json({
    message: "Protected route (Firebase Auth)",
    user: req.user,
  });
});

module.exports = router;
