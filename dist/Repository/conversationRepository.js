"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.conversationRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const conversationModel_1 = __importDefault(require("../Model/conversationModel"));
class ConversationRepository {
    transformMessage(msg) {
        return {
            _id: typeof msg._id === 'string' ? msg._id : msg._id?.toString() || new mongoose_1.default.Types.ObjectId().toString(),
            sender: typeof msg.sender === 'string' ? msg.sender : msg.sender.toString(),
            text: msg.text,
            timestamp: msg.timestamp,
            seen: msg.seen
        };
    }
    transformConversation(conversation) {
        return {
            _id: conversation._id.toString(),
            sender: typeof conversation.sender === 'string' ? conversation.sender : conversation.sender.toString(),
            receiver: typeof conversation.receiver === 'string' ? conversation.receiver : conversation.receiver.toString(),
            messages: conversation.messages.map(msg => this.transformMessage(msg))
        };
    }
    async findConversation(sender, receiver) {
        try {
            const conversation = await conversationModel_1.default.findOne({
                $or: [
                    { sender, receiver },
                    { sender: receiver, receiver: sender },
                ],
            });
            if (!conversation)
                return null;
            return this.transformConversation(conversation);
        }
        catch (error) {
            console.error("Error finding conversation:", error);
            throw error;
        }
    }
    async createConversation(sender, receiver, message) {
        try {
            const messageWithId = {
                _id: new mongoose_1.default.Types.ObjectId(),
                ...message
            };
            const conversation = await conversationModel_1.default.create({
                sender,
                receiver,
                messages: [messageWithId]
            });
            return this.transformConversation(conversation);
        }
        catch (error) {
            console.error("Error creating conversation:", error);
            throw error;
        }
    }
    async addMessage(conversationId, message) {
        try {
            const messageWithId = {
                _id: new mongoose_1.default.Types.ObjectId(),
                ...message
            };
            const conversation = await conversationModel_1.default.findByIdAndUpdate(conversationId, { $push: { messages: messageWithId } }, { new: true });
            if (!conversation) {
                throw new Error('Conversation not found');
            }
            return this.transformConversation(conversation);
        }
        catch (error) {
            console.error("Error adding message:", error);
            throw error;
        }
    }
}
exports.conversationRepository = new ConversationRepository();
