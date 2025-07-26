# 💥 Crypto Crash

A real-time multiplayer Crash betting game built with WebSockets, Node.js, MongoDB, and live cryptocurrency price integration. Players bet USD, converted to BTC or ETH in real-time, and must cash out before the game crashes!

---

## ⚙️ Tech Stack

* **Backend**: Node.js + Express.js
* **WebSocket**: Socket.IO
* **Database**: MongoDB (via Mongoose)
* **Crypto Price API**: CoinGecko
* **Frontend (Bonus)**: React.js
* **Crash Algorithm**: Provably Fair using SHA256

---

## 📦 Installation & Setup

```bash
git clone https://github.com/your-username/crypto-crash.git
cd crypto-crash
npm install
```

### 1. Seed the database:

```bash
node seed.js
```

### 2. Start the server:

```bash
npm run dev
```

### 3. Start the frontend:

```bash
cd client
npm install
npm start
```

---

## 🎮 How to Play

1. **Choose a Player** – Select a player from the seed data or frontend dropdown.
2. **Enter Bet Amount in USD** – Enter how much USD you'd like to bet.
3. **Choose Crypto** – Select either BTC or ETH.
4. **Place Bet** – Your USD will be converted to crypto at the current market rate.
5. **Watch the Multiplier** – The multiplier increases every 100ms.
6. **Cash Out Anytime** – Click "Cash Out" before the crash to lock in profits.
7. **Crash Ends the Round** – If you don’t cash out before the crash, you lose the bet.

💡 The key is to time your cashout just before the crash. Higher risk = higher reward!

---

## 🔐 Environment Variables

Create a `.env` file in the root:

```env
MONGO_URI=mongodb+srv://...your mongo url...
PORT=5000
```

---

## 🔌 API Endpoints

### 🔹 POST `/api/game/bet`

Place a bet in USD (converted to selected crypto)

**Request Body:**

```json
{
  "playerId": "<player_id>",
  "usdAmount": 10,
  "currency": "BTC"
}
```

### 🔹 GET `/api/players/:id/wallet`

Returns wallet balances in crypto and USD

**Response:**

```json
[
  {
    "currency": "BTC",
    "balance": 0.001,
    "usd": 60.0
  }
]
```

---

## 📡 WebSocket Events

### 🔸 Event: `round_start`

Emitted to all clients at round start.

```json
{
  "crashMultiplier": 3.14
}
```

### 🔸 Event: `multiplier`

Emitted every 100ms during round.

```json
{
  "multiplier": 1.76
}
```

### 🔸 Event: `player_cashout`

Emitted when a player cashes out.

```json
{
  "playerId": "<id>",
  "multiplier": 2.5,
  "usdPayout": 25.0
}
```

### 🔸 Event: `crash`

Emitted when the round crashes.

```json
{
  "crashPoint": 5.44
}
```

### 🔸 Emit: `cashout`

Clients send this event to cash out:

```json
{
  "playerId": "<id>"
}
```

---

## 💸 USD-to-Crypto Conversion Logic

Prices are fetched via CoinGecko (cached for 60 seconds):

```js
cryptoAmount = usdAmount / currentPrice
```

Example:

* \$10, BTC at \$60,000 → 0.00016667 BTC
* Cashout at 2x → 0.00033334 BTC
* Converted to USD → \~\$20

---

## 🎲 Provably Fair Crash Algorithm

Crash point is generated using a cryptographically secure method:

```js
const hash = SHA256(seed + roundNumber)
const crashPoint = Math.max(1.0, (parseInt(hash, 16) % 10000) / 100)
```

* `seed` can be predefined or random
* Each round’s crash point is deterministic but unpredictable
* Hash + seed published for verification

---

## 💾 Sample Data & Seeding

To generate test data:

```bash
node seed.js
```

Creates:

* 3 player profiles
* Wallets with BTC/ETH balances

---

## 📬 Postman Collection

Included in the project root as:

```
CryptoCrash.postman_collection.json
```

Use to test:

* Bet placement
* Wallet check
* Error handling

---

## 🧠 Project Architecture

```
├── models
│   ├── Player.js
│   ├── Wallet.js
│   ├── Bet.js
│   └── Transaction.js
│
├── services
│   ├── gameService.js
│   ├── priceService.js
│   └── walletService.js
│
├── websockets
│   └── socketHandler.js
│
├── routes
│   └── game.js
│
├── client
│   └── React Frontend
```

---

## 🛡 Security & Validation

* Input validation for bets, currency, wallet ownership
* Prevents cashing out after crash
* WebSocket events are authenticated by playerId
* CoinGecko rate limit handled via caching + fallback

---

## 📎 Notes

* This is a simulation — no real crypto transactions
* Frontend is optional but included for bonus points
* Game logic runs a new round every 10 seconds
* Multiplier updates every 100ms using setInterval

---

## ✅ Ready to Play?

Fire up the game, place your bets, and cash out before it blows up! 💥
