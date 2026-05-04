const express = require("express");
const User = require("../models/User");
const firebaseAuth = require("../middleware/firebaseAuth.middleware");

const router = express.Router();

// ✅ Sync user after Firebase login
router.post("/sync", firebaseAuth, async (req, res) => {
  try {
    const { uid, email, name, picture, firebase } = req.user;

    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        email,
        name,
        photoURL: picture,
        provider: firebase?.sign_in_provider,
      });
    }

    res.json({
      message: "User synced",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
