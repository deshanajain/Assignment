const express = require('express');
const router = express.Router();
const Auth = require('../middleware/auth');
const Holding = require('../models/Holding');
const stockService = require('../services/stockService');

router.use(Auth);

router.post('/', async (req, res) => {
  try {
    const { symbol, quantity, buyPrice } = req.body;
    if (!symbol || !quantity || !buyPrice) return res.status(400).json({ message: 'Missing fields' });
    const h = await Holding.create({ userId: req.user._id, symbol: symbol.toUpperCase(), quantity, buyPrice });
    res.json(h);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const holdings = await Holding.find({ userId: req.user._id });
    // enrich with current price
    const enriched = await Promise.all(holdings.map(async (h) => {
      const quote = await stockService.getQuote(h.symbol);
      const current = quote?.current || 0;
      const invested = h.buyPrice * h.quantity;
      const currentValue = current * h.quantity;
      const pl = currentValue - invested;
      return {
        id: h._id,
        symbol: h.symbol,
        quantity: h.quantity,
        buyPrice: h.buyPrice,
        invested,
        current,
        currentValue,
        pl
      };
    }));
    // overall summary
    const summary = enriched.reduce((acc, e) => {
      acc.invested += e.invested;
      acc.currentValue += e.currentValue;
      acc.pl += e.pl;
      return acc;
    }, { invested: 0, currentValue: 0, pl: 0 });
    res.json({ holdings: enriched, summary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const h = await Holding.findById(req.params.id);
    if (!h) return res.status(404).json({ message: 'Not found' });
    if (h.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });
    await Holding.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
