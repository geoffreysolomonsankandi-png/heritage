// In: Heritage-Hub/createAdmin.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');

const createAdminAccount = async () => {
  // Connect to the database
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB Connected...');

  // --- Admin User Details ---
  const adminEmail = "admin@heritage.hub";
  const adminPassword = "password123";
  // --------------------------

  try {
    // Check if the admin user already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists.');
      return;
    }

    // Create a new admin user
    const adminUser = new User({
      username: 'admin',
      email: adminEmail,
      password: adminPassword, // The password will be hashed automatically by the model's pre-save hook
      role: 'admin'
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Disconnect from the database
    await mongoose.disconnect();
    console.log('MongoDB Disconnected.');
  }
};

createAdminAccount();