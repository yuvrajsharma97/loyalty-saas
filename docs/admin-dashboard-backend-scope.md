# Admin Dashboard Backend Development - Complete Scope & Context

## Project Overview
LoyaltyOS is a QR-based loyalty program SaaS platform for UK small businesses. The admin dashboard provides SuperAdmin users with comprehensive platform oversight, analytics, user management, and store administration capabilities.

## Current Tech Stack
- **Framework**: Next.js 14 with App Router
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js
- **Language**: JavaScript (ES modules for models, CommonJS for API routes)
- **Environment**: Node.js

## Database Models & Schema

### User Model (models/User.js)
```javascript
{
  email: String (unique, lowercase, indexed),
  passwordHash: String,
  name: String,
  avatarUrl: String,
  role: Enum ["User", "StoreAdmin", "SuperAdmin"], // SuperAdmin for admin access
  connectedStores: [ObjectId] (ref: "Store"),
  pointsByStore: [{
    storeId: ObjectId (ref: "Store"),
    points: Number (min: 0)
  }],
  preferences: {
    visitApprovedEmail: Boolean,
    rewardEmail: Boolean,
    promotionEmail: Boolean
  },
  lastLogin: Date,
  timestamps: true
}
```

### Store Model (models/Store.js)
```javascript
{
  name: String,
  slug: String (unique, lowercase),
  tier: Enum ["silver", "gold", "platinum"],
  rewardConfig: {
    type: Enum ["visit", "spend", "hybrid"],
    pointsPerPound: Number (min: 0),
    pointsPerVisit: Number (min: 0),
    conversionRate: Number (default: 100)
  },
  ownerId: ObjectId (ref: "User"),
  isActive: Boolean,
  qrCode: String (unique),
  timestamps: true
}
```

### Visit Model (models/Visit.js)
```javascript
{
  userId: ObjectId (ref: "User"),
  storeId: ObjectId (ref: "Store"),
  method: Enum ["qr", "manual"],
  status: Enum ["pending", "approved", "rejected"],
  points: Number (min: 0),
  spend: Number (min: 0),
  approvedBy: ObjectId (ref: "User"),
  approvedAt: Date,
  metadata: {
    ipAddress: String,
    userAgent: String,
    location: { latitude: Number, longitude: Number }
  },
  timestamps: true
}
```

### Redemption Model (models/Redemption.js)
```javascript
{
  userId: ObjectId (ref: "User"),
  storeId: ObjectId (ref: "Store"),
  pointsUsed: Number (min: 1),
  value: Number (min: 0),
  autoTriggered: Boolean,
  appliedBy: ObjectId (ref: "User"),
  timestamps: true
}
```

## Existing Frontend Admin Pages (Currently with Mock Data)

### 1. Admin Dashboard (/app/admin/dashboard/page.js)
**Current Mock Data:**
- Platform stats (stores: 2,847, users: 45,231, visits: 128,492, points: 2.4M)
- Recent stores list with owner emails, tiers, user counts
- Monthly visit and redemption charts (placeholders)

**Required APIs:**
- `GET /api/admin/dashboard/metrics` - Platform overview statistics
- `GET /api/admin/dashboard/analytics` - Chart data for visits/redemptions
- `GET /api/admin/stores/recent` - Recently created stores

### 2. Users Management (/app/admin/users/page.js)
**Current Mock Data:**
- User list with roles (User, StoreAdmin, SuperAdmin)
- Store counts per user, registration dates, status

**Required APIs:**
- `GET /api/admin/users` - Paginated user list with filters
- `PUT /api/admin/users/[id]/status` - Suspend/activate users
- `DELETE /api/admin/users/[id]` - Delete users
- `GET /api/admin/users/[id]` - User details with connected stores

### 3. Stores Management (/app/admin/stores/page.js)
**Current Mock Data:**
- Store list with tiers, user counts, status, creation dates
- Store owner information

**Required APIs:**
- `GET /api/admin/stores` - Paginated store list with filters
- `PUT /api/admin/stores/[id]/status` - Activate/suspend stores
- `PUT /api/admin/stores/[id]/tier` - Update store tiers
- `DELETE /api/admin/stores/[id]` - Delete stores
- `GET /api/admin/stores/[id]/users` - Store's connected users

### 4. Individual Store Details (/app/admin/store/[id]/page.js)
**Current Mock Data:**
- Detailed store metrics and configuration
- Store users, visits, and redemptions tables
- Store settings and reward configuration

