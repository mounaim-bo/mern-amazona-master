import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/userModel.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const adminExists = await User.findOne({ email: 'admin@example.com' });

    if (adminExists) {
      console.log('Admin already exists:', adminExists.email);
    } else {
      const admin = new User({
        name: 'Admin',
        email: 'admin@example.com',
        password: bcrypt.hashSync('123456', 8),
        isAdmin: true,
      });
      await admin.save();
      console.log('Admin user created:', admin.email);
    }
    process.exit();
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
