const express = require("express");
const app = express();
const cors = require("cors");
const routers = require("./routers/routers.js");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const connectDB = require("./database/database.js");
require("dotenv").config();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use("/api", routers);

// เชื่อมต่อ MongoDB
const server_two = async () => {
  try {
    await connectDB(process.env.MONGODB_URL);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("DB connection error:", error);
    process.exit(1);
  }
};
server_two();

// อย่าใช้ `server.listen(PORT)`, ให้ใช้ `module.exports = app`
module.exports = app;
``