"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.conversationServiceInstance = exports._conversationService = void 0;
const conversationRepository_1 = __importDefault(require("../Repository/conversationRepository"));
class _conversationService {
    constructor(_conversationRepository) {
        this._conversationRepository = _conversationRepository;
    }
    async sendMessage(sender, receiver, text) {
        try {
            if (!sender || !receiver || !text) {
                throw new Error('Missing required fields');
            }
            let conversation = await this._conversationRepository.findConversation(sender, receiver);
            const message = {
                text,
                sender,
                seen: false,
                timestamp: new Date()
            };
            if (!conversation) {
                conversation = await this._conversationRepository.createConversation(sender, receiver, message);
            }
            else {
                conversation = await this._conversationRepository.addMessage(conversation._id.toString(), message);
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
            const conversation = await this._conversationRepository.findConversation(sender, receiver);
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
exports._conversationService = _conversationService;
exports.conversationServiceInstance = new _conversationService(conversationRepository_1.default);
