import { Request, Response } from "express";
import {_conversationService } from "../Services/conversationService";
import { IconversationService } from "../Entities/iConversationService";
import  conversationRepository  from "../Repository/conversationRepository";

class conversationController {
    constructor(private _conversationService: IconversationService) { }


    async sendMessage(req: Request, res: Response) {
        try {
            const { sender, receiver, text } = req.body;
            console.log(sender, receiver, text)
            const conversation = await this._conversationService.sendMessage(sender, receiver, text);
            console.log(conversation, 'this is the conversation')
            res.status(200).json(conversation);
        } catch (error) {
            res.status(500).json({ error: "Failed to send message" });
        }
    }

    async getMessages(req: Request, res: Response) {
        try {
            const { sender, receiver } = req.query;
            const messages = await this._conversationService.getMessages(sender as string, receiver as string);
            console.log(messages, 'this is the messages ')
            res.status(200).json(messages);
        } catch (error) {
            res.status(500).json({ error: "Failed to get messages" });
        }
    }
}


export default new conversationController(new _conversationService(conversationRepository));