**Required APIs:**
- `GET /api/admin/stores/[id]/details` - Complete store information
- `GET /api/admin/stores/[id]/analytics` - Store-specific analytics
- `PUT /api/admin/stores/[id]/config` - Update store configuration

### 5. Usage Analytics (/app/admin/usage/page.js)
**Current Mock Data:**
- Platform-wide usage metrics
- Store performance comparisons
- Growth trends

**Required APIs:**
- `GET /api/admin/analytics/usage` - Platform usage metrics
- `GET /api/admin/analytics/growth` - Growth analytics
- `GET /api/admin/analytics/stores` - Store performance metrics

### 6. Store Owner Creation (/app/admin/store-owner/create/page.js)
**Functionality:**
- Create new store owners and their stores
- Invite system integration

**Required APIs:**
- `POST /api/admin/store-owners` - Create store owner and store
- `POST /api/admin/invites` - Send invitation emails

## Authentication & Authorization

### Middleware Requirements
```javascript
// middleware/auth.js - Extend existing requireUser
export const requireSuperAdmin = (req, res, next) => {
  return requireUser(req, res, (req, res) => {
    if (req.user.role !== 'SuperAdmin') {
      return res.status(403).json({ error: 'Super admin access required' });
    }
    next(req, res);
  });
};
```

### User Roles & Permissions
- **SuperAdmin**: Full platform access, all admin APIs
- **StoreAdmin**: Own store management only
- **User**: No admin access

## Required API Endpoints to Implement

### Dashboard Metrics
```
GET /api/admin/dashboard/metrics
Response: {
  platform: {
    totalStores: Number,
    activeStores: Number,
    totalUsers: Number,
    activeUsers: Number,
    totalVisits: Number,
    approvedVisitsThisMonth: Number,
    totalPointsDistributed: Number,
    totalPointsRedeemed: Number,
    growthRates: {
      stores: Number (percentage),
      users: Number (percentage),
      visits: Number (percentage)
    }
  },
  recentActivity: {
    newStoresThisWeek: Number,
    newUsersThisWeek: Number,
    visitsToday: Number
  }
}
```

### Analytics
```
GET /api/admin/dashboard/analytics?period=30d
Response: {
  visits: {
    data: [Number], // Daily/monthly visit counts
    labels: [String], // Date labels
    total: Number,
    averagePerDay: Number
  },
  redemptions: {
    data: [Number],
    labels: [String],
    total: Number,
    averagePerDay: Number
  },
  stores: {
    data: [Number], // Store creation trend
    labels: [String],
    total: Number
  },
  users: {
    data: [Number], // User registration trend
    labels: [String],
    total: Number
  }
}
```

### User Management
```
GET /api/admin/users?page=1&limit=20&role=all&status=all&search=""
Response: {
  users: [{
    id: String,
    name: String,
    email: String,
    role: String,
    connectedStoresCount: Number,
    totalPoints: Number,
    lastLogin: Date,
    createdAt: Date,
    status: "active" | "suspended"
  }],
  pagination: {
    currentPage: Number,
    totalPages: Number,
    totalUsers: Number,
    hasMore: Boolean
  }
}

PUT /api/admin/users/[id]/status
Body: { status: "active" | "suspended" }

DELETE /api/admin/users/[id]
```

### Store Management
```
GET /api/admin/stores?page=1&limit=20&tier=all&status=all&search=""
Response: {
  stores: [{
    id: String,
    name: String,
    slug: String,
    tier: String,
    owner: {
      id: String,
      name: String,
      email: String
    },
    connectedUsersCount: Number,
    totalVisits: Number,
    totalPointsDistributed: Number,
    isActive: Boolean,
    createdAt: Date
  }],
  pagination: {
    currentPage: Number,
    totalPages: Number,
    totalStores: Number,
    hasMore: Boolean
  }
}

PUT /api/admin/stores/[id]/status
Body: { isActive: Boolean }

PUT /api/admin/stores/[id]/tier
Body: { tier: "silver" | "gold" | "platinum" }

DELETE /api/admin/stores/[id]
```

