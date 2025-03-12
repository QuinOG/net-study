import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import SoundManager from '../../utils/SoundManager';
import scrollToTop from '../../utils/ScrollHelper';
import RewardAnimation from '../ui/RewardAnimation';
import GameEndScreen from '../ui/GameEndScreen';
import { FiClock, FiTarget, FiZap, FiShield, FiRefreshCw, FiSkipForward, FiAward, FiStar } from 'react-icons/fi';
import GameModeSelectScreen from '../ui/GameModeSelectScreen';
import DifficultySelectScreen from '../ui/DifficultySelectScreen';
import '../../styles/games/CommandLineChallenge.css';
import '../../styles/games/GameModeCards.css';

// Command line commands and their descriptions for different operating systems
const COMMAND_DATA = {
  // Linux/Unix commands
  "ls": { 
    description: "List directory contents", 
    os: "Linux/Unix", 
    category: "File Management",
    examples: ["ls -la", "ls /etc"] 
  },
  "cd": { 
    description: "Change directory", 
    os: "Linux/Unix", 
    category: "Navigation",
    examples: ["cd /home", "cd .."] 
  },
  "pwd": { 
    description: "Print working directory", 
    os: "Linux/Unix", 
    category: "Navigation",
    examples: ["pwd"] 
  },
  "mkdir": { 
    description: "Create a new directory", 
    os: "Linux/Unix", 
    category: "File Management",
    examples: ["mkdir newfolder", "mkdir -p path/to/dir"] 
  },
  "rm": { 
    description: "Remove files or directories", 
    os: "Linux/Unix", 
    category: "File Management",
    examples: ["rm file.txt", "rm -rf directory"] 
  },
  "cp": { 
    description: "Copy files and directories", 
    os: "Linux/Unix", 
    category: "File Management",
    examples: ["cp file.txt newfile.txt", "cp -r dir1 dir2"] 
  },
  "mv": { 
    description: "Move/rename files and directories", 
    os: "Linux/Unix", 
    category: "File Management",
    examples: ["mv file.txt newname.txt", "mv file.txt /path/to/dir"] 
  },
  "cat": { 
    description: "Concatenate and display file content", 
    os: "Linux/Unix", 
    category: "File Viewing",
    examples: ["cat file.txt", "cat file1.txt file2.txt"] 
  },
  "grep": { 
    description: "Search text patterns in files", 
    os: "Linux/Unix", 
    category: "Text Processing",
    examples: ["grep 'pattern' file.txt", "grep -r 'text' /dir"] 
  },
  "chmod": { 
    description: "Change file permissions", 
    os: "Linux/Unix", 
    category: "File Permissions",
    examples: ["chmod 755 file.sh", "chmod +x script.sh"] 
  },
  "chown": { 
    description: "Change file owner and group", 
    os: "Linux/Unix", 
    category: "File Permissions",
    examples: ["chown user:group file.txt", "chown -R user dir"] 
  },
  "ps": { 
    description: "Show process status", 
    os: "Linux/Unix", 
    category: "Process Management",
    examples: ["ps aux", "ps -ef"] 
  },
  "kill": { 
    description: "Terminate processes", 
    os: "Linux/Unix", 
    category: "Process Management",
    examples: ["kill 1234", "kill -9 5678"] 
  },
  "ifconfig": { 
    description: "Configure network interfaces", 
    os: "Linux/Unix", 
    category: "Networking",
    examples: ["ifconfig", "ifconfig eth0"] 
  },
  "ip": { 
    description: "Show/manipulate routing, devices, and tunnels", 
    os: "Linux/Unix", 
    category: "Networking",
    examples: ["ip addr", "ip route"] 
  },
  "ssh": { 
    description: "Secure shell remote login", 
    os: "Linux/Unix", 
    category: "Remote Access",
    examples: ["ssh user@host", "ssh -p 2222 user@host"] 
  },
  "scp": { 
    description: "Secure copy files between hosts", 
    os: "Linux/Unix", 
    category: "File Transfer",
    examples: ["scp file.txt user@host:/path", "scp -r dir user@host:/path"] 
  },
  "tar": { 
    description: "Tape archive utility", 
    os: "Linux/Unix", 
    category: "File Compression",
    examples: ["tar -cvf archive.tar dir/", "tar -xvf archive.tar"] 
  },
  "find": { 
    description: "Search for files in a directory hierarchy", 
    os: "Linux/Unix", 
    category: "File Management",
    examples: ["find . -name '*.txt'", "find /path -type f -mtime +30"] 
  },
  "df": { 
    description: "Display disk space usage", 
    os: "Linux/Unix", 
    category: "System Info",
    examples: ["df -h", "df -i"] 
  },
  
  // Windows commands
  "dir": { 
    description: "List directory contents", 
    os: "Windows", 
    category: "File Management",
    examples: ["dir", "dir /a"] 
  },
  "cd (Windows)": { 
    description: "Change directory", 
    os: "Windows", 
    category: "Navigation",
    examples: ["cd C:\\Users", "cd .."] 
  },
  "mkdir (Windows)": { 
    description: "Create a new directory", 
    os: "Windows", 
    category: "File Management",
    examples: ["mkdir newfolder", "md newfolder"] 
  },
  "rmdir": { 
    description: "Remove directory", 
    os: "Windows", 
    category: "File Management",
    examples: ["rmdir folder", "rd /s /q folder"] 
  },
  "del": { 
    description: "Delete files", 
    os: "Windows", 
    category: "File Management",
    examples: ["del file.txt", "del /f /q file.txt"] 
  },
  "copy": { 
    description: "Copy files", 
    os: "Windows", 
    category: "File Management",
    examples: ["copy file.txt newfile.txt", "copy *.txt C:\\destination"] 
  },
  "move": { 
    description: "Move files", 
    os: "Windows", 
    category: "File Management",
    examples: ["move file.txt newname.txt", "move file.txt C:\\destination"] 
  },
  "type": { 
    description: "Display file contents", 
    os: "Windows", 
    category: "File Viewing",
    examples: ["type file.txt"] 
  },
  "findstr": { 
    description: "Search for strings in files", 
    os: "Windows", 
    category: "Text Processing",
    examples: ["findstr \"text\" file.txt", "findstr /s /i \"pattern\" *.txt"] 
  },
  "tasklist": { 
    description: "Display all running tasks/processes", 
    os: "Windows", 
    category: "Process Management",
    examples: ["tasklist", "tasklist /fi \"imagename eq chrome.exe\""] 
  },
  "taskkill": { 
    description: "Terminate processes/tasks", 
    os: "Windows", 
    category: "Process Management",
    examples: ["taskkill /pid 1234", "taskkill /im chrome.exe /f"] 
  },
  "ipconfig": { 
    description: "Display IP configuration", 
    os: "Windows", 
    category: "Networking",
    examples: ["ipconfig", "ipconfig /all"] 
  },
  "netstat": { 
    description: "Display network statistics", 
    os: "Windows", 
    category: "Networking",
    examples: ["netstat -an", "netstat -b"] 
  },
  "ping": { 
    description: "Test network connectivity", 
    os: "Windows", 
    category: "Networking",
    examples: ["ping google.com", "ping 192.168.1.1 -t"] 
  },
  
  // macOS specific commands
  "open": { 
    description: "Open files or URLs", 
    os: "macOS", 
    category: "File Management",
    examples: ["open file.txt", "open https://apple.com"] 
  },
  "pbcopy": { 
    description: "Copy data to clipboard", 
    os: "macOS", 
    category: "Text Processing",
    examples: ["cat file.txt | pbcopy", "echo 'text' | pbcopy"] 
  },
  "pbpaste": { 
    description: "Paste data from clipboard", 
    os: "macOS", 
    category: "Text Processing",
    examples: ["pbpaste > file.txt", "pbpaste | grep 'text'"] 
  },
  "softwareupdate": { 
    description: "System software update tool", 
    os: "macOS", 
    category: "System Management",
    examples: ["softwareupdate -l", "softwareupdate -ia"] 
  },
  "defaults": { 
    description: "Access macOS user defaults system", 
    os: "macOS", 
    category: "System Management",
    examples: ["defaults read", "defaults write com.apple.finder AppleShowAllFiles YES"] 
  }
};

