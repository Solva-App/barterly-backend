import { bucket } from "@/config/firebase";
import { v4 as uuidv4 } from "uuid";
import logger from "@/utils/logger";

const ROOT_FOLDER = "barterly";

export const uploadToFirebase = async (
  file: Express.Multer.File,
  subFolder?: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error("No file provided for upload"));
    }

    const fileExtension = file.originalname.split(".").pop();
    const cleanSubFolder = subFolder?.replace(/^\/+|\/+$/g, "");
    const folderPath = cleanSubFolder ? `${ROOT_FOLDER}/${cleanSubFolder}` : ROOT_FOLDER;
    const fileName = `${folderPath}/${uuidv4()}.${fileExtension}`;
    const fileUpload = bucket.file(fileName);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
      resumable: false,
    });

    stream.on("error", (error) => {
      logger.error("Firebase upload error:", error);
      reject(error);
    });

    stream.on("finish", async () => {
      try {
        await fileUpload.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
        resolve(publicUrl);
      } catch (error) {
        logger.error("Failed to make file public:", error);
        reject(error);
      }
    });

    stream.end(file.buffer);
  });
};