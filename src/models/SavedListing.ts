import { sequelize } from "@/config/db";
import { DataTypes, Model } from "sequelize";

interface SavedListingAttributes {
  user_id: string;
  listing_id: string;
}

export class SavedListing
  extends Model<SavedListingAttributes, SavedListingAttributes>
  implements SavedListingAttributes
{
  declare user_id: string;
  declare listing_id: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

SavedListing.init(
  {
    user_id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      allowNull: false,
    },
    listing_id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "saved_listings",
    timestamps: true,
  }
);
