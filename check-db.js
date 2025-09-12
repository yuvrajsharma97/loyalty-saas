// Test database connection
import { connectDB } from './lib/db.js';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    await connectDB();
    console.log('✅ Database connection successful!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();