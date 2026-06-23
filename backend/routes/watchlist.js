const express = require('express');
const router = express.Router();
const Auth = require('../middleware/auth');
const Watchlist = require('../models/Watchlist');

router.use(Auth);

router.post('/', async (req, res) => {
  try {
    const { symbol } = req.body;
    if (!symbol) return res.status(400).json({ message: 'Missing symbol' });
    const exists = await Watchlist.findOne({ userId: req.user._id, symbol: symbol.toUpperCase() });
    if (exists) return res.status(409).json({ message: 'Already in watchlist' });
    const item = await Watchlist.create({ userId: req.user._id, symbol: symbol.toUpperCase() });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const items = await Watchlist.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await Watchlist.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    if (item.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });
    await Watchlist.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
