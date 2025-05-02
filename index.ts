

import express from "express";
import dotenv from "dotenv";
import connectDB from "./Configs/db";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoutes from "./Route/userRoute";
import doctorRoute from "./Route/doctorRoute";
import adminRoute from "./Route/adminRoute";
import conversationRoute from "./Route/conversationRoute";
import http from "http";
import initWebSocket from "./Utils/webSocket";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

connectDB();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],     
    credentials: true,
}));


app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://curaconnect-nine.vercel.app");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
  });
  

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    next();
});

app.use("/user", userRoutes);
app.use("/doctor", doctorRoute);
app.use("/admin", adminRoute);
app.use("/chat", conversationRoute);



const server = http.createServer(app);
initWebSocket(server);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
