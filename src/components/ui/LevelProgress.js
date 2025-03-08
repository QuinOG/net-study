import React from 'react';
import '../../styles/ui/LevelProgress.css';

// Experience required for each level
const levelThresholds = [
  0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 
  3250, 3850, 4500, 5200, 6000, 6900, 7900, 9000, 10200, 11500
];

// Level titles
const levelTitles = [
  "Network Novice", "Cable Connector", "Protocol Pupil", "Subnet Student",
  "Data Traveler", "Packet Patroller", "Router Rookie", "Firewall Finder",
  "Switch Specialist", "TCP Technician", "IP Investigator", "LAN Leader",
  "WAN Warrior", "Cyber Scout", "Security Sentinel", "Network Navigator",
  "Protocol Professor", "Encryption Expert", "System Sage", "Network Maestro"
];

const LevelProgress = ({ userXP }) => {
  // Calculate current level
  const level = levelThresholds.findIndex(threshold => userXP < threshold) - 1;
  const currentLevel = level < 0 ? 0 : level;
  const nextLevel = currentLevel + 1;
  
  // Calculate progress to next level
  const currentLevelXP = levelThresholds[currentLevel];
  const nextLevelXP = levelThresholds[nextLevel];
  const xpForCurrentLevel = userXP - currentLevelXP;
  const xpRequiredForNextLevel = nextLevelXP - currentLevelXP;
  const progressPercent = (xpForCurrentLevel / xpRequiredForNextLevel) * 100;
  
  return (
    <div className="level-container">
      <div className="level-header">
        <div className="level-badge">Lvl {currentLevel}</div>
        <div className="level-title">{levelTitles[currentLevel]}</div>
      </div>
      <div className="xp-progress">
        <div className="xp-bar-container">
          <div 
            className="xp-bar" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <div className="xp-text">
          {xpForCurrentLevel}/{xpRequiredForNextLevel} XP to Level {nextLevel}
        </div>
      </div>
      <div className="level-benefits">
        <h4>Level {nextLevel} Unlocks:</h4>
        <ul>
          {getLevelBenefits(nextLevel).map((benefit, index) => (
            <li key={index}>{benefit}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Helper function to get benefits for the next level
const getLevelBenefits = (level) => {
  const benefits = [
    "Access to basic challenges",
    "Daily bonus XP opportunities",
    "Access to intermediate challenges",
    "Custom profile badge",
    "Access to advanced challenges",
    "Double XP weekends",
    "Expert challenge access",
    "Challenge creation tools",
    "Community recognition features",
    "Master-level difficulty",
    "Exclusive networking resources",
    "Priority access to new features",
    "Custom challenge creation",
    "Advanced statistics tracking",
    "Mentor program eligibility",
    "Expert resource contributions",
    "Community leadership tools",
    "Challenge design capabilities",
    "Beta feature testing access",
    "Honorary NetQuest recognition"
  ];
  
  return level <= benefits.length ? [benefits[level-1]] : ["Legendary status and bragging rights!"];
};

export default LevelProgress; 