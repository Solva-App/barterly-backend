import { sequelize } from "@/config/db";
import { DataTypes, Model, Optional } from "sequelize";

interface ChatAttributes {
  id: string;
  listing_id: string;
  offered_listing_id?: string | null;
  initiator_id: string;
  owner_id: string;
  status: "active" | "swapped" | "disputed";
  initiator_unread: number;
  owner_unread: number;
  initiator_read_at?: Date | null;
  owner_read_at?: Date | null;
  initiator_rating?: number | null;
  owner_rating?: number | null;
}

type ChatCreationAttributes = Optional<
  ChatAttributes,
  | "id"
  | "offered_listing_id"
  | "initiator_read_at"
  | "owner_read_at"
  | "initiator_rating"
  | "owner_rating"
>;

export class Chat extends Model<ChatAttributes, ChatCreationAttributes> implements ChatAttributes {
  declare id: string;
  declare listing_id: string;
  declare offered_listing_id: string | null;
  declare initiator_id: string;
  declare owner_id: string;
  declare status: "active" | "swapped" | "disputed";
  declare initiator_unread: number;
  declare owner_unread: number;
  declare initiator_read_at: Date | null;
  declare owner_read_at: Date | null;
  declare initiator_rating: number | null;
  declare owner_rating: number | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Chat.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    listing_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    offered_listing_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    initiator_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    owner_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "swapped", "disputed"),
      defaultValue: "active",
    },
    initiator_unread: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    owner_unread: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    initiator_read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    owner_read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    initiator_rating: {
      type: DataTypes.TINYINT,
      allowNull: true,
    },
    owner_rating: {
      type: DataTypes.TINYINT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "chats",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["listing_id", "initiator_id"],
      },
    ],
  }
);
