import { sequelize } from "@/config/db";
import { DataTypes, Model, Optional } from "sequelize";

interface SupportMessageAttributes {
  id: string;
  user_id: string;
  subject?: string | null;
  message: string;
}

type SupportMessageCreationAttributes = Optional<SupportMessageAttributes, "id">;

export class SupportMessage
  extends Model<SupportMessageAttributes, SupportMessageCreationAttributes>
  implements SupportMessageAttributes
{
  declare id: string;
  declare user_id: string;
  declare subject: string | null;
  declare message: string;

  declare readonly createdAt: Date;
}

SupportMessage.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    message: {
      type: DataTypes.STRING(2000),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "support_messages",
    updatedAt: false,
    timestamps: true,
  }
);
