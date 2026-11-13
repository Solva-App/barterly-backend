import { sequelize } from "@/config/db";
import { DataTypes, Model, Optional } from "sequelize";

interface MessageAttributes {
  id: number;
  chat_id: string;
  sender_id: string;
  text: string;
}

type MessageCreationAttributes = Optional<MessageAttributes, "id">;

export class Message
  extends Model<MessageAttributes, MessageCreationAttributes>
  implements MessageAttributes
{
  declare id: number;
  declare chat_id: string;
  declare sender_id: string;
  declare text: string;

  declare readonly createdAt: Date;
}

Message.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    chat_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    sender_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    text: {
      type: DataTypes.STRING(2000),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "messages",
    updatedAt: false, // Only created_at required per spec
    timestamps: true,
  }
);
