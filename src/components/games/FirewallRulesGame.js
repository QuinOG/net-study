import React, { useState, useEffect, useContext } from 'react';
import { FiShield, FiCheck, FiX, FiArrowRight } from 'react-icons/fi';
import '../../styles/games/FirewallRulesGame.css';
import { UserContext } from '../../context/UserContext';
import GameModeCard from '../ui/GameModeCard';
import GameEndScreen from '../ui/GameEndScreen';
import SoundManager from '../../utils/SoundManager';
import { useNavigate } from 'react-router-dom';

function FirewallRulesGame() {
  const { addXP } = useContext(UserContext);
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('setup'); // 'setup', 'playing', 'results'
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [currentScenario, setCurrentScenario] = useState(null);
  const [userRules, setUserRules] = useState([]);
  const [score, setScore] = useState(0);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [scenarios, setScenarios] = useState([]);
  const [results, setResults] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Game modes for firewall rules
  const gameModes = [
    {
      id: 'configure',
      title: 'Configure Firewall',
      description: 'Create firewall rules to secure networks based on requirements',
      icon: <FiShield />,
    },
    {
      id: 'analyze',
      title: 'Analyze Traffic',
      description: 'Analyze which traffic would be allowed or blocked by firewall rules',
      icon: <FiShield />,
    }
  ];

  // Difficulty levels
  const difficulties = [
    { id: 'easy', label: 'Easy', timeLimit: 180, scenarios: 3 },
    { id: 'medium', label: 'Medium', timeLimit: 240, scenarios: 4 },
    { id: 'hard', label: 'Hard', timeLimit: 300, scenarios: 5 }
  ];

  // Select game mode
  const handleModeSelect = (modeId) => {
    SoundManager.play('click');
    setSelectedMode(modeId);
  };

  // Select difficulty
  const handleDifficultySelect = (difficulty) => {
    SoundManager.play('click');
    setSelectedDifficulty(difficulty);
    
    // Generate scenarios based on mode and difficulty
    const generatedScenarios = generateScenarios(selectedMode, difficulty);
    setScenarios(generatedScenarios);
    
    // Start the game
    setGameState('playing');
    setScenarioIndex(0);
    setScore(0);
    setResults([]);
    setCurrentScenario(generatedScenarios[0]);
    setUserRules([]);
    
    // Set timer based on difficulty
    const difficultySettings = difficulties.find(d => d.id === difficulty);
    setTimeLeft(difficultySettings.timeLimit);
    setTimerActive(true);
  };

  // Generate dummy scenarios (in a real app, these would come from a database)
  const generateScenarios = (mode, difficulty) => {
    // This is a placeholder for demo purposes
    // In a real app, you would have a database of scenarios or generate them dynamically
    return Array(difficulties.find(d => d.id === difficulty).scenarios).fill().map((_, i) => ({
      id: i,
      title: `Scenario ${i + 1}`,
      description: `This is a ${difficulty} level scenario for the ${mode} mode.`,
      networkDiagram: null, // In a real app, this would be a network diagram
      requirements: [
        'Allow HTTP traffic on port 80',
        'Block all incoming traffic on port 22 except from network 192.168.1.0/24',
        'Allow all outgoing traffic'
      ],
      expectedRules: [
        { action: 'allow', protocol: 'tcp', port: '80', source: 'any', destination: 'any' },
        { action: 'deny', protocol: 'tcp', port: '22', source: '!192.168.1.0/24', destination: 'any' },
        { action: 'allow', protocol: 'any', port: 'any', source: 'any', destination: 'any', direction: 'outbound' }
      ]
    }));
  };

  // Add a new rule
  const addRule = (rule) => {
    setUserRules(prev => [...prev, rule]);
  };

  // Remove a rule
  const removeRule = (index) => {
    setUserRules(prev => prev.filter((_, i) => i !== index));
  };

  // Submit solutions
  const handleSubmit = () => {
    SoundManager.play('click');
    
    // Evaluate solution (simplified scoring for demo)
    // In a real app, this would do a more sophisticated comparison
    const correctRuleCount = Math.min(userRules.length, currentScenario.expectedRules.length);
    const scenarioScore = Math.round((correctRuleCount / currentScenario.expectedRules.length) * 100);
    
    // Add to results
    setResults(prev => [...prev, {
      scenarioTitle: currentScenario.title,
      scenarioScore,
      userRules,
      expectedRules: currentScenario.expectedRules
    }]);
    
    // Update total score
    setScore(prev => prev + scenarioScore);
    
    // Move to next scenario or show results
    if (scenarioIndex < scenarios.length - 1) {
      setScenarioIndex(prev => prev + 1);
      setCurrentScenario(scenarios[scenarioIndex + 1]);
      setUserRules([]);
    } else {
      setGameState('results');
      setTimerActive(false);
      
      // Calculate XP based on average score and difficulty
      const difficultyMultiplier = 
        selectedDifficulty === 'easy' ? 10 : 
        selectedDifficulty === 'medium' ? 20 : 30;
      
      const averageScore = score / scenarios.length;
      const earnedXP = Math.round(averageScore * difficultyMultiplier / 10);
      
      // Award XP
      addXP(earnedXP);
    }
  };

  // Timer effect
  useEffect(() => {
    let timer;
    if (timerActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timerActive && timeLeft === 0) {
      // Time's up - move to results
      setGameState('results');
      setTimerActive(false);
      
      // Calculate XP based on current score
      const difficultyMultiplier = 
        selectedDifficulty === 'easy' ? 10 : 
        selectedDifficulty === 'medium' ? 20 : 30;
      
      const averageScore = (results.reduce((acc, result) => acc + result.scenarioScore, 0) + 0) / 
        (results.length + 1);
      const earnedXP = Math.round(averageScore * difficultyMultiplier / 10);
      
      // Award XP
      addXP(earnedXP);
    }
    
    return () => clearTimeout(timer);
  }, [timerActive, timeLeft, addXP, results, selectedDifficulty]);

  // Reset game
  const resetGame = () => {
    SoundManager.play('click');
    setGameState('setup');
    setSelectedMode(null);
    setSelectedDifficulty(null);
    setCurrentScenario(null);
    setUserRules([]);
    setScore(0);
    setScenarioIndex(0);
    setScenarios([]);
    setResults([]);
    setTimeLeft(0);
    setTimerActive(false);
  };

  return (
    <div className="game-interface firewall-rules-game">
      {gameState === 'setup' && !selectedMode && (
        <>
          <h3 className="game-title">Firewall Rules Challenge</h3>
          <p className="game-description">Test your knowledge of firewall rules and network security.</p>
          
          <div className="stats-container">
            <h3>Your Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">0</span>
                <span className="stat-label">Best Score</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">0</span>
                <span className="stat-label">Scenarios Completed</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">0</span>
                <span className="stat-label">Games Played</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">0%</span>
                <span className="stat-label">Success Rate</span>
              </div>
            </div>
          </div>
        
          <div className="game-setup">
            <h3>Select Game Mode</h3>
            <div className="game-modes">
              {gameModes.map(mode => (
                <GameModeCard 
                  key={mode.id}
                  title={mode.title}
                  description={mode.description}
                  icon={mode.icon}
                  onClick={() => handleModeSelect(mode.id)}
                />
              ))}
            </div>
          </div>
          
          <div className="nav-buttons">
            <button 
              className="back-btn"
              onClick={() => navigate('/dashboard')}
            >
              ← Back to Dashboard
            </button>
          </div>
        </>
      )}
      
      {gameState === 'setup' && selectedMode && (
        <div className="game-setup">
          <h3>Select Difficulty</h3>
          <div className="difficulty-select">
            <div className="difficulty-cards">
              {difficulties.map(difficulty => (
                <button 
                  key={difficulty.id} 
                  className="difficulty-card"
                  onClick={() => handleDifficultySelect(difficulty.id)}
                >
                  <h4>{difficulty.label}</h4>
                  <ul>
                    <li>{difficulty.scenarios} scenarios</li>
                    <li>{Math.floor(difficulty.timeLimit / 60)}:{(difficulty.timeLimit % 60).toString().padStart(2, '0')} minutes time limit</li>
                    {difficulty.id === 'easy' && <li>Basic firewall configurations</li>}
                    {difficulty.id === 'medium' && <li>Intermediate security concepts</li>}
                    {difficulty.id === 'hard' && <li>Advanced firewall policies</li>}
                  </ul>
                </button>
              ))}
            </div>
            <button className="back-btn" onClick={() => setSelectedMode(null)}>
              ← Back to Modes
            </button>
          </div>
        </div>
      )}
      
      {gameState === 'playing' && currentScenario && (
        <div className="game-play">
          <div className="game-header">
            <div className="progress">
              Scenario {scenarioIndex + 1}/{scenarios.length}
            </div>
            <div className="timer">
              Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>
          
          <div className="scenario-container">
            <h3>{currentScenario.title}</h3>
            <p>{currentScenario.description}</p>
            
            {currentScenario.networkDiagram && (
              <div className="network-diagram">
                <img src={currentScenario.networkDiagram} alt="Network Diagram" />
              </div>
            )}
            
            <div className="requirements">
              <h4>Requirements:</h4>
              <ul>
                {currentScenario.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
            
            <div className="firewall-rules">
              <h4>Your Firewall Rules:</h4>
              
              {userRules.length === 0 ? (
                <p className="no-rules">No rules defined yet.</p>
              ) : (
                <table className="rules-table">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Protocol</th>
                      <th>Port</th>
                      <th>Source</th>
                      <th>Destination</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userRules.map((rule, index) => (
                      <tr key={index}>
                        <td>{rule.action}</td>
                        <td>{rule.protocol}</td>
                        <td>{rule.port}</td>
                        <td>{rule.source}</td>
                        <td>{rule.destination}</td>
                        <td>
                          <button 
                            className="remove-rule-btn"
                            onClick={() => removeRule(index)}
                          >
                            <FiX />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              
              <div className="add-rule-form">
                <h4>Add New Rule:</h4>
                <div className="rule-form-controls">
                  <select id="action" defaultValue="">
                    <option value="" disabled>Action</option>
                    <option value="allow">Allow</option>
                    <option value="deny">Deny</option>
                  </select>
                  
                  <select id="protocol" defaultValue="">
                    <option value="" disabled>Protocol</option>
                    <option value="tcp">TCP</option>
                    <option value="udp">UDP</option>
                    <option value="icmp">ICMP</option>
                    <option value="any">Any</option>
                  </select>
                  
                  <input 
                    type="text" 
                    id="port" 
                    placeholder="Port (e.g. 80, 443, any)" 
                  />
                  
                  <input 
                    type="text" 
                    id="source" 
                    placeholder="Source (e.g. 192.168.1.0/24, any)" 
                  />
                  
                  <input 
                    type="text" 
                    id="destination" 
                    placeholder="Destination" 
                  />
                  
                  <button 
                    className="add-rule-btn"
                    onClick={() => addRule({
                      action: document.getElementById('action').value,
                      protocol: document.getElementById('protocol').value,
                      port: document.getElementById('port').value || 'any',
                      source: document.getElementById('source').value || 'any',
                      destination: document.getElementById('destination').value || 'any'
                    })}
                  >
                    Add Rule
                  </button>
                </div>
              </div>
            </div>
            
            <button 
              className="submit-btn"
              onClick={handleSubmit}
              disabled={userRules.length === 0}
            >
              {scenarioIndex < scenarios.length - 1 ? 'Submit & Next Scenario' : 'Submit & Finish'}
            </button>
          </div>
        </div>
      )}
      
      {gameState === 'results' && (
        <GameEndScreen
          gameTitle="Firewall Rules Game"
          score={Math.round(score / scenarios.length)}
          bestScore={100} // Using 100 as best score (perfect percentage)
          xpEarned={Math.round((score / scenarios.length) * 2)} // Adjust XP based on game difficulty
          correctAnswers={Math.round(score / scenarios.length)}
          totalAttempts={100} // Using 100 as total attempts (percentage)
          bestStreak={1} // This game doesn't track streaks, set to 1
          isNewHighScore={score / scenarios.length === 100} // Perfect score is new high score
          onPlayAgain={() => resetGame()}
          onBackToMenu={() => {
            setGameState('setup');
            setSelectedMode(null);
          }}
        />
      )}
    </div>
  );
}

export default FirewallRulesGame; 