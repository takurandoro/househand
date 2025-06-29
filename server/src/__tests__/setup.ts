import { config } from 'dotenv';
import mongoose from 'mongoose';

// Load test environment variables
config({ path: '.env.test' });

// Set test environment variables if not provided
process.env.PORT = process.env.PORT || '5000';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/househand_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// Configure Mongoose for testing
mongoose.set('strictQuery', true);

// Global MongoDB test connection options
export const mongoTestOptions = {
  connectTimeoutMS: 10000, // 10 seconds
  socketTimeoutMS: 45000,  // 45 seconds
  serverSelectionTimeoutMS: 10000, // 10 seconds
  heartbeatFrequencyMS: 1000, // 1 second
  maxPoolSize: 10,
  minPoolSize: 1,
};

// Global beforeAll hook for test setup
beforeAll(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!, mongoTestOptions);
    console.log('Connected to test database');
  } catch (error) {
    console.error('Test database connection error:', error);
    throw error;
  }
});

// Global afterAll hook for cleanup
afterAll(async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    console.log('Test database connection closed');
  } catch (error) {
    console.error('Error during test cleanup:', error);
    throw error;
  }
}); 