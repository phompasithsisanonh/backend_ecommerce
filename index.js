require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const routers = require("./routers/routers.js");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const connectDB = require("./database/database.js");

const PORT =5000;

// เชื่อมต่อ MongoDB
const server_two = async () => {
  app.use(
    cors({
      origin: ["http://localhost:3000", "http://localhost:3001"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
      methods: ["GET", "POST", "PUT", "DELETE"],
    })
  );
  app.get("/", (req, res) => {
    res.send("Welcome to the E-commerce API");
  });
  
  app.get("/api/test", (req, res) => {
    res.json({ message: "API is working!" });
  });
  // Middleware
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use("/api", routers);
  try {
    await connectDB(process.env.MONGODB_URL);
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("DB connection error:", error);
    process.exit(1);
  }
};
server_two().catch((error) => {
  console.error("Setup Error:", error);
  process.exit(1);
});
// ส่งออก `app` เพื่อให้ Vercel ใช้
module.exports = app;
