import { sequelize } from "@/config/db";
import { DataTypes, Model, Optional } from "sequelize";

interface StrikeLogAttributes {
  id: string;
  user_id: string;
  category: string;
  text: string;
}

type StrikeLogCreationAttributes = Optional<StrikeLogAttributes, "id">;

export class StrikeLog
  extends Model<StrikeLogAttributes, StrikeLogCreationAttributes>
  implements StrikeLogAttributes
{
  declare id: string;
  declare user_id: string;
  declare category: string;
  declare text: string;

  declare readonly createdAt: Date;
}

StrikeLog.init(
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
    category: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    text: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "strike_logs",
    updatedAt: false,
    timestamps: true,
  }
);
