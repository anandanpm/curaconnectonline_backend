"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const conversationController_1 = require("../Controllers/conversationController");
const router = express_1.default.Router();
router.post("/send", conversationController_1.conversationController.sendMessage.bind(conversationController_1.conversationController));
router.get("/messages", conversationController_1.conversationController.getMessages.bind(conversationController_1.conversationController));
exports.default = router;
