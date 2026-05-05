const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("../db");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    // origin: "http://localhost:3000",
    // origin: /\.csb\.app$/,
    origin: "https://2zst6t-5173.csb.app",
    credentials: true,
  })
);

// DB connect
connectDB();

// Route's
app.use("/auth", authRoutes);
app.use("/api", userRoutes);

app.listen(5000, () => console.log("Server running on 5000"));
