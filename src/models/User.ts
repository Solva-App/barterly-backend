import { sequelize } from "@/config/db";
import { DataTypes, Model, Optional } from "sequelize";

interface UserAttributes {
  id: string;
  name: string;
  username: string;
  email: string;
  password_hash: string;
  photo_url?: string | null;
  bio?: string | null;
  phone?: string | null;
  verification_status: string;
  legal_name?: string | null;
  id_type?: string | null;
  id_number?: string | null;
  id_image_path?: string | null;
  selfie_path?: string | null;
  strikes: number;
  flagged: boolean;
  trades_count: number;
  rating_sum: number;
  rating_count: number;
  reset_token_hash?: string | null;
  reset_token_expires?: Date | null;
}

type UserCreationAttributes = Optional<
  UserAttributes,
  | "id"
  | "photo_url"
  | "bio"
  | "phone"
  | "verification_status"
  | "legal_name"
  | "id_type"
  | "id_number"
  | "id_image_path"
  | "selfie_path"
  | "strikes"
  | "flagged"
  | "trades_count"
  | "rating_sum"
  | "rating_count"
  | "reset_token_hash"
  | "reset_token_expires"
>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare name: string;
  declare username: string;
  declare email: string;
  declare password_hash: string;
  declare photo_url: string | null;
  declare bio: string | null;
  declare phone: string | null;
  declare verification_status: string;
  declare legal_name: string | null;
  declare id_type: string | null;
  declare id_number: string | null;
  declare id_image_path: string | null;
  declare selfie_path: string | null;
  declare strikes: number;
  declare flagged: boolean;
  declare trades_count: number;
  declare rating_sum: number;
  declare rating_count: number;
  declare reset_token_hash: string | null;
  declare reset_token_expires: Date | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

User.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    photo_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    verification_status: {
      type: DataTypes.ENUM("NONE", "PENDING", "VERIFIED", "REJECTED"),
      defaultValue: "NONE",
    },
    legal_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    id_type: {
      type: DataTypes.STRING(60),
      allowNull: true,
    },
    id_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    id_image_path: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    selfie_path: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    strikes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    flagged: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    trades_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    rating_sum: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    rating_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    reset_token_hash: {
      type: DataTypes.CHAR(64),
      allowNull: true,
    },
    reset_token_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
  }
);
