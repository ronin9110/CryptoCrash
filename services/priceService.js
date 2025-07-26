const axios = require('axios');

let cachedPrices = null;
let lastFetched = 0;
const CACHE_DURATION = 60000; // 10 seconds

async function getPrices() {
  const now = Date.now();

  if (cachedPrices && now - lastFetched < CACHE_DURATION) {
    return cachedPrices;
  }

  try {
    const res = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: 'bitcoin,ethereum',
        vs_currencies: 'usd'
      }
    });

    cachedPrices = {
      BTC: res.data.bitcoin.usd,
      ETH: res.data.ethereum.usd
    };
    lastFetched = now;
    return cachedPrices;
  } catch (error) {
    console.error('⚠️ Price fetch failed:', error.message);
    return cachedPrices || { BTC: 60000, ETH: 3000 }; // fallback
  }
}

module.exports = { getPrices };
