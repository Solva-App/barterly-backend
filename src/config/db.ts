import logger from "@/utils/logger";
import dotenv from "dotenv";
import { Dialect, Sequelize } from "sequelize";

dotenv.config();

const dbName = process.env.DB_NAME as string;
const dbUser = process.env.DB_USER as string;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbPort = Number(process.env.DB_PORT);
const dbDialect = process.env.DB_DIALECT as Dialect;

// Initialize Sequelize instance
export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: dbDialect,
  logging: process.env.NODE_ENV === "development" ? logger.info : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

/**
 * Helper function to test the connection and sync models
 */
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info("MySQL Database connection established successfully via Sequelize");

    // Synchronize all defined models with the database
    await sequelize.sync();
  } catch (error) {
    logger.error("Unable to connect to the MySQL database:", error);
    process.exit(1);
  }
};

export default sequelize;