### Store Details & Analytics
```
GET /api/admin/stores/[id]/details
Response: {
  store: {
    // Complete store object with populated owner
  },
  metrics: {
    connectedUsers: Number,
    totalVisits: Number,
    approvedVisits: Number,
    pendingVisits: Number,
    rejectedVisits: Number,
    totalPointsDistributed: Number,
    totalPointsRedeemed: Number,
    averagePointsPerUser: Number,
    topUsers: [{ name, email, points, visits }] // Top 5
  },
  analytics: {
    visitsLast30Days: { data: [Number], labels: [String] },
    redemptionsLast30Days: { data: [Number], labels: [String] },
    userGrowth: { data: [Number], labels: [String] }
  }
}

GET /api/admin/stores/[id]/users?page=1&limit=20
Response: {
  users: [{
    id: String,
    name: String,
    email: String,
    points: Number,
    visits: Number,
    lastVisit: Date,
    joinedAt: Date
  }],
  pagination: { ... }
}

GET /api/admin/stores/[id]/visits?page=1&limit=20&status=all
GET /api/admin/stores/[id]/redemptions?page=1&limit=20
```

## Database Aggregation Examples

### Platform Metrics Query
```javascript
// Total active stores
const activeStores = await Store.countDocuments({ isActive: true });

// Total users by role
const userStats = await User.aggregate([
  { $group: { _id: "$role", count: { $sum: 1 } } }
]);

// Monthly visits trend
const visitsTrend = await Visit.aggregate([
  { $match: { status: "approved" } },
  { $group: {
    _id: {
      year: { $year: "$createdAt" },
      month: { $month: "$createdAt" }
    },
    count: { $sum: 1 }
  }},
  { $sort: { "_id.year": 1, "_id.month": 1 } }
]);
```

### Store Performance Metrics
```javascript
// Store with user counts
const storeStats = await Store.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "connectedStores",
      as: "connectedUsers"
    }
  },
  {
    $addFields: {
      connectedUsersCount: { $size: "$connectedUsers" }
    }
  },
  {
    $lookup: {
      from: "visits",
      localField: "_id",
      foreignField: "storeId",
      as: "visits"
    }
  },
  {
    $addFields: {
      totalVisits: { $size: "$visits" },
      approvedVisits: {
        $size: {
          $filter: {
            input: "$visits",
            cond: { $eq: ["$$this.status", "approved"] }
          }
        }
      }
    }
  }
]);
```

## Key Implementation Requirements

### 1. Authentication Middleware
- Extend existing auth to check SuperAdmin role
- Protect all admin routes with role-based access

### 2. Pagination & Filtering
- Consistent pagination pattern across all list endpoints
- Search functionality on names, emails
- Filter by status, role, tier, date ranges

### 3. Error Handling
- Consistent error response format
- Proper HTTP status codes
- Detailed error messages for debugging

### 4. Performance Optimizations
- Database indexing for frequent queries
- Aggregation pipelines for complex analytics
- Lean queries where full documents not needed

### 5. Data Validation
- Zod schemas for request validation
- Sanitize user inputs
- Validate ObjectId parameters

## Existing Database Data
The database has been seeded with:
- 31 users (1 SuperAdmin, 10 StoreAdmins, 20 regular users)
- 10 stores across different tiers and business types
- 155+ visits with realistic patterns
- 6+ redemptions

### Login Credentials
- **SuperAdmin**: admin@loyaltyos.com / admin123
- **Store Admins**: store1@loyaltyos.com to store10@loyaltyos.com / admin123
- **Users**: user1@example.com to user20@example.com / user123

## File Structure for Implementation
```
pages/api/admin/
├── dashboard/
│   ├── metrics.js
│   └── analytics.js
├── users/
│   ├── index.js
│   ├── [id]/
│   │   ├── index.js
│   │   └── status.js
├── stores/
│   ├── index.js
│   ├── recent.js
│   └── [id]/
│       ├── index.js
│       ├── details.js
│       ├── users.js
│       ├── visits.js
│       ├── redemptions.js
│       ├── status.js
│       └── tier.js
├── analytics/
│   ├── usage.js
│   ├── growth.js
│   └── stores.js
└── store-owners/
    └── index.js
```

## Success Criteria
1. All admin dashboard pages display real data instead of mock data
2. SuperAdmin can view platform-wide metrics and analytics
3. Complete CRUD operations for users and stores
4. Real-time data updates reflect actual database state
5. Proper authentication and authorization throughout
6. Responsive performance with large datasets
7. Comprehensive error handling and validation

This scope provides everything needed to build a complete admin dashboard backend that integrates seamlessly with the existing frontend and database structure.