// Game modes
const GAME_MODES = {
  TIME_ATTACK: 'TIME_ATTACK',
  PRACTICE: 'PRACTICE'
};

// Difficulty levels with their settings
const DIFFICULTY_LEVELS = {
  EASY: {
    name: 'Easy',
    timeLimit: 60,
    timePenalty: 3,
    multiplier: 1,
    showHints: true,
    osFilter: null // All OS commands
  },
  MEDIUM: {
    name: 'Medium',
    timeLimit: 45,
    timePenalty: 5,
    multiplier: 1.5,
    showHints: false,
    osFilter: null // All OS commands
  },
  HARD: {
    name: 'Hard',
    timeLimit: 30,
    timePenalty: 7,
    multiplier: 2,
    showHints: false,
    osFilter: null // All OS commands
  }
};

function CommandLineChallenge() {
  const navigate = useNavigate();
  const { addXP } = useContext(UserContext);
  const timerRef = useRef(null);
  
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState(null);
  const [difficulty, setDifficulty] = useState('EASY');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [startTime, setStartTime] = useState(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameStats, setGameStats] = useState(() => {
    const savedStats = localStorage.getItem('commandLineStats');
    return savedStats ? JSON.parse(savedStats) : {
      bestScore: 0,
      bestStreak: 0,
      gamesPlayed: 0,
      totalAttempts: 0,
      correctAnswers: 0
    };
  });
  const [showDifficultySelect, setShowDifficultySelect] = useState(false);
  const [powerUps, setPowerUps] = useState({
    timeFreeze: 2,
    osReveal: 2,
    skipQuestion: 1
  });
  const [options, setOptions] = useState([]);
  const [feedback, setFeedback] = useState({ show: false, message: '', isCorrect: null });
  const [isCorrect, setIsCorrect] = useState(null);
  const [osFilter, setOsFilter] = useState(null);
  const [showExamples, setShowExamples] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [rewardText, setRewardText] = useState('');

  // Load game stats from context
  useEffect(() => {
    scrollToTop();
    
    // Set game context for volume balancing
    SoundManager.setGameContext('CommandLineChallenge');
    
    // Cleanup when component unmounts
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Reset game context when unmounting
      SoundManager.setGameContext('default');
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (gameStarted && gameMode === GAME_MODES.TIME_ATTACK && !showGameOver) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameStarted, gameMode, showGameOver]);

  // Effect to load game stats from localStorage when component mounts
  useEffect(() => {
    const savedStats = localStorage.getItem('commandLineStats');
    if (savedStats) {
      try {
        setGameStats(JSON.parse(savedStats));
      } catch (error) {
        console.error("Error parsing saved game stats:", error);
      }
    }
  }, []);

  // Function to get a random command
  const getRandomCommand = () => {
    try {
      const commandEntries = Object.entries(COMMAND_DATA);
      
      // Filter commands by OS if a filter is set
      const filteredCommands = osFilter 
        ? commandEntries.filter(([_, data]) => data.os === osFilter)
        : commandEntries;
      
      // If no commands match the filter, return a command without filtering
      if (filteredCommands.length === 0) {
        console.warn(`No commands found matching OS filter: ${osFilter}. Using all commands.`);
        
        // Clear the filter and try again
        setOsFilter(null);
        
        // Get a random command from all commands
        const randomIndex = Math.floor(Math.random() * commandEntries.length);
        const [command, data] = commandEntries[randomIndex];
        return { command, ...data };
      }
      
      // Get a random command from filtered list
      const randomIndex = Math.floor(Math.random() * filteredCommands.length);
      const [command, data] = filteredCommands[randomIndex];
      return { command, ...data };
    } catch (error) {
      console.error("Error in getRandomCommand:", error);
      // Return a fallback command if there's an error
      return {
        command: "ls",
        description: "List directory contents",
        os: "Linux/Unix",
        category: "File Management",
        examples: ["ls", "ls -la"]
      };
    }
  };

  // Generate a new question
  const generateQuestion = () => {
    const randomCommand = getRandomCommand();
    const questionType = Math.random() > 0.5 ? 'command' : 'description';
    
    let newQuestion;
    if (questionType === 'command') {
      newQuestion = {
        type: 'command',
        question: `What does the command "${randomCommand.command}" do?`,
        answer: randomCommand.description,
        command: randomCommand.command,
        os: randomCommand.os,
        category: randomCommand.category,
        examples: randomCommand.examples
      };
    } else {
      newQuestion = {
        type: 'description',
        question: `Which command ${randomCommand.os ? `in ${randomCommand.os}` : ''} would you use to "${randomCommand.description}"?`,
        answer: randomCommand.command,
        command: randomCommand.command,
        os: randomCommand.os,
        category: randomCommand.category,
        examples: randomCommand.examples
      };
    }
    
    setCurrentQuestion(newQuestion);
    
    // Generate options after setting the current question
    setOptions(generateOptions(questionType === 'command' ? randomCommand.description : randomCommand.command, questionType));
    
    setUserAnswer('');
    setIsCorrect(null);
    setFeedback({ show: false, message: '', isCorrect: null });
    setShowExamples(false);
  };

  // Generate multiple choice options
  const generateOptions = (correctAnswer, questionType) => {
    const options = [correctAnswer];
    
    const allPossibleAnswers = questionType === 'command' 
      ? Object.values(COMMAND_DATA).map(data => data.description)
      : Object.keys(COMMAND_DATA);
    
    // Filter out the correct answer
    const filteredAnswers = allPossibleAnswers.filter(ans => ans !== correctAnswer);
    
    // Shuffle and take 3 wrong answers
    for (let i = 0; i < 3; i++) {
      if (filteredAnswers.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredAnswers.length);
        options.push(filteredAnswers[randomIndex]);
        filteredAnswers.splice(randomIndex, 1);
      }
    }
    
    // Shuffle all options
    return options.sort(() => Math.random() - 0.5);
  };

  // Handle answer selection
  const handleAnswer = (selectedAnswer) => {
    if (isCorrect !== null) return; // Prevent multiple submissions
    
    setUserAnswer(selectedAnswer);
    setTotalAttempts(prev => prev + 1);
    
    if (selectedAnswer === currentQuestion.answer) {
      handleCorrectAnswer();
    } else {
      handleIncorrectAnswer();
    }
  };

  // Handle correct answer
  const handleCorrectAnswer = () => {
    SoundManager.play('correct');
    setIsCorrect(true);
    setFeedback({
      show: true,
      message: "Correct!",
      isCorrect: true
    });
    
    // Calculate score based on difficulty and remaining time
    const basePoints = 10;
    const timeBonus = gameMode === GAME_MODES.TIME_ATTACK ? Math.floor(timeRemaining / 5) : 0;
    const difficultyMultiplier = DIFFICULTY_LEVELS[difficulty].multiplier;
    const pointsEarned = Math.floor((basePoints + timeBonus) * difficultyMultiplier);
    
    setScore(prev => prev + pointsEarned);
    setCorrectAnswers(prev => prev + 1);
    setCurrentStreak(prev => prev + 1);
    
    // Show the examples for this command
    setShowExamples(true);
    
    // Move to next question after delay
    setTimeout(() => {
      setFeedback({ show: false, message: '', isCorrect: null });
      generateQuestion();
    }, 2500);
  };

  // Handle incorrect answer
  const handleIncorrectAnswer = () => {
    SoundManager.play('wrong');
    setIsCorrect(false);
    setFeedback({
      show: true,
      message: `Incorrect. The correct answer is: ${currentQuestion.answer}`,
      isCorrect: false
    });
    setCurrentStreak(0);
    
    // Apply time penalty in time attack mode
    if (gameMode === GAME_MODES.TIME_ATTACK) {
      setTimeRemaining(prev => Math.max(1, prev - DIFFICULTY_LEVELS[difficulty].timePenalty));
    }
    
    // Show the examples for this command
    setShowExamples(true);
    
    // Move to next question after delay
    setTimeout(() => {
      setFeedback({ show: false, message: '', isCorrect: null });
      generateQuestion();
    }, 3000);
  };

  // Handle power-up usage
  const handlePowerUp = (type) => {
    if (powerUps[type] > 0) {
      SoundManager.play('powerup');
      
      setPowerUps(prev => ({
        ...prev,
        [type]: prev[type] - 1
      }));
      
      switch (type) {
        case 'timeFreeze':
          // Pause the timer for 5 seconds
          setTimeRemaining(prev => prev + 5);
          setFeedback({
            show: true,
            message: "Time Freeze: +5 seconds!",
            isCorrect: null
          });
          setTimeout(() => setFeedback({ show: false, message: '', isCorrect: null }), 1500);
          break;
          
        case 'osReveal':
          // Reveal the OS for the current command
          setFeedback({
            show: true,
            message: `OS Hint: This is a ${currentQuestion.os} command!`,
            isCorrect: null
          });
          setTimeout(() => setFeedback({ show: false, message: '', isCorrect: null }), 2000);
          break;
          
        case 'skipQuestion':
          // Skip to the next question without penalty
          setFeedback({
            show: true,
            message: "Question skipped!",
            isCorrect: null
          });
          setTimeout(() => {
            setFeedback({ show: false, message: '', isCorrect: null });
            generateQuestion();
          }, 1000);
          break;
          
        default:
          break;
      }
    }
  };

  // Initialize game
  const initializeGame = (mode, diff) => {
    try {
      // Reset game state
      setScore(0);
      setCorrectAnswers(0);
      setTotalAttempts(0);
      setCurrentStreak(0);
      setShowGameOver(false);
      setUserAnswer('');
      setIsCorrect(null);
      setShowExamples(false);
      
      // Set game parameters
      setGameMode(mode);
      setDifficulty(diff);
      
      // Load game settings based on difficulty
      const settings = DIFFICULTY_LEVELS[diff];
      setTimeRemaining(settings.timeLimit);
      setPowerUps({
        timeFreeze: settings.powerUps?.timeFreeze || 2,
        osReveal: settings.powerUps?.osReveal || 2,
        skipQuestion: settings.powerUps?.skipQuestion || 1
      });
      
      // Apply OS filter if applicable
      if (settings.osFilter !== undefined) {
        setOsFilter(settings.osFilter);
      }
      
      // Clear current question first to avoid render issues
      setCurrentQuestion(null);
      setOptions([]);
      
      // Generate first question (using a timeout to ensure state is updated)
      setTimeout(() => {
        try {
          // Generate first question
          const randomCommand = getRandomCommand();
          if (!randomCommand) {
            console.error("Failed to get a random command");
            return;
          }
          
          const questionType = Math.random() > 0.5 ? 'command' : 'description';
          
          const newQuestion = questionType === 'command'
            ? {
                type: 'command',
                question: `What does the command "${randomCommand.command}" do?`,
                answer: randomCommand.description,
                command: randomCommand.command,
                os: randomCommand.os,
                category: randomCommand.category,
                examples: randomCommand.examples
              }
            : {
                type: 'description',
                question: `Which command ${randomCommand.os ? `in ${randomCommand.os}` : ''} would you use to "${randomCommand.description}"?`,
                answer: randomCommand.command,
                command: randomCommand.command,
                os: randomCommand.os,
                category: randomCommand.category,
                examples: randomCommand.examples
              };
          
          setCurrentQuestion(newQuestion);
          
          // Generate options for the new question
          const newOptions = generateOptions(
            questionType === 'command' ? randomCommand.description : randomCommand.command, 
            questionType
          );
          setOptions(newOptions);
          
          // Now that we have a valid question, start the game
          setGameStarted(true);
          
          // Set start time
          setStartTime(Date.now());
          
          // Play sound
          SoundManager.play('gameStart');
        } catch (innerError) {
          console.error("Error generating initial question:", innerError);
          alert("Error starting the game. Please try again.");
        }
      }, 0);
      
      scrollToTop();
    } catch (error) {
      console.error("Error starting game:", error);
      // If there's an error, don't start the game
      alert("There was an error starting the game. Please try again.");
    }
  };

  // End the game and update stats
  const endGame = async () => {
    console.log("Game ending! Processing final stats...");
    
    // Clear interval
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Update game stats
    const bestScoreUpdated = score > gameStats.bestScore;
    const bestStreakUpdated = currentStreak > gameStats.bestStreak;
    
    const updatedStats = {
      ...gameStats,
      bestScore: Math.max(gameStats.bestScore, score),
      bestStreak: Math.max(gameStats.bestStreak, currentStreak),
      gamesPlayed: gameStats.gamesPlayed + 1,
      totalAttempts: gameStats.totalAttempts + totalAttempts,
      correctAnswers: gameStats.correctAnswers + correctAnswers
    };
    
    setGameStats(updatedStats);
    
    // Save stats to localStorage
    localStorage.setItem('commandLineStats', JSON.stringify(updatedStats));
    console.log("Game stats updated:", updatedStats);
    
    // Award XP based on score
    if (score > 0) {
      try {
        const xpEarned = Math.max(10, Math.floor(score / 10));
        console.log(`Awarding ${xpEarned} XP for score of ${score}`);
        const result = await addXP(xpEarned);
        
        if (result.error) {
          console.error("Error awarding XP:", result.error);
        } else {
          console.log("XP award successful:", result);
          
          if (result.oldXP !== undefined && result.newXP !== undefined) {
            console.log(`XP updated: ${result.oldXP} → ${result.newXP} (+${result.xpEarned})`);
          }
          
          if (result.levelUp) {
            console.log("User leveled up!");
            // TODO: Add level up celebration
          }
        }
      } catch (error) {
        console.error("Exception when awarding XP:", error);
      }
    } else {
      console.log("No XP awarded - score was 0");
    }
    
    // Set game over state
    setShowGameOver(true);
    
    // Play game over sound
    SoundManager.play('gameOver');
  };

  // Return to home
  const handleBack = () => {
    SoundManager.play('click');
    navigate('/dashboard');
  };

  // Select game mode
  const handleModeSelect = (mode) => {
    SoundManager.play('click');
    setGameMode(mode);
    setShowDifficultySelect(true);
  };

  // Select difficulty level
  const handleDifficultySelect = (diff) => {
    SoundManager.play('click');
    initializeGame(gameMode, diff);
  };

  // Filter commands by OS
  const handleOsFilter = (os) => {
    setOsFilter(os);
    SoundManager.play('click');
  };

  // Restart the game
  const handleRestart = () => {
    SoundManager.play('click');
    initializeGame(gameMode, difficulty);
  };

  // Render the game menu
  if (!gameStarted && !showGameOver && !showDifficultySelect) {
    return (
      <div className="command-line-game">
        <h2 className="game-title">Command Line Challenge</h2>
        <p className="game-description">
          Test your knowledge of command line commands and their functions!
        </p>
        
        <GameModeSelectScreen 
          gameStats={gameStats}
          onTimeAttackSelect={() => handleModeSelect(GAME_MODES.TIME_ATTACK)}
          onPracticeModeSelect={() => handleModeSelect(GAME_MODES.PRACTICE)}
        />
      </div>
    );
  }
  
  // Rendering difficulty selection
  if (showDifficultySelect) {
    return (
      <div className="command-line-game">
        <h2 className="game-title">Command Line Challenge</h2>
        
        <DifficultySelectScreen
          difficultyLevels={DIFFICULTY_LEVELS}
          onSelectDifficulty={handleDifficultySelect}
          onBackClick={() => {
            setShowDifficultySelect(false);
            scrollToTop();
          }}
        />
        
        <div className="os-filter">
          <h3>Filter by OS (Optional)</h3>
          <div className="os-buttons">
            <button 
              className={`os-button ${osFilter === null ? 'active' : ''}`}
              onClick={() => handleOsFilter(null)}
            >
              All OS
            </button>
            <button 
              className={`os-button ${osFilter === 'Linux/Unix' ? 'active' : ''}`}
              onClick={() => handleOsFilter('Linux/Unix')}
            >
              Linux/Unix
            </button>
            <button 
              className={`os-button ${osFilter === 'Windows' ? 'active' : ''}`}
              onClick={() => handleOsFilter('Windows')}
            >
              Windows
            </button>
            <button 
              className={`os-button ${osFilter === 'macOS' ? 'active' : ''}`}
              onClick={() => handleOsFilter('macOS')}
            >
              macOS
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Rendering game over screen
  if (showGameOver) {
    const isNewHighScore = score > gameStats.bestScore;
    return (
      <GameEndScreen
        gameTitle="Command Line Challenge"
        score={score}
        bestScore={gameStats.bestScore}
        xpEarned={Math.round(score / 10)}
        correctAnswers={correctAnswers}
        totalAttempts={correctAnswers + totalAttempts - correctAnswers}
        bestStreak={Math.max(currentStreak, gameStats.bestStreak)}
        isNewHighScore={isNewHighScore}
        onPlayAgain={() => initializeGame(gameMode, difficulty)}
        onBackToMenu={() => {
          setShowGameOver(false);
          setGameMode(null);
          setShowDifficultySelect(false);
          scrollToTop();
        }}
      />
    );
  }
  
  // Rendering main game interface
  return (
    <div className="command-line-game">
      {showReward && <RewardAnimation text={rewardText} onComplete={() => setShowReward(false)} />}
      <div className="game-header">
        <div className="game-info">
          <div className="mode-indicator">
            {gameMode === GAME_MODES.TIME_ATTACK ? 'Time Attack' : 'Practice Mode'}
            <span className="difficulty-badge">{DIFFICULTY_LEVELS[difficulty].name}</span>
          </div>
          
          <div className="score-display">
            Score: <span>{score}</span>
          </div>
          
          {gameMode === GAME_MODES.TIME_ATTACK && (
            <div className={`time-display ${timeRemaining < 10 ? 'urgent' : ''}`}>
              Time: <span>{timeRemaining}s</span>
            </div>
          )}
          
          <div className="streak-display">
            Streak: <span>{currentStreak}</span>
          </div>
        </div>
        
        <div className="power-ups">
          <button 
            className={`power-up-btn ${powerUps.timeFreeze > 0 ? '' : 'disabled'}`}
            onClick={() => handlePowerUp('timeFreeze')}
            disabled={gameMode === GAME_MODES.PRACTICE || powerUps.timeFreeze <= 0}
          >
            ⏱️ Freeze ({powerUps.timeFreeze})
          </button>
          
          <button 
            className={`power-up-btn ${powerUps.osReveal > 0 ? '' : 'disabled'}`}
            onClick={() => handlePowerUp('osReveal')}
            disabled={powerUps.osReveal <= 0}
          >
            💻 OS Hint ({powerUps.osReveal})
          </button>
          
          <button 
            className={`power-up-btn ${powerUps.skipQuestion > 0 ? '' : 'disabled'}`}
            onClick={() => handlePowerUp('skipQuestion')}
            disabled={gameMode === GAME_MODES.PRACTICE || powerUps.skipQuestion <= 0}
          >
            ⏭️ Skip ({powerUps.skipQuestion})
          </button>
        </div>
      </div>
      
      <div className="game-content">
        {feedback.show && (
          <div className={`feedback-message ${feedback.isCorrect === true ? 'correct' : feedback.isCorrect === false ? 'incorrect' : ''}`}>
            {feedback.message}
          </div>
        )}
        
        {currentQuestion ? (
          <>
            <div className="question-container">
              <h3 className="question-text">{currentQuestion.question}</h3>
              
              {DIFFICULTY_LEVELS[difficulty].showHints && (
                <div className="hint">
                  <span className="hint-label">Hint:</span> 
                  <span className="hint-text">Category: {currentQuestion.category}</span>
                </div>
              )}
              
              {gameMode === GAME_MODES.TIME_ATTACK && (
                <div className="timer-bar-container">
                  <div 
                    className={`timer-bar ${timeRemaining < 10 ? 'urgent' : ''}`} 
                    style={{width: `${(timeRemaining / DIFFICULTY_LEVELS[difficulty].timeLimit) * 100}%`}}
                  ></div>
                </div>
              )}
            </div>
            
            <div className="answer-options">
              {options.map((option, index) => (
                <button
                  key={index}
                  className={`answer-option ${userAnswer === option ? (isCorrect === true ? 'correct' : isCorrect === false ? 'incorrect' : '') : ''} ${isCorrect !== null && option === currentQuestion.answer ? 'correct' : ''}`}
                  onClick={() => handleAnswer(option)}
                  disabled={isCorrect !== null}
                >
                  {option}
                </button>
              ))}
            </div>
            
            {showExamples && currentQuestion.examples && (
              <div className="examples-container">
                <h4>Example usage of '{currentQuestion.command}':</h4>
                <ul className="examples-list">
                  {currentQuestion.examples.map((example, index) => (
                    <li key={index} className="example-item">
                      <code>{example}</code>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <div className="loading-container">
            <p>Loading question...</p>
          </div>
        )}
        
        {currentStreak >= 3 && (
          <div className="combo-display">
            <span>Combo: <span className="combo-count">{currentStreak}</span></span>
            <span>Multiplier: <span className="multiplier">x{(1 + (currentStreak * 0.1)).toFixed(1)}</span></span>
          </div>
        )}
      </div>
      
      {/* Back to menu and End Game buttons */}
      <div style={{ marginTop: '2rem', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        {gameMode === GAME_MODES.PRACTICE ? (
          <button 
            className="restart-btn"
            onClick={() => endGame()}
          >
            End Game & Collect XP
          </button>
        ) : (
          <button 
            className="back-btn"
            onClick={() => {
              if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
              }
              setGameStarted(false);
              scrollToTop();
            }}
          >
            Back to Menu
          </button>
        )}
      </div>
    </div>
  );
}

export default CommandLineChallenge; 