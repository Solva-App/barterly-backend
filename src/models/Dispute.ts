import { sequelize } from "@/config/db";
import { DataTypes, Model, Optional } from "sequelize";

interface DisputeAttributes {
  id: string;
  chat_id: string;
  user_id: string;
  note: string;
}

type DisputeCreationAttributes = Optional<DisputeAttributes, "id">;

export class Dispute
  extends Model<DisputeAttributes, DisputeCreationAttributes>
  implements DisputeAttributes
{
  declare id: string;
  declare chat_id: string;
  declare user_id: string;
  declare note: string;

  declare readonly createdAt: Date;
}

Dispute.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    chat_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    user_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    note: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "disputes",
    updatedAt: false,
    timestamps: true,
  }
);
