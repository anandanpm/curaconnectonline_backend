import express from "express";
import { conversationController } from "../Controllers/conversationController";

const router = express.Router();

router.post("/send", conversationController.sendMessage.bind(conversationController));
router.get("/messages", conversationController.getMessages.bind(conversationController));

export default router;

