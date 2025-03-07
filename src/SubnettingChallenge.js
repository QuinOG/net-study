import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Expanded dictionary is not needed here since we're working with IP math.
// Instead, we generate a random IP and prefix, then compute answers.

function SubnettingChallenge() {
  const navigate = useNavigate();
  
  // State for challenge and answers.
  const [ip, setIp] = useState('');
  const [prefix, setPrefix] = useState(24);
  const [networkAnswer, setNetworkAnswer] = useState('');
  const [broadcastAnswer, setBroadcastAnswer] = useState('');
  const [firstUsableAnswer, setFirstUsableAnswer] = useState('');
  const [lastUsableAnswer, setLastUsableAnswer] = useState('');
  const [result, setResult] = useState('');
  const [streak, setStreak] = useState(0);

  // Helper functions to convert IP to/from integer.
  const ipToInt = (ip) => {
    const parts = ip.split('.').map(Number);
    return (((parts[0] << 24) >>> 0) + ((parts[1] << 16) >>> 0) + ((parts[2] << 8) >>> 0) + (parts[3] >>> 0)) >>> 0;
  };

  const intToIp = (num) => {
    return [
      (num >>> 24) & 0xFF,
      (num >>> 16) & 0xFF,
      (num >>> 8) & 0xFF,
      num & 0xFF
    ].join('.');
  };

  // Given an IP and prefix, compute the network address.
  const getNetworkAddress = (ip, prefix) => {
    const ipInt = ipToInt(ip);
    const mask = ~((1 << (32 - prefix)) - 1) >>> 0;
    const networkInt = ipInt & mask;
    return intToIp(networkInt);
  };

  // Compute the broadcast address.
  const getBroadcastAddress = (ip, prefix) => {
    const ipInt = ipToInt(ip);
    const mask = ~((1 << (32 - prefix)) - 1) >>> 0;
    const networkInt = ipInt & mask;
    const broadcastInt = networkInt | ((1 << (32 - prefix)) - 1);
    return intToIp(broadcastInt);
  };

  // Compute the first usable IP address.
  const getFirstUsable = (ip, prefix) => {
    const network = ipToInt(getNetworkAddress(ip, prefix));
    return intToIp(network + 1);
  };

  // Compute the last usable IP address.
  const getLastUsable = (ip, prefix) => {
    const broadcast = ipToInt(getBroadcastAddress(ip, prefix));
    return intToIp(broadcast - 1);
  };

  // Generate a random IP address and a random prefix (between /24 and /30)
  const generateChallenge = () => {
    const randomIp = [
      Math.floor(Math.random() * 254) + 1,
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 254) + 1
    ].join('.');
    const randomPrefix = Math.floor(Math.random() * (30 - 24 + 1)) + 24;
    setIp(randomIp);
    setPrefix(randomPrefix);
    // Clear previous answers and result.
    setNetworkAnswer('');
    setBroadcastAnswer('');
    setFirstUsableAnswer('');
    setLastUsableAnswer('');
    setResult('');
  };

  useEffect(() => {
    generateChallenge();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ensure all fields are filled.
    if (!networkAnswer || !broadcastAnswer || !firstUsableAnswer || !lastUsableAnswer) {
      setResult("Please fill in all answers.");
      return;
    }
    // Compute correct values.
    const correctNetwork = getNetworkAddress(ip, prefix);
    const correctBroadcast = getBroadcastAddress(ip, prefix);
    const correctFirst = getFirstUsable(ip, prefix);
    const correctLast = getLastUsable(ip, prefix);

    // Compare answers.
    const isNetworkCorrect = networkAnswer.trim() === correctNetwork;
    const isBroadcastCorrect = broadcastAnswer.trim() === correctBroadcast;
    const isFirstCorrect = firstUsableAnswer.trim() === correctFirst;
    const isLastCorrect = lastUsableAnswer.trim() === correctLast;

    if (isNetworkCorrect && isBroadcastCorrect && isFirstCorrect && isLastCorrect) {
      setResult("All correct!");
      setStreak((prev) => prev + 1);
    } else {
      let errorMsg = "Incorrect. ";
      if (!isNetworkCorrect) errorMsg += `Network should be ${correctNetwork}. `;
      if (!isBroadcastCorrect) errorMsg += `Broadcast should be ${correctBroadcast}. `;
      if (!isFirstCorrect) errorMsg += `First usable should be ${correctFirst}. `;
      if (!isLastCorrect) errorMsg += `Last usable should be ${correctLast}.`;
      setResult(errorMsg);
      setStreak(0);
    }
    generateChallenge();
  };

  return (
    <main className="content">
      <div className="game-interface">
        <h3 className="section-title">Subnetting Challenge</h3>
        <p>
          For IP: <strong>{ip}/{prefix}</strong>, calculate:
        </p>
        <p>Network Address:</p>
        <input
          type="text"
          value={networkAnswer}
          onChange={(e) => setNetworkAnswer(e.target.value)}
          placeholder="e.g. 192.168.1.0"
        />
        <p>Broadcast Address:</p>
        <input
          type="text"
          value={broadcastAnswer}
          onChange={(e) => setBroadcastAnswer(e.target.value)}
          placeholder="e.g. 192.168.1.255"
        />
        <p>First Usable IP:</p>
        <input
          type="text"
          value={firstUsableAnswer}
          onChange={(e) => setFirstUsableAnswer(e.target.value)}
          placeholder="e.g. 192.168.1.1"
        />
        <p>Last Usable IP:</p>
        <input
          type="text"
          value={lastUsableAnswer}
          onChange={(e) => setLastUsableAnswer(e.target.value)}
          placeholder="e.g. 192.168.1.254"
        />
        {result && <p className="result">{result}</p>}
        {/* Button row: stacked vertically */}
        <div className="button-row">
          <button type="submit" onClick={handleSubmit} className="start-btn submit-btn">
            Submit
          </button>
          <button className="start-btn back-btn" onClick={() => navigate(-1)}>
            Game Menu
          </button>
        </div>
        {/* Streak Card positioned at top right */}
        <div className="streak-card">
          Streak: {streak}
        </div>
      </div>
    </main>
  );
}

export default SubnettingChallenge;
