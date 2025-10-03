const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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

// Define schemas directly in CommonJS
const pointsByStoreSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["User", "StoreAdmin", "SuperAdmin"],
      required: true,
      index: true,
    },
    connectedStores: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
      },
    ],
    pointsByStore: [pointsByStoreSchema],
    preferences: {
      visitApprovedEmail: {
        type: Boolean,
        default: true,
      },
      rewardEmail: {
        type: Boolean,
        default: true,
      },
      promotionEmail: {
        type: Boolean,
        default: false,
      },
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    tier: {
      type: String,
      enum: ["silver", "gold", "platinum"],
      default: "silver",
    },
    rewardConfig: {
      type: {
        type: String,
        enum: ["visit", "spend", "hybrid"],
        required: true,
      },
      pointsPerPound: {
        type: Number,
        default: 0,
        min: 0,
      },
      pointsPerVisit: {
        type: Number,
        default: 0,
        min: 0,
      },
      conversionRate: {
        type: Number,
        required: true,
        default: 100,
      },
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    qrCode: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const visitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    method: {
      type: String,
      enum: ["qr", "manual"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    spend: {
      type: Number,
      default: 0,
      min: 0,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    metadata: {
      ipAddress: String,
      userAgent: String,
      location: {
        latitude: Number,
        longitude: Number,
      },
    },
  },
  {
    timestamps: true,
  }
);

const redemptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    pointsUsed: {
      type: Number,
      required: true,
      min: 1,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    autoTriggered: {
      type: Boolean,
      default: false,
    },
    appliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Create models
const User = mongoose.model("User", userSchema);
const Store = mongoose.model("Store", storeSchema);
const Visit = mongoose.model("Visit", visitSchema);
const Redemption = mongoose.model("Redemption", redemptionSchema);

// UK business types and names for realistic data
const storeTypes = {
  cafe: ["The Daily Grind", "Bean There Coffee", "Roast & Toast", "Morning Brew"],
  salon: ["Glamour Studio", "Hair & Beauty Co", "Style Lounge", "Chic Salon"],
  barber: ["Gentleman's Cut", "Sharp Edge Barbers", "Classic Cuts", "The Barber Shop"],
  bakery: ["Fresh Bread Co", "Sweet Treats Bakery", "The Village Baker"]
};

const ukFirstNames = [
  "James", "Emma", "Oliver", "Charlotte", "William", "Sophie", "Harry", "Amelia",
  "George", "Emily", "Jack", "Jessica", "Noah", "Grace", "Jacob", "Lily",
  "Thomas", "Chloe", "Joshua", "Isabelle"
];

const ukLastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris",
  "Martin", "Thompson", "Wood", "Lewis"
];

const ukCities = [
  "London", "Birmingham", "Manchester", "Liverpool", "Leeds", "Sheffield",
  "Bristol", "Newcastle", "Cardiff", "Edinburgh", "Glasgow", "Brighton",
  "Oxford", "Cambridge", "Bath", "York", "Chester", "Canterbury"
];

// Generate password hash
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

// Generate realistic user data
const generateUsers = async () => {
  const users = [];
  const adminPassword = await hashPassword("admin123");
  const userPassword = await hashPassword("user123");

  // Create 1 Super Admin
  users.push({
    email: "admin@loyaltyos.com",
    passwordHash: adminPassword,
    name: "Super Admin",
    role: "SuperAdmin",
    connectedStores: [],
    pointsByStore: [],
    lastLogin: new Date(),
    preferences: {
      visitApprovedEmail: true,
      rewardEmail: true,
      promotionEmail: true
    }
  });

  // Create 10 Store Admins (one for each store)
  for (let i = 0; i < 10; i++) {
    const firstName = ukFirstNames[i % ukFirstNames.length];
    const lastName = ukLastNames[i % ukLastNames.length];

    users.push({
      email: `store${i + 1}@loyaltyos.com`,
      passwordHash: adminPassword,
      name: `${firstName} ${lastName}`,
      role: "StoreAdmin",
      connectedStores: [], // Will be populated after stores are created
      pointsByStore: [],
      lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last 7 days
      preferences: {
        visitApprovedEmail: true,
        rewardEmail: true,
        promotionEmail: false
      }
    });
  }

  // Create 20 regular users
  for (let i = 0; i < 20; i++) {
    const firstName = ukFirstNames[Math.floor(Math.random() * ukFirstNames.length)];
    const lastName = ukLastNames[Math.floor(Math.random() * ukLastNames.length)];

    users.push({
      email: `user${i + 1}@example.com`,
      passwordHash: userPassword,
      name: `${firstName} ${lastName}`,
      role: "User",
      connectedStores: [], // Will be populated after stores are created
      pointsByStore: [],
      lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
      preferences: {
        visitApprovedEmail: Math.random() > 0.3,
        rewardEmail: Math.random() > 0.2,
        promotionEmail: Math.random() > 0.7
      }
    });
  }

  return users;
};

// Generate realistic store data
const generateStores = (storeAdmins) => {
  const stores = [];
  const allStoreNames = [
    ...storeTypes.cafe,
    ...storeTypes.salon,
    ...storeTypes.barber,
    ...storeTypes.bakery
  ];

  for (let i = 0; i < 10; i++) {
    const storeName = allStoreNames[i];
    const city = ukCities[i % ukCities.length];
    const tier = ["silver", "gold", "platinum"][Math.floor(Math.random() * 3)];

    // Determine store type and reward config
    let rewardConfig;
    if (storeTypes.cafe.includes(storeName) || storeTypes.bakery.includes(storeName)) {
      // Cafes and bakeries: spend-based or hybrid
      rewardConfig = {
        type: Math.random() > 0.5 ? "spend" : "hybrid",
        pointsPerPound: Math.floor(Math.random() * 5) + 1, // 1-5 points per £
        pointsPerVisit: Math.random() > 0.5 ? Math.floor(Math.random() * 10) + 5 : 0, // 5-15 points per visit
        conversionRate: 100 // 100 points = £1
      };
    } else {
      // Salons and barbers: visit-based
      rewardConfig = {
        type: "visit",
        pointsPerPound: 0,
        pointsPerVisit: Math.floor(Math.random() * 20) + 10, // 10-30 points per visit
        conversionRate: 100
      };
    }

    stores.push({
      name: `${storeName} - ${city}`,
      slug: `${storeName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${city.toLowerCase()}`,
      tier,
      rewardConfig,
      ownerId: storeAdmins[i]._id,
      isActive: true,
      qrCode: `QR${Date.now()}${i}` // Simple QR code identifier
    });
  }

  return stores;
};

// Generate visits and redemptions
const generateVisitsAndRedemptions = async (users, stores) => {
  const visits = [];
  const redemptions = [];
  const regularUsers = users.filter(u => u.role === "User");

  // Generate visits for last 3 months
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  for (const user of regularUsers) {
    // Each user visits 1-3 random stores
    const userStores = stores.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1);

    for (const store of userStores) {
      // Connect user to store
      user.connectedStores.push(store._id);

      // Generate 2-8 visits per store
      const visitCount = Math.floor(Math.random() * 7) + 2;
      let totalPoints = 0;

      for (let i = 0; i < visitCount; i++) {
        // Random date in last 3 months
        const visitDate = new Date(threeMonthsAgo.getTime() + Math.random() * (Date.now() - threeMonthsAgo.getTime()));

        let points = 0;
        let spend = 0;

        // Calculate points based on store's reward config
        if (store.rewardConfig.type === "visit") {
          points = store.rewardConfig.pointsPerVisit;
        } else if (store.rewardConfig.type === "spend") {
          spend = Math.floor(Math.random() * 50) + 5; // £5-£55
          points = spend * store.rewardConfig.pointsPerPound;
        } else if (store.rewardConfig.type === "hybrid") {
          spend = Math.floor(Math.random() * 40) + 10; // £10-£50
          points = (spend * store.rewardConfig.pointsPerPound) + store.rewardConfig.pointsPerVisit;
        }

        totalPoints += points;

        const visit = {
          userId: user._id,
          storeId: store._id,
          method: Math.random() > 0.3 ? "qr" : "manual",
          status: Math.random() > 0.1 ? "approved" : "pending", // 90% approved
          points,
          spend,
          approvedBy: store.ownerId,
          approvedAt: visitDate,
          createdAt: visitDate,
          updatedAt: visitDate
        };

        visits.push(visit);
      }

      // Add points to user's pointsByStore
      const existingPoints = user.pointsByStore.find(p => p.storeId.toString() === store._id.toString());
      if (existingPoints) {
        existingPoints.points += totalPoints;
      } else {
        user.pointsByStore.push({
          storeId: store._id,
          points: totalPoints
        });
      }

      // Generate some redemptions (30% chance per store)
      if (Math.random() > 0.7 && totalPoints >= 100) {
        const pointsToRedeem = Math.floor(totalPoints * 0.3); // Redeem 30% of points
        const value = pointsToRedeem / store.rewardConfig.conversionRate; // Convert to £

        redemptions.push({
          userId: user._id,
          storeId: store._id,
          pointsUsed: pointsToRedeem,
          value,
          autoTriggered: Math.random() > 0.7,
          appliedBy: store.ownerId,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
          updatedAt: new Date()
        });

        // Subtract redeemed points
        const userPoints = user.pointsByStore.find(p => p.storeId.toString() === store._id.toString());
        if (userPoints) {
          userPoints.points -= pointsToRedeem;
        }
      }
    }
  }

  return { visits, redemptions };
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Connect to database
    await connectDB();

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Store.deleteMany({});
    await Visit.deleteMany({});
    await Redemption.deleteMany({});

    // Generate and insert users
    console.log("👥 Creating users...");
    const userData = await generateUsers();
    const insertedUsers = await User.insertMany(userData);
    console.log(`✅ Created ${insertedUsers.length} users`);

    // Generate and insert stores
    console.log("🏪 Creating stores...");
    const storeAdmins = insertedUsers.filter(u => u.role === "StoreAdmin");
    const storeData = generateStores(storeAdmins);
    const insertedStores = await Store.insertMany(storeData);
    console.log(`✅ Created ${insertedStores.length} stores`);

    // Update store admins with their store references
    for (let i = 0; i < storeAdmins.length; i++) {
      await User.findByIdAndUpdate(storeAdmins[i]._id, {
        connectedStores: [insertedStores[i]._id]
      });
    }

    // Generate visits and redemptions
    console.log("📊 Creating visits and redemptions...");
    const { visits, redemptions } = await generateVisitsAndRedemptions(insertedUsers, insertedStores);

    const insertedVisits = await Visit.insertMany(visits);
    console.log(`✅ Created ${insertedVisits.length} visits`);

    const insertedRedemptions = await Redemption.insertMany(redemptions);
    console.log(`✅ Created ${insertedRedemptions.length} redemptions`);

    // Update users with final point totals and connected stores
    console.log("🔄 Updating user data...");
    const regularUsers = insertedUsers.filter(u => u.role === "User");
    for (const user of regularUsers) {
      await User.findByIdAndUpdate(user._id, {
        connectedStores: user.connectedStores,
        pointsByStore: user.pointsByStore
      });
    }

    console.log("🎉 Database seeding completed successfully!");
    console.log(`
📈 Summary:
- Users: ${insertedUsers.length} (1 Super Admin, 10 Store Admins, 20 Regular Users)
- Stores: ${insertedStores.length} (Cafes, Salons, Barbers, Bakeries)
- Visits: ${insertedVisits.length}
- Redemptions: ${insertedRedemptions.length}

🔐 Login Credentials:
- Super Admin: admin@loyaltyos.com / admin123
- Store Admins: store1@loyaltyos.com to store10@loyaltyos.com / admin123
- Users: user1@example.com to user20@example.com / user123
    `);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    
    mongoose.connection.close();
  }
};

// Run the seeding
seedDatabase();