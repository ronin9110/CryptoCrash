function usdToCrypto(usd, price) {
  return parseFloat((usd / price).toFixed(8));
}

function cryptoToUsd(crypto, price) {
  return parseFloat((crypto * price).toFixed(2));
}

module.exports = { usdToCrypto, cryptoToUsd };
