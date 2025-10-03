require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected:', mongoose.connection.host.split('.')[0]);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'users' });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function countAllUsers() {
  await connectDB();

  const totalUsers = await User.countDocuments();
  console.log(`\n📊 Total Users in Database: ${totalUsers}`);

  // Group by role
  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);

  console.log('\n👥 Users by Role:');
  usersByRole.forEach(role => {
    console.log(`   ${role._id}: ${role.count}`);
  });

  // Get first 10 users to verify
  const sampleUsers = await User.find({}, 'name email role createdAt').limit(10).lean();
  console.log('\n🔍 Sample Users (first 10):');
  sampleUsers.forEach((user, i) => {
    console.log(`   ${i+1}. ${user.name} (${user.email}) - ${user.role}`);
  });

  mongoose.connection.close();
}

countAllUsers().catch(console.error);