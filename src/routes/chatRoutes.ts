import { Router } from "express";
import {
  getUserChats,
  createOrGetChat,
  getChatById,
  getChatMessages,
  sendChatMessage,
  markChatAsRead,
  completeSwap,
  raiseDispute,
} from "@/controllers/chatController";
import { protect } from "@/middleware/authMiddleware";
import { validate } from "@/middleware/validate";
import {
  createChatSchema,
  sendMessageSchema,
  completeSwapSchema,
  raiseDisputeSchema,
} from "@/validators/chatValidator";

const router = Router();

router.use(protect);

router.get("/", getUserChats);
router.post("/", validate(createChatSchema), createOrGetChat);
router.get("/:id", getChatById);
router.get("/:id/messages", getChatMessages);
router.post("/:id/messages", validate(sendMessageSchema), sendChatMessage);
router.post("/:id/read", markChatAsRead);
router.post("/:id/complete", validate(completeSwapSchema), completeSwap);
router.post("/:id/dispute", validate(raiseDisputeSchema), raiseDispute);

export default router;
