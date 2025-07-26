// 📁 client/src/App.jsx

import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  transports: ['websocket'],
  reconnection: true,
  autoConnect: true
});

const players = [
  { id: '64ec46e3e18c174e1eabf8cd', name: 'player1' },
  { id: '64ec46e3e18c174e1eabf8ce', name: 'player2' },
  { id: '64ec46e3e18c174e1eabf8cf', name: 'player3' }
];

export default function Game() {
  const [playerId, setPlayerId] = useState('');
  const [wallet, setWallet] = useState([]);
  const [usdAmount, setUsdAmount] = useState(10);
  const [currency, setCurrency] = useState('BTC');
  const [status, setStatus] = useState('Waiting for next round...');
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(null);
  const [cashedOut, setCashedOut] = useState(false);

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
    fetch(`http://localhost:5000/api/players/${playerId}/wallet`)
      .then(res => res.json())
      .then(setWallet);
  }, [playerId, status]);

  const handlePlaceBet = async () => {
    await fetch('http://localhost:5000/api/game/bet', {
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
        </>
      )}
    </div>
  );
}
