import React from 'react';
import { FiAward, FiStar, FiUnlock } from 'react-icons/fi';
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

function LevelProgress({ userXP = 0 }) {
  // Calculate level and progress
  const xpPerLevel = 1000;
  const currentLevel = Math.floor(userXP / xpPerLevel);
  const currentLevelXP = userXP % xpPerLevel;
  const progressPercent = (currentLevelXP / xpPerLevel) * 100;
  
  // Calculate milestones
  const milestones = [
    { position: 25, reward: "New Challenge Unlocked" },
    { position: 50, reward: "Bonus XP Multiplier" },
    { position: 75, reward: "Special Achievement" }
  ];

  // Get next milestone
  const nextMilestone = {
    title: levelTitles[Math.min(currentLevel + 1, levelTitles.length - 1)],
    description: `${xpPerLevel - currentLevelXP} XP until next level`,
    icon: <FiAward size={24} />
  };

  return (
    <div className="progress-section">
      <div className="level-info">
        <div className="current-level">
          <div className="level-number">{currentLevel}</div>
          <div className="level-label">
            <span>Current Level</span>
            <span>{levelTitles[currentLevel]}</span>
          </div>
        </div>
        <FiStar size={24} color="#4299e1" />
      </div>

      <div className="xp-progress">
        <div className="xp-bar" style={{ width: `${progressPercent}%` }} />
        {milestones.map((milestone, index) => (
          <div
            key={index}
            className="milestone-marker"
            style={{ left: `${milestone.position}%` }}
            title={milestone.reward}
          />
        ))}
      </div>

      <div className="xp-info">
        <span className="xp-current">{currentLevelXP} XP</span>
        <span>{xpPerLevel} XP needed</span>
      </div>

      <div className="next-milestone">
        <span className="milestone-icon">
          {nextMilestone.icon}
        </span>
        <div className="milestone-info">
          <div className="milestone-title">{nextMilestone.title}</div>
          <div className="milestone-description">{nextMilestone.description}</div>
        </div>
      </div>
    </div>
  );
}

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