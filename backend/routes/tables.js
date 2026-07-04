const express = require('express');
const Table = require('../models/Table');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

// GET /api/tables - Get all tables (authenticated users)
router.get('/', auth, async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.json(tables);
  } catch (error) {
    console.error('Fetch tables error:', error);
    res.status(500).json({ error: 'Server error fetching tables.' });
  }
});

// POST /api/tables - Add or update a table (Admin only)
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const { tableNumber, capacity } = req.body;

    if (tableNumber === undefined || capacity === undefined) {
      return res.status(400).json({ error: 'Please provide tableNumber and capacity.' });
    }

    if (Number(tableNumber) <= 0 || Number(capacity) <= 0) {
      return res.status(400).json({ error: 'Table number and capacity must be positive numbers.' });
    }

    let table = await Table.findOne({ tableNumber });
    if (table) {
      table.capacity = capacity;
      await table.save();
      return res.json({ message: 'Table updated successfully.', table });
    }

    table = new Table({ tableNumber, capacity });
    await table.save();

    res.status(201).json({ message: 'Table created successfully.', table });
  } catch (error) {
    console.error('Create table error:', error);
    res.status(500).json({ error: 'Server error creating table.' });
  }
});

// PUT /api/tables/:id - Update a table by ID (Admin only)
router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { tableNumber, capacity } = req.body;

    if (tableNumber === undefined || capacity === undefined) {
      return res.status(400).json({ error: 'Please provide tableNumber and capacity.' });
    }

    if (Number(tableNumber) <= 0 || Number(capacity) <= 0) {
      return res.status(400).json({ error: 'Table number and capacity must be positive numbers.' });
    }

    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { tableNumber: Number(tableNumber), capacity: Number(capacity) },
      { new: true, runValidators: true }
    );

    if (!table) {
      return res.status(404).json({ error: 'Table not found.' });
    }

    res.json({ message: 'Table updated successfully.', table });
  } catch (error) {
    console.error('Update table error:', error);
    res.status(500).json({ error: 'Server error updating table.' });
  }
});

// DELETE /api/tables/:id - Delete a table (Admin only)
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) {
      return res.status(404).json({ error: 'Table not found.' });
    }
    res.json({ message: 'Table deleted successfully.' });
  } catch (error) {
    console.error('Delete table error:', error);
    res.status(500).json({ error: 'Server error deleting table.' });
  }
});

module.exports = router;
