const express = require('express');
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

// GET /api/reservations - View reservations
// Customers get their own; Admins get all. Supports optional ?date=YYYY-MM-DD filter.
router.get('/', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const query = {};

    // Filter by role
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    // Filter by date if provided
    if (date) {
      query.date = date;
    }

    const reservations = await Reservation.find(query)
      .populate('table')
      .populate('user', 'name email')
      .sort({ date: 1, timeSlot: 1 });

    res.json(reservations);
  } catch (error) {
    console.error('Fetch reservations error:', error);
    res.status(500).json({ error: 'Server error fetching reservations.' });
  }
});

// POST /api/reservations - Create a reservation
// Implements automated table assignment and conflict resolution logic.
router.post('/', auth, async (req, res) => {
  try {
    const { date, timeSlot, guests } = req.body;
    const customerName = req.user.name;
    const email = req.user.email;

    if (!date || !timeSlot || !guests) {
      return res.status(400).json({ error: 'Please provide date, timeSlot, and guests.' });
    }

    const partySize = Number(guests);
    if (isNaN(partySize) || partySize <= 0) {
      return res.status(400).json({ error: 'Guests must be a positive number.' });
    }

    // Date validation: Must not be in the past (based on local YYYY-MM-DD)
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (date < todayStr) {
      return res.status(400).json({ error: 'Date must be today or in the future.' });
    }

    // 1. Get all tables
    const allTables = await Table.find();

    // 2. Filter tables that have enough capacity
    const suitableTables = allTables.filter(t => t.capacity >= partySize);
    if (suitableTables.length === 0) {
      return res.status(400).json({
        error: `No tables can accommodate a party of ${partySize}. Max table capacity is ${Math.max(...allTables.map(t => t.capacity), 0)}.`
      });
    }

    // 3. Find tables that are already booked for this slot
    // Active statuses include 'confirmed' and 'pending'
    const activeReservations = await Reservation.find({
      date,
      timeSlot,
      status: { $in: ['confirmed', 'pending'] }
    });

    const bookedTableIds = activeReservations.map(r => r.table.toString());

    // 4. Determine available tables
    const availableTables = suitableTables.filter(
      t => !bookedTableIds.includes(t._id.toString())
    );

    if (availableTables.length === 0) {
      return res.status(400).json({
        error: 'Fully booked. No tables of sufficient capacity are available for this date and time slot.'
      });
    }

    // 5. Select the best matching table
    // Smallest capacity first (to optimize utilization), then lowest table number
    availableTables.sort((a, b) => {
      if (a.capacity !== b.capacity) {
        return a.capacity - b.capacity;
      }
      return a.tableNumber - b.tableNumber;
    });

    const assignedTable = availableTables[0];

    // 6. Save reservation
    const reservation = new Reservation({
      user: req.user._id,
      customerName,
      email,
      date,
      timeSlot,
      guests: partySize,
      table: assignedTable._id,
      status: 'confirmed'
    });

    await reservation.save();
    const populated = await Reservation.findById(reservation._id).populate('table');

    res.status(201).json({
      message: 'Reservation created successfully!',
      reservation: populated
    });
  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({ error: 'Server error creating reservation.' });
  }
});

// PATCH /api/reservations/:id/cancel - Cancel a reservation
// Access: Owner of reservation or Admin
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found.' });
    }

    // Authorization check
    if (req.user.role !== 'admin' && reservation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied. You do not own this reservation.' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    res.json({ message: 'Reservation cancelled successfully.', reservation });
  } catch (error) {
    console.error('Cancel reservation error:', error);
    res.status(500).json({ error: 'Server error cancelling reservation.' });
  }
});

// PUT /api/reservations/:id - Update reservation (Admin only)
// Allows admin to reschedule, change guests or manually re-allocate tables
router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { date, timeSlot, guests, status, tableId } = req.body;
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found.' });
    }

    // If changing scheduling or party size, we must check capacity and conflicts
    const newDate = date || reservation.date;
    const newTimeSlot = timeSlot || reservation.timeSlot;
    const newGuests = guests !== undefined ? Number(guests) : reservation.guests;

    let targetTableId = tableId;

    if (date || timeSlot || guests !== undefined) {
      // 1. Get all tables
      const allTables = await Table.find();
      const suitableTables = allTables.filter(t => t.capacity >= newGuests);
      if (suitableTables.length === 0) {
        return res.status(400).json({ error: `No tables can accommodate ${newGuests} guests.` });
      }

      // 2. Find active bookings at that time, EXCLUDING this reservation
      const activeReservations = await Reservation.find({
        _id: { $ne: req.params.id },
        date: newDate,
        timeSlot: newTimeSlot,
        status: { $in: ['confirmed', 'pending'] }
      });

      const bookedTableIds = activeReservations.map(r => r.table.toString());

      // If a specific table was selected by admin, verify if it is available
      if (tableId) {
        const table = allTables.find(t => t._id.toString() === tableId);
        if (!table) {
          return res.status(400).json({ error: 'Selected table does not exist.' });
        }
        if (table.capacity < newGuests) {
          return res.status(400).json({ error: `Selected table (capacity ${table.capacity}) is too small for ${newGuests} guests.` });
        }
        if (bookedTableIds.includes(tableId)) {
          return res.status(400).json({ error: 'Selected table is already booked for this date and time slot.' });
        }
        targetTableId = tableId;
      } else {
        // Automatically allocate the best available table
        const availableTables = suitableTables.filter(
          t => !bookedTableIds.includes(t._id.toString())
        );

        if (availableTables.length === 0) {
          return res.status(400).json({
            error: 'Fully booked. No available tables meet the size requirement at the selected date and time.'
          });
        }

        availableTables.sort((a, b) => {
          if (a.capacity !== b.capacity) {
            return a.capacity - b.capacity;
          }
          return a.tableNumber - b.tableNumber;
        });

        targetTableId = availableTables[0]._id;
      }
    }

    if (date) reservation.date = date;
    if (timeSlot) reservation.timeSlot = timeSlot;
    if (guests !== undefined) reservation.guests = newGuests;
    if (status) reservation.status = status;
    if (req.body.customerName) reservation.customerName = req.body.customerName;
    if (targetTableId) reservation.table = targetTableId;

    await reservation.save();
    const populated = await Reservation.findById(reservation._id)
      .populate('table')
      .populate('user', 'name email');

    res.json({ message: 'Reservation updated successfully.', reservation: populated });
  } catch (error) {
    console.error('Update reservation error:', error);
    res.status(500).json({ error: 'Server error updating reservation.' });
  }
});

module.exports = router;
