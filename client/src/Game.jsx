import { useState, useEffect } from 'react';
import socket from './socket';

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

  const fetchWallet = () => {
    if (!playerId) return;
    fetch(`${apiurl}/players/${playerId}/wallet`)
      .then(res => res.json())
      .then(setWallet)
      .catch(console.error);
  };

  useEffect(() => {
    setCashedOut(false);
    fetchWallet();
  }, [playerId]);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Socket connected', socket.id);
    });
    return () => socket.off('connect');
  }, []);

  useEffect(() => {
    socket.on('roundStart', () => {
      setCountdown(10);
      setCashedOut(false); // <-- RESET cashedOut for new round

      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    return () => socket.off('roundStart');
  }, []);

  // 🔄 Game events
  useEffect(() => {
    socket.on('round_start', ({ crashMultiplier }) => {
      setCrashPoint(crashMultiplier);
      setStatus(`Round started! Crash point: ${crashMultiplier.toFixed(2)}x`);
      setCashedOut(false); // <-- ALSO reset here for redundancy
    });

    socket.on('multiplier', ({ multiplier }) => {
      setMultiplier(multiplier);
    });

    socket.on('crash', ({ crashPoint }) => {
      setStatus(`Crashed at ${parseFloat(crashPoint).toFixed(2)}x`);
    });

    socket.on('player_cashout', ({ playerId: pid, multiplier, usdPayout }) => {
      if (pid === playerId) {
        alert(`You cashed out at ${multiplier}x and earned $${usdPayout}`);
        setCashedOut(true);
        fetchWallet();
      }
    });

    socket.on('roundCrash', ({ crashPoint, losers }) => {
      if (losers.some(loser => loser.playerId === playerId)) {
        alert('You lost your bet!');
        fetchWallet();
        setCashedOut(false); // Reset after crash loss
      }
    });

    return () => {
      socket.off('round_start');
      socket.off('multiplier');
      socket.off('crash');
      socket.off('player_cashout');
      socket.off('roundCrash');
    };
  }, [playerId]);

  const handlePlaceBet = async () => {
    await fetch(`${apiurl}/game/bet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, usdAmount, currency })
    });
    alert('Bet placed!');
  };

  const handleCashout = () => {
    if (!playerId || cashedOut) return;
    socket.emit('cashout', { playerId });
  };

  return (
    <div style={{ padding: 30, fontFamily: 'monospace', textAlign: 'center' }}>
      <h1>Crypto Crash Game</h1>

      <select onChange={e => setPlayerId(e.target.value)} value={playerId}>
        <option value="">Select a Player</option>
        {players.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      {playerId && (
        <>
          <h2>Wallet:</h2>
          {wallet.map(w => (
            <p key={w.currency}>{w.currency}: {w.balance} (≈ ${w.usd})</p>
          ))}

          <h2>Place a Bet</h2>
          <input
            type="number"
            value={usdAmount}
            onChange={e => setUsdAmount(Number(e.target.value))}
            placeholder="$ USD"
          />
          <select value={currency} onChange={e => setCurrency(e.target.value)}>
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
          </select>
          <button onClick={handlePlaceBet}>Place Bet</button>

          <h2>Multiplier: {multiplier}x</h2>
          <p>{status}</p>

          <button onClick={handleCashout} disabled={cashedOut}>Cash Out</button>
          <p>Next round in: {countdown}s</p>
        </>
      )}
    </div>
  );
}
