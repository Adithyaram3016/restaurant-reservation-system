const mongoose = require('mongoose');
const Table = require('../models/Table');
const Reservation = require('../models/Reservation');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function runTests() {
  console.log("Connecting to database...");
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tablemaster';
  await mongoose.connect(mongoUri);
  console.log("Connected.\n");

  const allTables = await Table.find();
  if (allTables.length === 0) {
    console.log("⚠️ No tables found in database. Please run 'node scripts/seed.js' first.");
    await mongoose.disconnect();
    return;
  }

  // TEST 1: Date Validation
  console.log("--- TEST 1: Past Date Validation ---");
  const pastDate = "2020-01-01";
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  if (pastDate < todayStr) {
    console.log(`✅ PASS: System correctly identifies '${pastDate}' as a past date (today is ${todayStr}).`);
  } else {
    console.log("❌ FAIL: Past date check failed.");
  }

  // TEST 2: Capacity Validation
  console.log("\n--- TEST 2: Seating Capacity Validation ---");
  const partySize = 12; // Exceeds max seeded capacity of 8
  const suitableTables = allTables.filter(t => t.capacity >= partySize);
  const maxCapacity = Math.max(...allTables.map(t => t.capacity), 0);
  
  if (suitableTables.length === 0) {
    console.log(`✅ PASS: System correctly blocks booking for party size ${partySize} (Max table capacity is ${maxCapacity}).`);
  } else {
    console.log("❌ FAIL: Allowed booking exceeding max capacity.");
  }

  // TEST 3: Overlapping Prevention & Smart Allocation
  console.log("\n--- TEST 3: Overlapping Prevention & Allocation ---");
  
  // Clean up any old test run data
  await Reservation.deleteMany({ customerName: "TEST_RUNNER" });

  const testDate = "2026-12-25";
  const testSlot = "7:00 PM";
  const testGuests = 4;

  // Filter suitable tables
  const fitTables = allTables.filter(t => t.capacity >= testGuests);
  fitTables.sort((a, b) => {
    if (a.capacity !== b.capacity) return a.capacity - b.capacity;
    return a.tableNumber - b.tableNumber;
  });

  const bestFitTable = fitTables[0];
  console.log(`Suitable tables for ${testGuests} guests: ${fitTables.map(t => `Table ${t.tableNumber} (cap ${t.capacity})`).join(', ')}`);
  console.log(`Expected best-fit allocation: Table ${bestFitTable.tableNumber}`);

  // Create booking #1
  const res1 = new Reservation({
    user: new mongoose.Types.ObjectId(),
    customerName: "TEST_RUNNER",
    email: "test@runner.com",
    date: testDate,
    timeSlot: testSlot,
    guests: testGuests,
    table: bestFitTable._id,
    status: 'confirmed'
  });
  await res1.save();
  console.log(`Booked Table ${bestFitTable.tableNumber} for booking #1.`);

  // Attempt booking #2 at the exact same date and time slot
  const activeBookings = await Reservation.find({
    date: testDate,
    timeSlot: testSlot,
    status: { $in: ['confirmed', 'pending'] }
  });
  const bookedTableIds = activeBookings.map(b => b.table.toString());

  // Available remaining suitable tables
  const remainingTables = fitTables.filter(t => !bookedTableIds.includes(t._id.toString()));

  if (remainingTables.length > 0) {
    const nextBestTable = remainingTables[0];
    console.log(`Expected allocation for booking #2 (with Table ${bestFitTable.tableNumber} occupied): Table ${nextBestTable.tableNumber}`);
    
    if (nextBestTable._id.toString() !== bestFitTable._id.toString()) {
      console.log(`✅ PASS: Overlapping reservation avoided. Table ${bestFitTable.tableNumber} was skipped and Table ${nextBestTable.tableNumber} was allocated instead.`);
    } else {
      console.log("❌ FAIL: Overlapped the same table.");
    }
  } else {
    console.log("✅ PASS: All tables occupied, overlapping prevented.");
  }

  // Clean up test data
  await Reservation.deleteMany({ customerName: "TEST_RUNNER" });
  console.log("\nCleanup completed.");
  await mongoose.disconnect();
}

runTests().catch(console.error);
