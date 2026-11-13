import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import logger from "@/utils/logger";
import { verifyAccessToken, TokenPayload } from "@/utils/jwt";

interface AuthenticatedSocket extends Socket {
  user?: TokenPayload;
}

export let io: Server;

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(async (socket: AuthenticatedSocket, next) => {
    const token =
      socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("Authentication error: Token missing"));
    }

    try {
      const decoded = await verifyAccessToken(token);
      socket.user = decoded;
      next();
    } catch {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    logger.info(`User connected via Socket.io: ${socket.user?.id}`);

    socket.join(`user:${socket.user?.id}`);

    socket.on("join_chat", (chatId: string) => {
      socket.join(`chat:${chatId}`);
      logger.info(`User ${socket.user?.id} joined chat room: chat:${chatId}`);
    });

    socket.on("leave_chat", (chatId: string) => {
      socket.leave(`chat:${chatId}`);
    });

    socket.on("disconnect", () => {
      logger.info(`User disconnected: ${socket.user?.id}`);
    });
  });

  return io;
};
