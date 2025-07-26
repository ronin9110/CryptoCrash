import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import  socket  from "./socket";

const apiurl = import.meta.env.VITE_API_BASE;


const players = [
  { id: '64ec46e3e18c174e1eabf8cd', name: 'player1' },
  { id: '64ec46e3e18c174e1eabf8ce', name: 'player2' },
  { id: '64ec46e3e18c174e1eabf8cf', name: 'player3' }
];

export default function Game() {
  
  const [playerId, setPlayerId] = useState('');
  const [usdAmount, setUsdAmount] = useState(10);
  const [currency, setCurrency] = useState('BTC');
  const [status, setStatus] = useState('Waiting for next round...');
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(null);
  const [cashedOut, setCashedOut] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [wallet, setWallet] = useState([]);

  useEffect(() => {
  socket.on("connect", () => {
    console.log("✅ Socket connected", socket.id);
  });
}, []);

  useEffect(() => {
    // Listener for successful cashout
    socket.on("cashoutSuccess", (data) => {
      setWallet(data);
    });

    return () => {
      socket.off("cashoutSuccess");
    };
  }, []);

  useEffect(() => {
  socket.on("roundCrash", ({ crashPoint, losers }) => {
    if (losers.includes(playerId)) {
      alert("❌ You lost your bet!");

      // Option A: Fetch updated wallet from backend
      fetch(`${import.meta.env.VITE_API_BASE}/api/wallet/${playerId}`)
        .then(res => res.json())
        .then(data => setWallet(data));

      // Option B: Or manually deduct known bet amount from wallet (not recommended unless handled tightly)
    }
  });

  return () => socket.off("roundCrash");
}, []);


useEffect(() => {
  socket.on("roundStart", () => {
    setCountdown(10);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  });

  return () => socket.off("roundStart");
}, []);

  useEffect(() => {
    socket.on('round_start', ({ crashMultiplier }) => {
      setCrashPoint(crashMultiplier);
      setStatus(`🚀 Round started! Crash point: ${crashMultiplier.toFixed(2)}x`);
      setCashedOut(false);
    });

    socket.on('multiplier', ({ multiplier }) => {
      setMultiplier(multiplier);
    });

    socket.on('crash', ({ crashPoint }) => {
      setStatus(`💥 Crashed at ${parseFloat(crashPoint).toFixed(2)}x`);
    });

    socket.on('player_cashout', ({ playerId: pid, multiplier, usdPayout }) => {
      if (pid === playerId) {
        alert(`✅ You cashed out at ${multiplier}x and earned $${usdPayout}`);
        setCashedOut(true);
      }
    });

    return () => {
      socket.off('round_start');
      socket.off('multiplier');
      socket.off('crash');
      socket.off('player_cashout');
    };
  }, [playerId]);

  useEffect(() => {
    if (!playerId) return;
    fetch(`${apiurl}/players/${playerId}/wallet`)
      .then(res => res.json())
      .then(setWallet);
  }, [playerId, status]);

  const handlePlaceBet = async () => {
    await fetch(`${apiurl}/game/bet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, usdAmount, currency })
    });
    alert('✅ Bet placed!');
  };

  const handleCashout = () => {
    if (!playerId || cashedOut) return;
    socket.emit('cashout', { playerId });
  };

  return (
    <div style={{ padding: 30, fontFamily: 'monospace', textAlign: 'center' }}>
      <h1>💥 Crypto Crash Game</h1>

      <select onChange={(e) => setPlayerId(e.target.value)} value={playerId}>
        <option value="">Select a Player</option>
        {players.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      {playerId && (
        <>
          <h2>💼 Wallet</h2>
          {wallet.map(w => (
            <p key={w.currency}>{w.currency}: {w.balance} (≈ ${w.usd})</p>
          ))}

          <h2>🎯 Place a Bet</h2>
          <input
            type="number"
            value={usdAmount}
            onChange={(e) => setUsdAmount(Number(e.target.value))}
            placeholder="$ USD"
          />
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
          </select>
          <button onClick={handlePlaceBet}>Place Bet</button>

          <h2>📈 Multiplier: {multiplier}x</h2>
          <p>{status}</p>

          <button onClick={handleCashout} disabled={cashedOut}>💸 Cash Out</button>
          <p>Next round in: {countdown}s</p>
        </>
      )}
    </div>
  );
}
