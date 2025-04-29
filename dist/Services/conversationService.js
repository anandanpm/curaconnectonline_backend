"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conversationService = exports.ConversationService = void 0;
const conversationRepository_1 = require("../Repository/conversationRepository");
class ConversationService {
    constructor(conversationRepository) {
        this.conversationRepository = conversationRepository;
    }
    async sendMessage(sender, receiver, text) {
        try {
            if (!sender || !receiver || !text) {
                throw new Error('Missing required fields');
            }
            let conversation = await this.conversationRepository.findConversation(sender, receiver);
            const message = {
                text,
                sender,
                seen: false,
                timestamp: new Date()
            };
            if (!conversation) {
                conversation = await this.conversationRepository.createConversation(sender, receiver, message);
            }
            else {
                conversation = await this.conversationRepository.addMessage(conversation._id.toString(), message);
            }
            return conversation;
        }
        catch (error) {
            console.error("Error in sendMessage service:", error);
            throw error;
        }
    }
    async getMessages(sender, receiver) {
        try {
            if (!sender || !receiver) {
                throw new Error('Sender and receiver are required');
            }
            const conversation = await this.conversationRepository.findConversation(sender, receiver);
            if (!conversation) {
                return {
                    _id: null,
                    sender,
                    receiver,
                    messages: []
                };
            }
            return conversation;
        }
        catch (error) {
            console.error("Error in getMessages service:", error);
            throw error;
        }
    }
}
exports.ConversationService = ConversationService;
exports.conversationService = new ConversationService(conversationRepository_1.conversationRepository);
