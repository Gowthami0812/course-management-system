
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const email = 'gowthamivelumani1@gmail.com';
    const password = process.env.ADMIN_PASSWORD;

    if (!password) {
      throw new Error('ADMIN_PASSWORD is missing from .env');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      existingUser.role = 'admin';
      existingUser.password = hashedPassword;
      await existingUser.save();
      console.log('Admin account and password updated successfully.');
    } else {
      await User.create({
        name: 'Gowthami',
        email,
        password: hashedPassword,
        role: 'admin',
      });

      console.log('Admin account created successfully.');
    }
  } catch (error) {
    console.error('Admin setup failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
