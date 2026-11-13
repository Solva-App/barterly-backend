import { sequelize } from "@/config/db";
import { DataTypes, Model, Optional } from "sequelize";

export interface ListingAttributes {
  id: string;
  owner_id: string;
  title: string;
  category: string;
  state: string;
  want: string;
  image_urls: string[];
  status: "Ready to Swap" | "In Negotiation" | "Swapped";
  createdAt?: Date;
  updatedAt?: Date;
}

export type ListingCreationAttributes = Optional<
  ListingAttributes,
  "id" | "status" | "createdAt" | "updatedAt"
>;

export class Listing
  extends Model<ListingAttributes, ListingCreationAttributes>
  implements ListingAttributes
{
  declare id: string;
  declare owner_id: string;
  declare title: string;
  declare category: string;
  declare state: string;
  declare want: string;
  declare image_urls: string[];
  declare status: "Ready to Swap" | "In Negotiation" | "Swapped";
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Listing.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    owner_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    want: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image_urls: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    status: {
      type: DataTypes.ENUM("Ready to Swap", "In Negotiation", "Swapped"),
      defaultValue: "Ready to Swap",
    },
  },
  {
    sequelize,
    tableName: "listings",
    timestamps: true,
  }
);
