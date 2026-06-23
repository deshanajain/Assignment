const express = require('express');
const router = express.Router();
const Auth = require('../middleware/auth');
const Alert = require('../models/Alert');

router.use(Auth);

router.post('/', async (req, res) => {
  try {
    const { symbol, condition, targetPrice } = req.body;
    if (!symbol || !condition || !targetPrice) return res.status(400).json({ message: 'Missing fields' });
    const alert = await Alert.create({ userId: req.user._id, symbol: symbol.toUpperCase(), condition, targetPrice });
    res.json(alert);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const alerts = await Alert.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const a = await Alert.findById(req.params.id);
    if (!a) return res.status(404).json({ message: 'Not found' });
    if (a.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });
    await Alert.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
