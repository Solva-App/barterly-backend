import { sequelize } from "@/config/db";
import { DataTypes, Model, Optional } from "sequelize";

interface ReviewAttributes {
  id: string;
  chat_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  note?: string | null;
}

type ReviewCreationAttributes = Optional<ReviewAttributes, "id">;

export class Review
  extends Model<ReviewAttributes, ReviewCreationAttributes>
  implements ReviewAttributes
{
  declare id: string;
  declare chat_id: string;
  declare reviewer_id: string;
  declare reviewee_id: string;
  declare rating: number;
  declare note: string | null;

  declare readonly createdAt: Date;
}

Review.init(
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
    reviewer_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    reviewee_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    rating: {
      type: DataTypes.TINYINT,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    note: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "reviews",
    updatedAt: false,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["chat_id", "reviewer_id"],
      },
    ],
  }
);
