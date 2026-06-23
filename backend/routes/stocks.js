const express = require('express');
const router = express.Router();
const stockService = require('../services/stockService');

router.get('/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const q = await stockService.getQuote(symbol);
    if (!q) return res.status(404).json({ message: 'No data' });
    const percentChange = q.prevClose ? ((q.current - q.prevClose) / q.prevClose) * 100 : 0;
    res.json({ symbol, currentPrice: q.current, high: q.high, low: q.low, volume: q.volume, percentChange });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
