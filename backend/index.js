require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const axios = require('axios');

const authRoutes = require('./routes/auth');
const alertRoutes = require('./routes/alerts');
const watchlistRoutes = require('./routes/watchlist');
const holdingsRoutes = require('./routes/holdings');
const stocksRoutes = require('./routes/stocks');
const stockService = require('./services/stockService');
const Alert = require('./models/Alert');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/holdings', holdingsRoutes);
app.use('/api/stocks', stocksRoutes);

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGODB_URL || process.env.DATABASE_URL || 'mongodb://localhost:27017/stockapp';

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error', err.message);
    process.exit(1);
  });

// Cron job: every minute check alerts
cron.schedule('* * * * *', async () => {
  try {
    const alerts = await Alert.find({ isTriggered: false });
    if (!alerts.length) return;
    // Group by symbol to minimize API calls
    const bySymbol = alerts.reduce((acc, a) => {
      acc[a.symbol] = acc[a.symbol] || [];
      acc[a.symbol].push(a);
      return acc;
    }, {});

    for (const symbol of Object.keys(bySymbol)) {
      const quote = await stockService.getQuote(symbol);
      if (!quote) continue;
      const price = quote.current;
      for (const alert of bySymbol[symbol]) {
        if (alert.condition === 'GT' && price > alert.targetPrice) {
          alert.isTriggered = true;
          alert.triggeredAt = new Date();
          await alert.save();
          console.log(`Alert triggered for ${symbol} > ${alert.targetPrice}`);
        }
        if (alert.condition === 'LT' && price < alert.targetPrice) {
          alert.isTriggered = true;
          alert.triggeredAt = new Date();
          await alert.save();
          console.log(`Alert triggered for ${symbol} < ${alert.targetPrice}`);
        }
      }
    }
  } catch (err) {
    console.error('Alert checker error', err.message);
  }
});
