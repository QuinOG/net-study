import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import SoundManager from '../../utils/SoundManager';
import scrollToTop from '../../utils/ScrollHelper';

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

function PortGame() {
  const navigate = useNavigate();
  const [currentProtocol, setCurrentProtocol] = useState(null);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState('');
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('portGameHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Utility: Get a random protocol from the dictionary values
  const getRandomProtocol = () => {
    const protocols = Object.values(portProtocols);
    const randomIndex = Math.floor(Math.random() * protocols.length);
    return protocols[randomIndex];
  };

  const generateQuestion = () => {
    setCurrentProtocol(getRandomProtocol());
    SoundManager.play('click');
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

    // Check for correct answer
    let isCorrect = false;
    // Get all ports that match the protocol
    const matchingPorts = Object.entries(portProtocols)
      .filter(([_, protocol]) => protocol === currentProtocol)
      .map(([port, _]) => port);

    isCorrect = matchingPorts.includes(answer.trim());

    if (isCorrect) {
      setResult("Correct answer!");
      setStreak((prev) => {
        const newStreak = prev + 1;
        // Update high score if streak is better
        if (newStreak > highScore) {
          setHighScore(newStreak);
          localStorage.setItem('portGameHighScore', newStreak.toString());
          SoundManager.play('achievement');
        } else {
          SoundManager.play('correct');
        }
        return newStreak;
      });
    } else {
      setResult(`Incorrect. The correct answer is port(s): ${matchingPorts.join(', ')}`);
      setStreak(0);
      SoundManager.play('incorrect');
    }

    setAnswer('');
    generateQuestion();
  };

  const startGame = () => {
    SoundManager.play('click');
    scrollToTop();
    generateQuestion();
  };

  const endGame = () => {
    SoundManager.play('gameOver');
  };

  return (
    <main className="content">
      <div className="game-interface">
        <h3 className="section-title">Guess That Port</h3>
        {currentProtocol && (
          <p>
            What is the port number for protocol <strong>{currentProtocol}</strong>?
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
        {/* Bottom row: Submit button on top, Back button below */}
        <div className="button-row">
          <button type="submit" form="gameForm" className="collapse-btn">
            Submit
          </button>
          <button className="collapse-btn" onClick={() => navigate(-1)}>
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

export default PortGame;
