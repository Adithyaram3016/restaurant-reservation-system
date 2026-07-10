const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Table = require('../models/Table');
const Reservation = require('../models/Reservation');

// Load environment variables from backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const tablesData = [
  { tableNumber: 1, capacity: 2 },
  { tableNumber: 2, capacity: 2 },
  { tableNumber: 3, capacity: 4 },
  { tableNumber: 4, capacity: 4 },
  { tableNumber: 5, capacity: 6 },
  { tableNumber: 6, capacity: 6 },
  { tableNumber: 7, capacity: 8 },
  { tableNumber: 8, capacity: 8 },
  { tableNumber: 9, capacity: 2 },
  { tableNumber: 10, capacity: 4 },
  { tableNumber: 11, capacity: 4 },
  { tableNumber: 12, capacity: 10 },
];

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tablemaster';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({ email: 'admin@tablemaster.com' });
    await Table.deleteMany({});
    await Reservation.deleteMany({});
    console.log('Cleared existing tables, reservations, and admin user.');

    // Seed tables
    const seededTables = await Table.insertMany(tablesData);
    console.log(`Seeded ${seededTables.length} tables.`);

    // Seed admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@tablemaster.com',
      password: 'admin123', // Auto-hashed by pre-save hook
      role: 'admin'
    });
    await admin.save();
    console.log('Seeded admin user (admin@tablemaster.com / admin123).');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
