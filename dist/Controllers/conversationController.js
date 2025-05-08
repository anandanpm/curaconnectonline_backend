"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const conversationService_1 = require("../Services/conversationService");
const conversationRepository_1 = __importDefault(require("../Repository/conversationRepository"));
class conversationController {
    constructor(_conversationService) {
        this._conversationService = _conversationService;
    }
    async sendMessage(req, res) {
        try {
            const { sender, receiver, text } = req.body;
            console.log(sender, receiver, text);
            const conversation = await this._conversationService.sendMessage(sender, receiver, text);
            console.log(conversation, 'this is the conversation');
            res.status(200).json(conversation);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to send message" });
        }
    }
    async getMessages(req, res) {
        try {
            const { sender, receiver } = req.query;
            const messages = await this._conversationService.getMessages(sender, receiver);
            console.log(messages, 'this is the messages ');
            res.status(200).json(messages);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to get messages" });
        }
    }
}
exports.default = new conversationController(new conversationService_1._conversationService(conversationRepository_1.default));
