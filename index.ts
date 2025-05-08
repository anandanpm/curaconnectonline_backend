

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
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],     
    credentials: true,
}));


app.options('*', cors());

  

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    next();
});

app.use("/user/api", userRoutes);
app.use("/doctor/api", doctorRoute);
app.use("/admin/api", adminRoute);
app.use("/chat/api", conversationRoute);



const server = http.createServer(app);
initWebSocket(server);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
