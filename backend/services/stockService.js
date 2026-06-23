const axios = require('axios');

async function getQuote(symbol) {
  try {
    const key = process.env.FINNHUB_API_KEY;
    if (!key) return null;
    
    const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${key}`;
    const res = await axios.get(url);
    
    // Finnhub returns: c=current price, h=high, l=low, v=volume, pc=previous close
    if (!res.data) {
      console.error('Invalid response from Finnhub API');
      return null;
    }
    
    const { data } = res;
    
    return {
      current: data.c,
      high: data.h,
      low: data.l,
      volume: data.v,
      prevClose: data.pc
    };
  } catch (err) {
    console.error('Stock API error:', err.message);
    return null;
  }
}

module.exports = { getQuote };
