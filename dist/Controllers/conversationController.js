"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conversationController = void 0;
const conversationService_1 = require("../Services/conversationService");
const conversationRepository_1 = require("../Repository/conversationRepository");
class ConversationController {
    constructor(conversationService) {
        this.conversationService = conversationService;
    }
    async sendMessage(req, res) {
        try {
            const { sender, receiver, text } = req.body;
            console.log(sender, receiver, text);
            const conversation = await this.conversationService.sendMessage(sender, receiver, text);
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
            const messages = await this.conversationService.getMessages(sender, receiver);
            console.log(messages, 'this is the messages ');
            res.status(200).json(messages);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to get messages" });
        }
    }
}
exports.conversationController = new ConversationController(new conversationService_1.ConversationService(conversationRepository_1.conversationRepository));
