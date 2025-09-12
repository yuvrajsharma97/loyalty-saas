// Test database connection (CommonJS)
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('MongoDB URI:', MONGODB_URI ? 'Set' : 'Not set');
    
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI not found in environment variables');
    }
    
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    
    console.log('✅ Database connection successful!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();