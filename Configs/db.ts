import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }
    await mongoose.connect(process.env.MONGODB_URI); 
    console.log('MongoDB Connected...');
  } catch (err:any) {
    console.error("error",err.message);
    process.exit(1);
  }
};

export default connectDB;