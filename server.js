require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const connectDB = require("./database/database.js");
const routers = require("./routers/routers");
const http = require("http");
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// เชื่อมต่อ MongoDB
// ใช้ CORS และ Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"], // ตั้งค่าการเข้าถึง
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(bodyParser.json());
app.use(cookieParser());
app.use("/api", routers); // ตั้งค่า router หลัก
const connectDBd = async () => {
  try {
    await connectDB(process.env.MONGODB_URL); // เชื่อมต่อ MongoDB
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("DB connection error:", error);
    process.exit(1);
  }
};

connectDBd(); // เรียกใช้ฟังก์ชั่นเชื่อมต่อกับฐานข้อมูล
// ส่งออก `app` ให้ Vercel ใช้
module.exports = server;
