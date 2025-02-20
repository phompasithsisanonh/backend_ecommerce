const express = require("express");
const app = express();
const PORT = 5000;
const cors = require("cors");
const routers = require("./routers/routers.js");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const connectDB = require("./database/database.js");
require("dotenv").config();
const http = require("http");
const server = http.createServer(app);
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    optionSuccessStatus: 200,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// ตั้งค่า Socket.IO

app.use(bodyParser.json());
app.use(cookieParser());
app.use("/api", routers);

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
module.exports =server ;