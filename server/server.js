const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

// routes
app.use("/auth", require("./routes/auth.routes"));
app.use("/api", require("./routes/user.routes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
