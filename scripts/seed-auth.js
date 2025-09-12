// /scripts/seed-auth.js
import bcrypt from "bcryptjs";
import { connectDB } from "../lib/db.js";
import User from "../models/User.js";
import PasswordReset from "../models/PasswordReset.js";

async function seedAuth() {
  try {
    console.log("Connecting to database...");
    await connectDB();

    console.log("Purging existing auth data...");
    await User.deleteMany({});
    await PasswordReset.deleteMany({});

    const saltRounds = 12;

    console.log("Creating users...");

    // Admin user
    const adminPasswordHash = await bcrypt.hash("AdminPass123!", saltRounds);
    const admin = await User.create({
      name: "System Admin",
      email: "admin@demo.test",
      passwordHash: adminPasswordHash,
      roles: ["admin"],
    });
    console.log("✓ Admin created:", admin.email);

    // Store admin user
    const ownerPasswordHash = await bcrypt.hash("OwnerPass123!", saltRounds);
    const storeAdmin = await User.create({
      name: "Store Owner",
      email: "owner@demo.test",
      passwordHash: ownerPasswordHash,
      roles: ["store-admin"],
      ownsStores: [], // Will be populated in Phase 3
    });
    console.log("✓ Store Admin created:", storeAdmin.email);

    // Regular user
    const userPasswordHash = await bcrypt.hash("UserPass123!", saltRounds);
    const user = await User.create({
      name: "Regular User",
      email: "user@demo.test",
      passwordHash: userPasswordHash,
      roles: ["user"],
    });
    console.log("✓ User created:", user.email);

    console.log("\n🎉 Auth seeding completed successfully!");
    console.log("\nTest credentials:");
    console.log("Admin: admin@demo.test / AdminPass123!");
    console.log("Store Owner: owner@demo.test / OwnerPass123!");
    console.log("User: user@demo.test / UserPass123!");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedAuth();
