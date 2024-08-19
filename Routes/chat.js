import express from "express";
import {
  addMembers,
  deleteChat,
  getChatDetails,
  getMessages,
  getMyChats,
  getMyGroups,
  leaveGroup,
  newChat,
  removeMember,
  renameGroup,
  sendAttachments
} from "../Controllers/chat.js";
import { isAuthenticated } from "../Middlewares/auth.js";
import { attachmentsMulter } from '../Middlewares/multer.js';
const router = express.Router();

router.use(isAuthenticated)

router.post("/new", newChat);

router.get("/my", getMyChats);

router.get("/my/groups", getMyGroups);

router.put("/addmembers", addMembers);

router.put("/removemember", removeMember);

router.delete("/leave/:id", leaveGroup);

// Send Attachments
router.post(
  "/message",
  attachmentsMulter,
  sendAttachments
);

// Get Messages
router.get("/message/:id", getMessages);

// Get Chat Details, rename,delete
router
  .route("/:id")
  .get(getChatDetails)
  .put(renameGroup)
  .delete(deleteChat);

export default router;
