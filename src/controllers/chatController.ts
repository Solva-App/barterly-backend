import { Response } from "express";
import { Op } from "sequelize";
import { Chat } from "@/models/Chat";
import { Message } from "@/models/Message";
import { Listing } from "@/models/Listing";
import { Dispute } from "@/models/Dispute";
import { User } from "@/models/User";
import { catchAsync } from "@/utils/catchAsync";
import { AuthRequest } from "@/middleware/authMiddleware";
import { success, created, badRequest, notFound, forbidden } from "@/utils/response";
import { io } from "@/config/socket";
import { sendChatNotificationEmail } from "@/utils/email";
import logger from "@/utils/logger";

export const getUserChats = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const chats = await Chat.findAll({
    where: {
      [Op.or]: [{ initiator_id: userId }, { owner_id: userId }],
    },
    order: [["updatedAt", "DESC"]],
  });

  return success(res, "User chats fetched successfully", { chats });
});

export const createOrGetChat = catchAsync(async (req: AuthRequest, res: Response) => {
  const initiatorId = req.user!.id;
  const { listing_id, offered_listing_id } = req.body;

  if (!listing_id) {
    return badRequest(res, "listing_id is required");
  }

  const listing = await Listing.findByPk(listing_id);
  if (!listing) {
    return notFound(res, "Listing not found");
  }

  if (listing.owner_id === initiatorId) {
    return badRequest(res, "You cannot initiate a chat on your own listing");
  }

  if (offered_listing_id) {
    const offeredListing = await Listing.findByPk(offered_listing_id);
    if (!offeredListing || offeredListing.owner_id !== initiatorId) {
      return badRequest(res, "Invalid offered listing");
    }
  }

  let chat = await Chat.findOne({
    where: {
      listing_id,
      initiator_id: initiatorId,
    },
  });

  if (!chat) {
    chat = await Chat.create({
      listing_id,
      offered_listing_id: offered_listing_id || null,
      initiator_id: initiatorId,
      owner_id: listing.owner_id,
      status: "active",
      initiator_unread: 0,
      owner_unread: 0,
    });
  }

  return created(res, "Chat retrieved or initialized successfully", { chat });
});

export const getChatById = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const userId = req.user!.id;

  const chat = await Chat.findByPk(id);
  if (!chat) {
    return notFound(res, "Chat thread not found");
  }

  if (chat.initiator_id !== userId && chat.owner_id !== userId) {
    return forbidden(res, "You do not have access to this chat");
  }

  return success(res, "Chat details fetched successfully", { chat });
});

export const getChatMessages = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const userId = req.user!.id;

  const chat = await Chat.findByPk(id);
  if (!chat) {
    return notFound(res, "Chat thread not found");
  }

  if (chat.initiator_id !== userId && chat.owner_id !== userId) {
    return forbidden(res, "You do not have access to this chat");
  }

  const messages = await Message.findAll({
    where: { chat_id: id },
    order: [["createdAt", "ASC"]],
  });

  return success(res, "Messages fetched successfully", { messages });
});

export const sendChatMessage = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const senderId = req.user!.id;
  const { text } = req.body;

  if (!text || typeof text !== "string" || !text.trim()) {
    return badRequest(res, "Message text cannot be empty");
  }

  const chat = await Chat.findByPk(id);
  if (!chat) {
    return notFound(res, "Chat thread not found");
  }

  if (chat.initiator_id !== senderId && chat.owner_id !== senderId) {
    return forbidden(res, "You do not have access to send messages in this chat");
  }

  if (chat.status === "swapped") {
    return badRequest(res, "Cannot send messages in a completed swap");
  }

  const message = await Message.create({
    chat_id: id,
    sender_id: senderId,
    text: text.trim(),
  });

  const recipientId = senderId === chat.initiator_id ? chat.owner_id : chat.initiator_id;

  if (senderId === chat.initiator_id) {
    chat.owner_unread += 1;
  } else {
    chat.initiator_unread += 1;
  }
  await chat.save();

  if (io) {
    io.to(`chat:${id}`).emit("new_message", message);
    io.to(`user:${recipientId}`).emit("chat_notification", {
      chat_id: id,
      message,
    });
  }

  try {
    const [recipient, listing] = await Promise.all([
      User.findByPk(recipientId),
      Listing.findByPk(chat.listing_id),
    ]);

    if (recipient && listing) {
      await sendChatNotificationEmail(
        recipient.email,
        recipient.name,
        req.user!.username,
        listing.title
      );
    }
  } catch (err) {
    logger.warn(`Chat notification email failed for chat ${id}:`, err);
  }

  return created(res, "Message sent successfully", { message });
});

export const markChatAsRead = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const userId = req.user!.id;

  const chat = await Chat.findByPk(id);
  if (!chat) {
    return notFound(res, "Chat thread not found");
  }

  const now = new Date();
  if (userId === chat.initiator_id) {
    chat.initiator_unread = 0;
    chat.initiator_read_at = now;
  } else if (userId === chat.owner_id) {
    chat.owner_unread = 0;
    chat.owner_read_at = now;
  } else {
    return forbidden(res, "You do not have access to this chat");
  }

  await chat.save();

  if (io) {
    io.to(`chat:${id}`).emit("messages_read", {
      chat_id: id,
      read_by: userId,
      read_at: now,
    });
  }

  return success(res, "Chat marked as read");
});

export const completeSwap = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const userId = req.user!.id;
  const { rating } = req.body;

  if (rating !== undefined && (typeof rating !== "number" || rating < 1 || rating > 5)) {
    return badRequest(res, "Rating must be a number between 1 and 5");
  }

  const chat = await Chat.findByPk(id);
  if (!chat) {
    return notFound(res, "Chat thread not found");
  }

  if (chat.initiator_id !== userId && chat.owner_id !== userId) {
    return forbidden(res, "You do not have access to this chat");
  }

  if (chat.status === "disputed") {
    return badRequest(res, "Cannot complete a swap while a dispute is active");
  }

  chat.status = "swapped";
  if (rating !== undefined) {
    if (userId === chat.initiator_id) {
      chat.initiator_rating = rating;
    } else {
      chat.owner_rating = rating;
    }
  }

  await chat.save();

  if (io) {
    io.to(`chat:${id}`).emit("swap_completed", {
      chat_id: id,
      completed_by: userId,
    });
  }

  return success(res, "Swap marked as completed successfully", { chat });
});

export const raiseDispute = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const userId = req.user!.id;
  const { note } = req.body;

  if (!note || typeof note !== "string" || !note.trim()) {
    return badRequest(res, "Dispute note is required");
  }

  const chat = await Chat.findByPk(id);
  if (!chat) {
    return notFound(res, "Chat thread not found");
  }

  if (chat.initiator_id !== userId && chat.owner_id !== userId) {
    return forbidden(res, "You do not have access to this chat");
  }

  if (chat.status === "disputed") {
    return badRequest(res, "A dispute has already been raised for this chat");
  }

  const dispute = await Dispute.create({
    chat_id: id,
    user_id: userId,
    note: note.trim(),
  });

  chat.status = "disputed";
  await chat.save();

  if (io) {
    io.to(`chat:${id}`).emit("swap_disputed", {
      chat_id: id,
      disputed_by: userId,
      note: note.trim(),
    });
  }

  return created(res, "Dispute raised successfully", { dispute });
});
