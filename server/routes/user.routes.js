const express = require("express");
const auth = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/profile", auth, (req, res) => {
  res.json({
    message: "Protected data",
    user: req.user,
  });
});

module.exports = router;
