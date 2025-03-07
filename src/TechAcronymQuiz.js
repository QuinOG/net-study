import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Dictionary of tech acronyms with variants (for CompTIA A+)
// For each acronym, we include a "correct" answer and several similar alternatives.
const acronymVariants = {
  BIOS: {
    correct: "Basic Input/Output System",
    variants: [
      "Basic Input/Output System",
      "Basic Internal/Output System",
      "Binary Input/Output System",
      "Basic Input/Output Service"
    ]
  },
  CPU: {
    correct: "Central Processing Unit",
    variants: [
      "Central Processing Unit",
      "Core Processing Unit",
      "Central Processor Unit",
      "Computer Processing Unit"
    ]
  },
  RAM: {
    correct: "Random Access Memory",
    variants: [
      "Random Access Memory",
      "Read Access Memory",
      "Rapid Access Memory",
      "Random Active Memory"
    ]
  },
  HDD: {
    correct: "Hard Disk Drive",
    variants: [
      "Hard Disk Drive",
      "Hard Disk Device",
      "Heavy Disk Drive",
      "High Density Drive"
    ]
  },
  SSD: {
    correct: "Solid State Drive",
    variants: [
      "Solid State Drive",
      "Solid Storage Drive",
      "Stable State Drive",
      "Solid-State Device"
    ]
  },
  VPN: {
    correct: "Virtual Private Network",
    variants: [
      "Virtual Private Network",
      "Virtual Public Network",
      "Verified Private Network",
      "Virtual Protected Network"
    ]
  },
  DHCP: {
    correct: "Dynamic Host Configuration Protocol",
    variants: [
      "Dynamic Host Configuration Protocol",
      "Dynamic Host Control Protocol",
      "Dynamic Hypertext Configuration Protocol",
      "Direct Host Configuration Protocol"
    ]
  },
  OS: {
    correct: "Operating System",
    variants: [
      "Operating System",
      "Operating Software",
      "Operator System",
      "Organized System"
    ]
  },
  GPU: {
    correct: "Graphics Processing Unit",
    variants: [
      "Graphics Processing Unit",
      "Graphic Processing Unit",
      "Graphical Processing Unit",
      "GPU Processing Unit"
    ]
  },
  RAID: {
    correct: "Redundant Array of Independent Disks",
    variants: [
      "Redundant Array of Independent Disks",
      "Redundant Array of Inexpensive Disks",
      "Robust Array of Independent Disks",
      "Reliable Array of Independent Disks"
    ]
  }
};

function TechAcronymQuiz() {
  const navigate = useNavigate();
  const acronyms = Object.keys(acronymVariants);
  const [currentAcronym, setCurrentAcronym] = useState('');
  const [options, setOptions] = useState([]);
  const [result, setResult] = useState('');
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const timerRef = useRef(null);

  const generateQuestion = () => {
    const randomIndex = Math.floor(Math.random() * acronyms.length);
    const newAcronym = acronyms[randomIndex];
    setCurrentAcronym(newAcronym);
    setResult('');
    setTimeLeft(15);
    // Use the variants for the current acronym.
    const variants = acronymVariants[newAcronym].variants;
    // Ensure there are exactly 4 options (assuming each entry has 4 variants).
    // Shuffle the options.
    const shuffledOptions = variants.sort(() => 0.5 - Math.random());
    setOptions(shuffledOptions);
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [currentAcronym]);

  const handleTimeOut = () => {
    const correctAnswer = acronymVariants[currentAcronym].correct;
    setResult(`Time's up! The correct answer was "${correctAnswer}".`);
    setStreak(0);
    setTimeout(() => generateQuestion(), 2000);
  };

  const handleAnswerClick = (selectedAnswer) => {
    clearInterval(timerRef.current);
    const correctAnswer = acronymVariants[currentAcronym].correct;
    if (selectedAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
      setResult("Correct answer!");
      setStreak((prev) => prev + 1);
    } else {
      setResult(`Incorrect. The correct answer is "${correctAnswer}".`);
      setStreak(0);
    }
    setTimeout(() => generateQuestion(), 2000);
  };

  return (
    <main className="content">
      <div className="game-interface">
        <h3 className="section-title">Tech Acronym Quiz</h3>
        <p>
          What does the acronym <strong>{currentAcronym}</strong> stand for?
        </p>
        <p className="timer">Time Left: {timeLeft} seconds</p>
        <div className="options-container">
          {options.map((option, index) => (
            <button 
              key={index} 
              className="start-btn option-btn" 
              onClick={() => handleAnswerClick(option)}
            >
              {option}
            </button>
          ))}
        </div>
        {result && <p className="result">{result}</p>}
        <div className="button-row">
          <button className="start-btn back-btn" onClick={() => navigate(-1)}>
            Game Menu
          </button>
        </div>
        <div className="streak-card">
          Streak: {streak}
        </div>
      </div>
    </main>
  );
}

export default TechAcronymQuiz;
