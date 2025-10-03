const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Load environment variables
dotenv.config();

// Database connection
const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env");
  }
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

// Define schemas (same as seed script)
const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  role: String,
  connectedStores: [{ type: mongoose.Schema.Types.ObjectId, ref: "Store" }],
}, { timestamps: true });

const storeSchema = new mongoose.Schema({
  name: String,
  slug: String,
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  tier: String,
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const Store = mongoose.model("Store", storeSchema);

const verifyData = async () => {
  try {
    await connectDB();

    console.log("🔍 Verifying Store Admin to Store connections...\n");

    // Get all store admins
    const storeAdmins = await User.find({ role: "StoreAdmin" }).select('email name connectedStores');
    console.log(`Found ${storeAdmins.length} Store Admins:\n`);

    for (const admin of storeAdmins) {
      console.log(`👤 ${admin.email} (${admin.name})`);
      console.log(`   Connected Stores: ${admin.connectedStores.length}`);

      // Find stores owned by this admin
      const ownedStores = await Store.find({ ownerId: admin._id }).select('name slug tier');
      console.log(`   Owned Stores: ${ownedStores.length}`);

      if (ownedStores.length > 0) {
        ownedStores.forEach(store => {
          console.log(`   📍 ${store.name} (${store.tier} tier)`);
        });
      }

      console.log('');
    }

    // Verify the other way - stores and their owners
    console.log("\n🏪 Verifying Store to Owner connections...\n");

    const stores = await Store.find().populate('ownerId', 'email name role');

    for (const store of stores) {
      console.log(`🏪 ${store.name}`);
      if (store.ownerId) {
        console.log(`   Owner: ${store.ownerId.email} (${store.ownerId.role})`);
      } else {
        console.log(`   ❌ No owner found!`);
      }
      console.log('');
    }

  } catch (error) {
    console.error("❌ Error verifying data:", error);
  } finally {
    mongoose.connection.close();
  }
};

verifyData();