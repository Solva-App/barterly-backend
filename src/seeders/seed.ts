import { sequelize } from "@/config/db";
import { Chat } from "@/models/Chat";
import { Listing } from "@/models/Listing";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { CATEGORIES, STATES } from "@/constants/appConstants";

export const seedDatabase = async () => {
  if (process.env.NODE_ENV === "production") {
    console.error("CRITICAL: Seeding is disabled in production environments!");
    process.exit(1);
  }

  try {
    console.log("Starting database seeding...");

    await Chat.destroy({ where: {}, truncate: true, force: true });
    await Listing.destroy({ where: {}, truncate: true, force: true });
    await User.destroy({ where: {}, truncate: true, force: true });

    const defaultPassword = await bcrypt.hash("Password123!", 10);

    const usersData = Array.from({ length: 5 }, (_, i) => ({
      name: `User ${i + 1}`,
      username: `user_${i + 1}`,
      email: `user${i + 1}@example.com`,
      password_hash: defaultPassword,
      verification_status: (i % 2 === 0 ? "VERIFIED" : "NONE") as "VERIFIED" | "NONE",
      photo_url: null,
      strikes: 0,
      flagged: false,
      trades_count: 0,
      rating_sum: 0,
      rating_count: 0,
    }));

    const users = await User.bulkCreate(usersData, { returning: true });
    console.log(`Created ${users.length} users (Password: Password123!)`);

    const statuses = ["Ready to Swap", "In Negotiation", "Swapped"] as const;

    const listingsData = Array.from({ length: 20 }, (_, i) => {
      const owner = users[i % users.length];
      return {
        owner_id: owner.id,
        title: `Item Listing #${i + 1}`,
        category: CATEGORIES[i % CATEGORIES.length],
        state: STATES[i % STATES.length],
        want: `Looking for ${CATEGORIES[(i + 1) % CATEGORIES.length]} items`,
        image_urls: [`https://picsum.photos/seed/listing${i + 1}/600/400`],
        status: statuses[i % statuses.length],
      };
    });

    const listings = await Listing.bulkCreate(listingsData, { returning: true });
    console.log(`Created ${listings.length} listings`);

    const chatsData = Array.from({ length: 10 }, (_, i) => {
      const initiator = users[i % users.length];
      const owner = users[(i + 1) % users.length];
      const listing = listings[i % listings.length];

      return {
        listing_id: listing.id,
        initiator_id: initiator.id,
        owner_id: owner.id,
        status: (i % 2 === 0 ? "active" : "swapped") as "active" | "swapped",
        initiator_unread: i % 2 === 0 ? 1 : 0,
        owner_unread: i % 3 === 0 ? 1 : 0,
      };
    });

    await Chat.bulkCreate(chatsData);
    console.log(`Created ${chatsData.length} chat records`);

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
    throw error;
  }
};

if (process.argv[1]?.includes("seed")) {
  if (process.env.NODE_ENV === "production") {
    console.error("Action blocked: Cannot seed database in production!");
    process.exit(1);
  }

  sequelize
    .authenticate()
    .then(() => seedDatabase())
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Failed to authenticate to the database:", error);
      process.exit(1);
    });
}
