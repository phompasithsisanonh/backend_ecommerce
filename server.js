const express = require("express");
const app = express();
const PORT = 5000;
const cors = require("cors");
const routers = require("./routers/routers.js");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const connectDB =require("./database/database.js");
require("dotenv").config();
const socket = require('socket.io')
const http = require('http')
const server = http.createServer(app)
const adminSellerMsgSchema =require('./models/chat/adminSeller.js')
app.use(
  cors({
    origin:[ 'http://localhost:3000' , 'http://localhost:3001'],
    credentials: true,
  })
);
const io = socket(server, {
  cors: {
      origin: '*',
      credentials: true
  }
})
// ตั้งค่า Socket.IO

app.use(bodyParser.json());
app.use(cookieParser());
app.use("/api", routers);

const server_two =async()=>{
  try {
    await connectDB(process.env.MONGODB_URL);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("DB connection error:", error);
    process.exit(1);
  }
}
server_two();
server.listen(PORT, () => console.log(`server connect in port ${PORT}`));
