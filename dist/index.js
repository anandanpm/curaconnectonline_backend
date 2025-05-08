"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./Configs/db"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const userRoute_1 = __importDefault(require("./Route/userRoute"));
const doctorRoute_1 = __importDefault(require("./Route/doctorRoute"));
const adminRoute_1 = __importDefault(require("./Route/adminRoute"));
const conversationRoute_1 = __importDefault(require("./Route/conversationRoute"));
const http_1 = __importDefault(require("http"));
const webSocket_1 = __importDefault(require("./Utils/webSocket"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT;
(0, db_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
}));
app.options('*', (0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    next();
});
app.use("/user/api", userRoute_1.default);
app.use("/doctor/api", doctorRoute_1.default);
app.use("/admin/api", adminRoute_1.default);
app.use("/chat/api", conversationRoute_1.default);
const server = http_1.default.createServer(app);
(0, webSocket_1.default)(server);
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
