import express from "express";
import {
  getAllMessages,
  getChat,
  getChatList,
  newChat,
  sendMessage,
} from "../Controllers/chat.js";
import { isAuthenticated } from "../Middlewares/auth.js";
const router = express.Router();

router.use(isAuthenticated)

router.post("/new", newChat);

router.get("/:id", getChat);

router.get("/my/all", getChatList);

router.post("/send/message", sendMessage);

router.get("/messages/:id", getAllMessages);

export default router;
