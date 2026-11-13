import "dotenv/config";
import http from "http";
import app from "./index";
import { connectDB } from "@/config/db";
import logger from "@/utils/logger";
import { initSocket } from "@/config/socket";

import "@/models/User";
import "@/models/Listing";
import "@/models/Chat";
import "@/models/SavedListing";
import "@/models/Dispute";
import "@/models/Message";
import "@/models/Review";
import "@/models/StrikeLog";
import "@/models/SupportMessage";

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

initSocket(server);

async function startServer(): Promise<void> {
  try {
    await connectDB();

    server.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start the server:", error);
    process.exit(1);
  }
}

startServer();
