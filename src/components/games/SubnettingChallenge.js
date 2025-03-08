import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import SoundManager from '../../utils/SoundManager';
import scrollToTop from '../../utils/ScrollHelper';

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
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('subnetHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });

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
    // Clear previous answers
    setNetworkAnswer('');
    setBroadcastAnswer('');
    setFirstUsableAnswer('');
    setLastUsableAnswer('');
    
    // Clear UI state
    setResult('');
    
    // Generate random IP and prefix
    let randomOctet1 = Math.floor(Math.random() * 223) + 1; // Valid Class A, B, C
    if (randomOctet1 === 127) randomOctet1 = 128; // Avoid loopback
    
    const randomOctet2 = Math.floor(Math.random() * 256);
    const randomOctet3 = Math.floor(Math.random() * 256);
    const randomOctet4 = Math.floor(Math.random() * 256);
    
    // More realistic CIDR prefix (avoid very small or very large networks)
    const randomPrefix = Math.floor(Math.random() * 8) + 16; // From /16 to /23
    
    const randomIp = `${randomOctet1}.${randomOctet2}.${randomOctet3}.${randomOctet4}`;
    
    setIp(randomIp);
    setPrefix(randomPrefix);
    
    // Play sound and scroll to top
    SoundManager.play('click');
    scrollToTop();
  };

  useEffect(() => {
    generateChallenge();
    // Cleanup
    return () => {
      // Any cleanup code here
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Calculate correct answers.
    const correctNetwork = getNetworkAddress(ip, prefix);
    const correctBroadcast = getBroadcastAddress(ip, prefix);
    const correctFirstUsable = getFirstUsable(ip, prefix);
    const correctLastUsable = getLastUsable(ip, prefix);
    
    // Check user answers.
    const networkCorrect = networkAnswer.trim() === correctNetwork;
    const broadcastCorrect = broadcastAnswer.trim() === correctBroadcast;
    const firstUsableCorrect = firstUsableAnswer.trim() === correctFirstUsable;
    const lastUsableCorrect = lastUsableAnswer.trim() === correctLastUsable;
    
    if (networkCorrect && broadcastCorrect && firstUsableCorrect && lastUsableCorrect) {
      setResult("All answers correct! Great job!");
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > highScore) {
          setHighScore(newStreak);
          localStorage.setItem('subnetHighScore', newStreak.toString());
          SoundManager.play('achievement');
        } else {
          SoundManager.play('correct');
        }
        return newStreak;
      });
      generateChallenge();
    } else {
      let feedback = "Incorrect answers:\n";
      if (!networkCorrect) feedback += `Network address should be ${correctNetwork}\n`;
      if (!broadcastCorrect) feedback += `Broadcast address should be ${correctBroadcast}\n`;
      if (!firstUsableCorrect) feedback += `First usable address should be ${correctFirstUsable}\n`;
      if (!lastUsableCorrect) feedback += `Last usable address should be ${correctLastUsable}\n`;
      
      setResult(feedback);
      setStreak(0);
      SoundManager.play('incorrect');
    }
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
          <button type="submit" onClick={handleSubmit} className="collapse-btn">
            Submit
          </button>
          <button className="collapse-btn" onClick={() => navigate(-1)}>
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
