import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Expanded dictionary for the Net+ exam
const portProtocols = {
  20: "FTP",
  21: "FTP",
  22: "SSH",
  23: "Telnet",
  25: "SMTP",
  53: "DNS",
  67: "DHCP",
  68: "DHCP",
  69: "TFTP",
  80: "HTTP",
  110: "POP3",
  119: "NNTP",
  123: "NTP",
  137: "NetBIOS",
  138: "NetBIOS",
  139: "NetBIOS",
  143: "IMAP",
  161: "SNMP",
  162: "SNMP",
  389: "LDAP",
  443: "HTTPS",
  445: "SMB",
  465: "SMTPS",
  587: "SMTP",
  993: "IMAPS",
  995: "POP3S",
  3306: "MySQL",
  3389: "RDP",
  8080: "HTTP-Alt"
};

function ProtocolGame() {
  const navigate = useNavigate();
  const [currentPort, setCurrentPort] = useState(null);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState('');
  const [streak, setStreak] = useState(0);

  // Utility: Get a random port from the dictionary keys
  const getRandomPort = () => {
    const keys = Object.keys(portProtocols);
    const randomIndex = Math.floor(Math.random() * keys.length);
    return parseInt(keys[randomIndex], 10);
  };

  const generateQuestion = () => {
    setCurrentPort(getRandomPort());
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (answer.trim() === '') {
      setResult("Please provide an answer.");
      return;
    }
    const correctProtocol = portProtocols[currentPort];
    if (answer.trim().toUpperCase() === correctProtocol.toUpperCase()) {
      setResult("Correct answer!");
      setStreak((prev) => prev + 1);
    } else {
      setResult(`Incorrect. The correct answer is "${correctProtocol}".`);
      setStreak(0);
    }
    setAnswer('');
    generateQuestion();
  };

  return (
    <main className="content">
      <div className="game-interface">
        <h3 className="section-title">Guess That Protocol</h3>
        {currentPort && (
          <p>
            What is the protocol for port <strong>{currentPort}</strong>?
          </p>
        )}
        <form onSubmit={handleSubmit} id="gameForm">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here"
          />
        </form>
        {result && <p className="result">{result}</p>}

        {/* Bottom row: Back button left, Submit button right */}
        <div className="button-row">
          <button type="submit" form="gameForm" className="start-btn submit-btn">
            Submit
          </button>
          <button className="start-btn back-btn" onClick={() => navigate(-1)}>
            Game Menu
          </button>
        </div>

        {/* Streak Card at Top Right */}
        <div className="streak-card">
          Streak: {streak}
        </div>
      </div>
    </main>
  );
}

export default ProtocolGame;
