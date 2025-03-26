import React, { useState, useEffect } from 'react';
import { FiBook, FiServer, FiWifi, FiShield, FiGlobe, FiCode, FiLock, FiLayers, FiCheck, FiCpu, FiChevronDown, FiLoader, FiStar, FiTrendingUp, FiAward, FiZap, FiTarget, FiActivity, FiFlag, FiBarChart2, FiCalendar } from 'react-icons/fi';
import '../../styles/ui/LearningPaths.css';
import { Link } from 'react-router-dom';

// Define modules array before the component
const modules = [
  {
    id: 'module1',
    title: 'Introduction to Networking Concepts',
    description: 'Learn the fundamental concepts and history of computer networks.',
    icon: <FiWifi />,
    progress: 40,
    xpReward: 500,
    skillLevel: 'Foundational',
    tags: ['Basics', 'Theory', 'History'],
    completionBadge: 'Network Pioneer',
    lessons: [
      {
        id: 'lesson1_1',
        title: 'Definition and Importance of Computer Networks',
        description: 'Understand what computer networks are and why they are essential in modern computing.',
        duration: '20-25 minutes',
        difficulty: 'Beginner',
        status: 'completed',
        xpReward: 100,
        path: '/dashboard/learning/module/1/lesson/1'
      },
      {
        id: 'lesson1_2',
        title: 'Brief History of Computer Networks',
        description: 'Understand the evolution of computer networks from their early beginnings to today\'s internet.',
        duration: '25-30 minutes',
        difficulty: 'Beginner',
        status: 'available',
        xpReward: 100,
        path: '/dashboard/learning/module/1/lesson/2'
      },
      {
        id: 'lesson1_3',
        title: 'Types of Computer Networks',
        description: 'Explore different network classifications based on scale, technology, and architecture.',
        duration: '25-30 minutes',
        difficulty: 'Beginner',
        status: 'locked',
        xpReward: 100,
        path: '/dashboard/learning/module/1/lesson/3'
      },
      {
        id: 'lesson1_4',
        title: 'Network Topologies',
        description: 'Learn about the physical and logical arrangements of network components.',
        duration: '30-35 minutes',
        difficulty: 'Beginner',
        status: 'locked',
        xpReward: 100,
        path: '/dashboard/learning/module/1/lesson/4'
      },
      {
        id: 'lesson1_5',
        title: 'Network Components',
        description: 'Understand the hardware and software elements that make up computer networks.',
        duration: '30-35 minutes',
        difficulty: 'Beginner',
        status: 'locked',
        xpReward: 100,
        path: '/dashboard/learning/module/1/lesson/5'
      }
    ]
  },
  {
    id: 'module2',
    title: 'Network Models and Protocols',
    description: 'Dive into the layered approach to networking and essential protocols.',
    icon: <FiLayers />,
    progress: 0,
    xpReward: 750,
    skillLevel: 'Intermediate',
    tags: ['Protocols', 'Models', 'Routing'],
    completionBadge: 'Protocol Master',
    lessons: [
      {
        id: 'lesson2_1',
        title: 'OSI Reference Model',
        description: 'Understand the seven-layer conceptual model that standardizes network functions.',
        duration: '30-35 minutes',
        difficulty: 'Intermediate',
        status: 'available',
        xpReward: 150,
        path: '/dashboard/learning/module/2/lesson/1'
      },
      {
        id: 'lesson2_2',
        title: 'TCP/IP Model',
        description: 'Learn about the model that forms the foundation of the modern internet.',
        duration: '30-35 minutes',
        difficulty: 'Intermediate',
        status: 'available',
        xpReward: 150,
        path: '/dashboard/learning/module/2/lesson/2'
      },
      {
        id: 'lesson2_3',
        title: 'IP Addressing and Subnetting',
        description: 'Master the fundamentals of IPv4, IPv6, and subnet calculations.',
        duration: '40-45 minutes',
        difficulty: 'Intermediate',
        status: 'available',
        xpReward: 150,
        path: '/dashboard/learning/module/2/lesson/3'
      },
      {
        id: 'lesson2_4',
        title: 'Key Network Protocols',
        description: 'Explore essential protocols like HTTP, DNS, DHCP, and more.',
        duration: '35-40 minutes',
        difficulty: 'Intermediate',
        status: 'available',
        xpReward: 150,
        path: '/dashboard/learning/module/2/lesson/4'
      },
      {
        id: 'lesson2_5',
        title: 'Routing Protocols',
        description: 'Understand how networks determine the optimal path for data transmission.',
        duration: '40-45 minutes',
        difficulty: 'Intermediate',
        status: 'available',
        xpReward: 150,
        path: '/dashboard/learning/module/2/lesson/5'
      }
    ]
  },
  {
    id: 'module3',
    title: 'Network Security Fundamentals',
    description: 'Learn about protecting networks from threats and vulnerabilities.',
    icon: <FiShield />,
    progress: 0,
    xpReward: 1000,
    skillLevel: 'Advanced',
    lessons: [
      {
        id: 'lesson3_1',
        title: 'Network Security Principles',
        description: 'Understand the core concepts and importance of network security.',
        duration: '30-35 minutes',
        difficulty: 'Intermediate',
        status: 'locked',
        xpReward: 200,
        path: '/dashboard/learning/module/3/lesson/1'
      },
      {
        id: 'lesson3_2',
        title: 'Common Network Threats',
        description: 'Identify and understand various attacks that target networks.',
        duration: '35-40 minutes',
        difficulty: 'Intermediate',
        status: 'locked',
        xpReward: 200,
        path: '/dashboard/learning/module/3/lesson/2'
      },
      {
        id: 'lesson3_3',
        title: 'Firewalls and Access Control',
        description: 'Learn how to control traffic and protect network boundaries.',
        duration: '35-40 minutes',
        difficulty: 'Intermediate',
        status: 'available',
        xpReward: 200,
        path: '/dashboard/learning/module/3/lesson/3'
      },
      {
        id: 'lesson3_4',
        title: 'Encryption and VPNs',
        description: 'Understand how to secure data transmission across networks.',
        duration: '40-45 minutes',
        difficulty: 'Advanced',
        status: 'available',
        xpReward: 200,
        path: '/dashboard/learning/module/3/lesson/4'
      },
      {
        id: 'lesson3_5',
        title: 'Network Monitoring and Intrusion Detection',
        description: 'Learn techniques to detect and respond to network security incidents.',
        duration: '40-45 minutes',
        difficulty: 'Advanced',
        status: 'available',
        xpReward: 200,
        path: '/dashboard/learning/module/3/lesson/5'
      }
    ]
  },
  {
    id: 'module4',
    title: 'Wireless Networking',
    description: 'Explore the principles and security considerations of wireless networks.',
    icon: <FiGlobe />,
    progress: 0,
    xpReward: 800,
    skillLevel: 'Intermediate',
    lessons: [
      {
        id: 'lesson4_1',
        title: 'Wireless Network Fundamentals',
        description: 'Understand the basics of wireless communication and standards.',
        duration: '30-35 minutes',
        difficulty: 'Intermediate',
        status: 'available',
        xpReward: 150,
        path: '/dashboard/learning/module/4/lesson/1'
      },
      {
        id: 'lesson4_2',
        title: 'Wi-Fi Standards and Technologies',
        description: 'Learn about different Wi-Fi protocols and their capabilities.',
        duration: '35-40 minutes',
        difficulty: 'Intermediate',
        status: 'available',
        xpReward: 150,
        path: '/dashboard/learning/module/4/lesson/2'
      },
      {
        id: 'lesson4_3',
        title: 'Wireless Security',
        description: 'Explore security challenges and solutions specific to wireless networks.',
        duration: '40-45 minutes',
        difficulty: 'Advanced',
        status: 'available',
        xpReward: 150,
        path: '/dashboard/learning/module/4/lesson/3'
      },
      {
        id: 'lesson4_4',
        title: 'Wireless Network Design',
        description: 'Learn principles for planning and implementing effective wireless networks.',
        duration: '35-40 minutes',
        difficulty: 'Advanced',
        status: 'available',
        xpReward: 150,
        path: '/dashboard/learning/module/4/lesson/4'
      },
      {
        id: 'lesson4_5',
        title: 'Emerging Wireless Technologies',
        description: 'Discover new developments in wireless networking like 5G and IoT.',
        duration: '30-35 minutes',
        difficulty: 'Advanced',
        status: 'available',
        xpReward: 150,
        path: '/dashboard/learning/module/4/lesson/5'
      }
    ]
  },
  {
    id: 'module5',
    title: 'Network Troubleshooting',
    description: 'Master the techniques to identify and resolve network issues.',
    icon: <FiServer />,
    progress: 0,
    xpReward: 1200,
    skillLevel: 'Advanced',
    lessons: [
      {
        id: 'lesson5_1',
        title: 'Network Troubleshooting Methodology',
        description: 'Learn systematic approaches to diagnosing network problems.',
        duration: '35-40 minutes',
        difficulty: 'Advanced',
        status: 'available',
        xpReward: 200,
        path: '/dashboard/learning/module/5/lesson/1'
      },
      {
        id: 'lesson5_2',
        title: 'Network Diagnostic Tools',
        description: 'Master essential tools like ping, traceroute, netstat, and packet analyzers.',
        duration: '40-45 minutes',
        difficulty: 'Advanced',
        status: 'available',
        xpReward: 200,
        path: '/dashboard/learning/module/5/lesson/2'
      },
      {
        id: 'lesson5_3',
        title: 'Common Network Issues',
        description: 'Identify and resolve frequently encountered network problems.',
        duration: '35-40 minutes',
        difficulty: 'Advanced',
        status: 'available',
        xpReward: 200,
        path: '/dashboard/learning/module/5/lesson/3'
      },
      {
        id: 'lesson5_4',
        title: 'Performance Optimization',
        description: 'Learn techniques to analyze and improve network performance.',
        duration: '40-45 minutes',
        difficulty: 'Advanced',
        status: 'available',
        xpReward: 200,
        path: '/dashboard/learning/module/5/lesson/4'
      },
      {
        id: 'lesson5_5',
        title: 'Network Documentation and Maintenance',
        description: 'Understand best practices for maintaining network infrastructure.',
        duration: '30-35 minutes',
        difficulty: 'Advanced',
        status: 'available',
        xpReward: 200,
        path: '/dashboard/learning/module/5/lesson/5'
      }
    ]
  }
];

// User levels configuration
const userLevels = [
  { level: 1, minXP: 0, title: "Network Novice" },
  { level: 2, minXP: 500, title: "Connection Apprentice" },
  { level: 3, minXP: 1200, title: "Protocol Adept" },
  { level: 4, minXP: 2000, title: "Network Specialist" },
  { level: 5, minXP: 3000, title: "Cyber Guardian" },
  { level: 6, minXP: 4500, title: "Network Architect" },
  { level: 7, minXP: 6000, title: "Infrastructure Sage" },
  { level: 8, minXP: 8000, title: "Network Maestro" }
];

// Achievement definitions
const achievements = [
  { id: 'first_lesson', title: 'First Steps', description: 'Complete your first lesson', icon: <FiFlag />, xpReward: 50 },
  { id: 'first_module', title: 'Module Master', description: 'Complete your first module', icon: <FiAward />, xpReward: 200 },
  { id: 'streak_3', title: 'Focus Streak', description: 'Complete 3 lessons in a row', icon: <FiZap />, xpReward: 150 },
  { id: 'all_beginner', title: 'Foundation Builder', description: 'Complete all beginner lessons', icon: <FiTarget />, xpReward: 300 }
];

// Add last 7 days activity data (changed from 30 days)
const generateActivityData = () => {
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6); // Start 6 days ago to include today (total 7 days)
  
  const activityData = [];
  const currentDate = new Date(sevenDaysAgo);
  
  // Generate random activity data for the past 7 days
  while (currentDate <= today) {
    // Higher chance of activity in recent days for a realistic pattern
    const daysAgo = Math.floor((today - currentDate) / (24 * 60 * 60 * 1000));
    const activityProbability = 0.6 - (daysAgo / 20); // Higher probability for recent days
    
    const hasActivity = Math.random() < Math.max(0.1, activityProbability);
    const intensity = hasActivity ? Math.floor(Math.random() * 4) + 1 : 0; // 0-4 scale of intensity
    
    activityData.push({
      date: new Date(currentDate),
      intensity
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return activityData;
};

// Calculate current streak from activity data
const calculateCurrentStreak = (activityData) => {
  if (!activityData || activityData.length === 0) return 0;
  
  // Sort activity data by date (newest first)
  const sortedData = [...activityData].sort((a, b) => b.date - a.date);
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if there's activity today
  const todayData = sortedData.find(item => 
    item.date.getDate() === today.getDate() && 
    item.date.getMonth() === today.getMonth() && 
    item.date.getFullYear() === today.getFullYear()
  );
  
  // If no activity today, check if there was activity yesterday
  if (!todayData || todayData.intensity === 0) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const yesterdayData = sortedData.find(item => 
      item.date.getDate() === yesterday.getDate() && 
      item.date.getMonth() === yesterday.getMonth() && 
      item.date.getFullYear() === yesterday.getFullYear()
    );
    
    // If no activity yesterday either, streak is 0
    if (!yesterdayData || yesterdayData.intensity === 0) {
      return 0;
    }
  }
  
  // Count consecutive days with activity
  let currentDate = new Date(today);
  let keepCounting = true;
  
  while (keepCounting) {
    // Find if there's data for the current date we're checking
    const dateData = sortedData.find(item => 
      item.date.getDate() === currentDate.getDate() && 
      item.date.getMonth() === currentDate.getMonth() && 
      item.date.getFullYear() === currentDate.getFullYear()
    );
    
    // If there's activity on this date, increase streak
    if (dateData && dateData.intensity > 0) {
      streak++;
      // Move to previous day
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // Break the streak
      keepCounting = false;
    }
  }
  
  return streak;
};

const LearningPaths = () => {
  const [expandedModule, setExpandedModule] = useState('module1');
  const [loading, setLoading] = useState(true);
  const [modulesData, setModulesData] = useState(modules);
  const [userProgress, setUserProgress] = useState({
    totalXP: 0,
    level: 1,
    completedLessons: [],
    achievements: [],
    streak: 0,
    lastActivity: null
  });
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showAchievement, setShowAchievement] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  
  // Calculate user level based on XP
  const calculateLevel = (xp) => {
    for (let i = userLevels.length - 1; i >= 0; i--) {
      if (xp >= userLevels[i].minXP) {
        return userLevels[i];
      }
    }
    return userLevels[0];
  };

  useEffect(() => {
    // Simulate loading of content
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Effect to sync with localStorage completed lessons and update XP
  useEffect(() => {
    const updateUserProgress = () => {
      const completedLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]');
      
      // Calculate total XP from completed lessons
      let totalXP = 0;
      let earnedAchievements = [];
      
      // Check each module and its lessons
      modulesData.forEach(module => {
        let moduleCompletedCount = 0;
        
        module.lessons.forEach(lesson => {
          const lessonKey = `module${lesson.path.split('/')[3]}_lesson${lesson.path.split('/')[5]}`;
          
          // Count completed lessons and add XP
          if (completedLessons.includes(lessonKey)) {
            totalXP += lesson.xpReward;
            moduleCompletedCount++;
          }
        });
        
        // Check if module is fully completed
        if (moduleCompletedCount === module.lessons.length) {
          totalXP += 200; // Bonus for completing entire module
        }
      });
      
      // Check if already have first_lesson achievement
      if (completedLessons.length > 0 && !userProgress.achievements.includes('first_lesson')) {
        earnedAchievements.push('first_lesson');
        totalXP += achievements.find(a => a.id === 'first_lesson').xpReward;
      }
      
      // Save everything to progress
      const currentLevel = calculateLevel(userProgress.totalXP);
      const newLevel = calculateLevel(totalXP);
      
      // Trigger level up animation if applicable
      if (newLevel.level > currentLevel.level && userProgress.totalXP > 0) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
      }
      
      // Show achievement notification if new achievements
      if (earnedAchievements.length > 0) {
        setShowAchievement(earnedAchievements[0]);
        setTimeout(() => setShowAchievement(null), 3000);
      }
      
      setUserProgress(prev => ({
        ...prev,
        totalXP,
        level: newLevel.level,
        levelTitle: newLevel.title,
        completedLessons,
        achievements: [...prev.achievements, ...earnedAchievements]
      }));
      
      // After updating, recalculate module progress
      updateModuleProgress(completedLessons);
    };
    
    const updateModuleProgress = (completedLessons) => {
      // Update progress percentage for each module
      const updatedModules = modulesData.map(module => {
        const totalLessons = module.lessons.length;
        let completedCount = 0;
        
        module.lessons.forEach(lesson => {
          const lessonKey = `module${lesson.path.split('/')[3]}_lesson${lesson.path.split('/')[5]}`;
          if (completedLessons.includes(lessonKey)) {
            completedCount++;
          }
        });
        
        const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
        
        return {
          ...module,
          progress: progressPercentage
        };
      });
      
      setModulesData(updatedModules);
    };
    
    // Initial update
    updateUserProgress();
    
    // Listen for storage events (if another tab updates localStorage)
    window.addEventListener('storage', updateUserProgress);
    
    return () => {
      window.removeEventListener('storage', updateUserProgress);
    };
  }, []);

  useEffect(() => {
    // Initialize activity data
    const generatedActivityData = generateActivityData();
    setActivityData(generatedActivityData);
    
    // Calculate current streak
    setCurrentStreak(calculateCurrentStreak(generatedActivityData));
  }, []);

  const toggleModule = (moduleId) => {
    if (expandedModule === moduleId) {
      setExpandedModule(null);
    } else {
      setExpandedModule(moduleId);
    }
  };

  // Status icons
  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return <span className="status-icon completed"><FiCheck /></span>;
      case 'available':
        return <span className="status-icon available"></span>;
      case 'locked':
        return <span className="status-icon locked"><FiLock /></span>;
      default:
        return null;
    }
  };

  // Difficulty badge
  const getDifficultyBadge = (difficulty) => {
    let className = 'difficulty-badge';
    
    switch(difficulty.toLowerCase()) {
      case 'beginner':
        className += ' beginner';
        break;
      case 'intermediate':
        className += ' intermediate';
        break;
      case 'advanced':
        className += ' advanced';
        break;
      default:
        break;
    }
    
    return <span className={className}>{difficulty}</span>;
  };

  // Calculate progress to next level
  const getProgressToNextLevel = () => {
    const currentLevel = calculateLevel(userProgress.totalXP);
    const nextLevelIndex = userLevels.findIndex(l => l.level === currentLevel.level) + 1;
    
    if (nextLevelIndex >= userLevels.length) {
      return { current: 100, max: 100, percentage: 100 }; // Max level reached
    }
    
    const nextLevel = userLevels[nextLevelIndex];
    const xpForCurrentLevel = currentLevel.minXP;
    const xpForNextLevel = nextLevel.minXP;
    const xpRange = xpForNextLevel - xpForCurrentLevel;
    const userXpInLevel = userProgress.totalXP - xpForCurrentLevel;
    const percentage = Math.round((userXpInLevel / xpRange) * 100);
    
    return {
      current: userXpInLevel,
      max: xpRange,
      percentage
    };
  };

  // Get the day name for the date label
  const getDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };
  
  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Get tooltip text based on activity intensity
  const getActivityTooltip = (activity) => {
    const date = formatDate(activity.date);
    
    if (activity.intensity === 0) {
      return `No activity on ${date}`;
    } else if (activity.intensity === 1) {
      return `Light activity on ${date}`;
    } else if (activity.intensity === 2) {
      return `Moderate activity on ${date}`;
    } else if (activity.intensity === 3) {
      return `High activity on ${date}`;
    } else {
      return `Very high activity on ${date}`;
    }
  };

  if (loading) {
    return (
      <div className="learning-paths-container loading-container">
        <div className="loading-animation">
          <FiLoader className="spinner" />
          <p>Loading learning paths...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="learning-paths-container">
      {/* Level up notification */}
      {showLevelUp && (
        <div className="level-up-notification">
          <div className="level-up-icon">
            <FiTrendingUp />
          </div>
          <div className="level-up-text">
            <h3>Level Up!</h3>
            <p>You've reached level {userProgress.level}: {userProgress.levelTitle}</p>
          </div>
        </div>
      )}
      
      {/* Achievement notification */}
      {showAchievement && (
        <div className="achievement-notification">
          <div className="achievement-icon">
            {achievements.find(a => a.id === showAchievement)?.icon || <FiAward />}
          </div>
          <div className="achievement-text">
            <h3>Achievement Unlocked!</h3>
            <p>{achievements.find(a => a.id === showAchievement)?.title}</p>
          </div>
        </div>
      )}
    
      {/* User progress dashboard */}
      <div className="user-progress-dashboard">
        <div className="user-level-info">
          <div className="user-level-badge">
            <span className="level-number">{userProgress.level}</span>
          </div>
          <div className="user-level-details">
            <h3>{userProgress.levelTitle || 'Network Novice'}</h3>
            <div className="level-progress-container">
              <div className="level-progress-bar">
                <div 
                  className="level-progress-fill" 
                  style={{width: `${getProgressToNextLevel().percentage}%`}}
                ></div>
              </div>
              <span className="level-progress-text">
                {getProgressToNextLevel().current} / {getProgressToNextLevel().max} XP to next level
              </span>
            </div>
          </div>
        </div>
        
        <div className="user-stats">
          <div className="user-stat">
            <FiBarChart2 />
            <span className="stat-value">{userProgress.totalXP}</span>
            <span className="stat-label">Total XP</span>
          </div>
          <div className="user-stat">
            <FiCheck />
            <span className="stat-value">{userProgress.completedLessons.length}</span>
            <span className="stat-label">Lessons Completed</span>
          </div>
          <div className="user-stat">
            <FiAward />
            <span className="stat-value">{userProgress.achievements.length}</span>
            <span className="stat-label">Achievements</span>
          </div>
          <div className="user-stat streak-stat">
            <FiActivity />
            <span className="stat-value">{currentStreak}</span>
            <span className="stat-label">Day Streak</span>
            {currentStreak >= 3 && (
              <div className="streak-fire-icon">🔥</div>
            )}
          </div>
        </div>
      </div>

      <div className="learning-paths-header">
        <h1>Learning Paths</h1>
        <p>Master networking concepts through structured learning paths with interactive lessons and hands-on activities</p>
      </div>

      {/* Activity Heatmap Calendar */}
      <div className="activity-heatmap-section">
        <div className="heatmap-header">
          <h2><FiCalendar /> Weekly Activity</h2>
          <p>Track your study consistency over the past week</p>
        </div>
        <div className="activity-heatmap">
          {activityData.map((activity, index) => (
            <div 
              key={index} 
              className={`activity-day intensity-${activity.intensity}`}
              title={getActivityTooltip(activity)}
              aria-label={getActivityTooltip(activity)}
            >
              <span className="day-label">{getDayName(activity.date)}</span>
              <span className="date-label">{activity.date.getDate()}</span>
            </div>
          ))}
        </div>
        <div className="heatmap-legend">
          <div className="legend-item">
            <div className="legend-color intensity-0"></div>
            <span>No Activity</span>
          </div>
          <div className="legend-item">
            <div className="legend-color intensity-1"></div>
            <span>Light</span>
          </div>
          <div className="legend-item">
            <div className="legend-color intensity-2"></div>
            <span>Moderate</span>
          </div>
          <div className="legend-item">
            <div className="legend-color intensity-3"></div>
            <span>High</span>
          </div>
          <div className="legend-item">
            <div className="legend-color intensity-4"></div>
            <span>Very High</span>
          </div>
        </div>
      </div>

      <div className="learning-paths-content">
        {modulesData.map((module, index) => (
          <div 
            key={module.id} 
            className={`learning-module ${expandedModule === module.id ? 'expanded' : ''}`}
            style={{ '--animation-order': index }}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                toggleModule(module.id);
                e.preventDefault();
              }
            }}
          >
            <div 
              className="module-header" 
              onClick={() => toggleModule(module.id)}
              aria-expanded={expandedModule === module.id}
              aria-controls={`${module.id}-lessons`}
            >
              <div className="module-icon-container">
                <div className="module-icon">{module.icon}</div>
              </div>
              <div className="module-info">
                <div className="module-title-container">
                  <h2>{module.title}</h2>
                  <div className="module-tags">
                    {module.tags && module.tags.map((tag, index) => (
                      <span key={index} className="module-tag">{tag}</span>
                    ))}
                  </div>
                </div>
                <p>{module.description}</p>
                <div className="module-progress-container">
                  <div className="module-progress-bar">
                    <div 
                      className="module-progress-fill" 
                      style={{width: `${module.progress}%`}}
                      aria-valuemin="0"
                      aria-valuemax="100"
                      aria-valuenow={module.progress}
                      role="progressbar"
                    ></div>
                  </div>
                  <span className="module-progress-text">{module.progress}% Complete</span>
                </div>
              </div>
              <div className="module-xp-reward">
                <div className="xp-badge">
                  <FiZap />
                  <span>{module.xpReward} XP</span>
                </div>
                <div className="skill-level-badge">{module.skillLevel || 'Beginner'}</div>
              </div>
              <div className="module-toggle">
                <FiChevronDown className={expandedModule === module.id ? 'rotate' : ''} />
                <span className="sr-only">{expandedModule === module.id ? 'Collapse' : 'Expand'} module</span>
              </div>
            </div>
            
            <div 
              className="module-lessons" 
              id={`${module.id}-lessons`}
              aria-hidden={expandedModule !== module.id}
            >
              {module.lessons.map((lesson, lessonIndex) => (
                <div 
                  key={lesson.id} 
                  className={`lesson-card ${lesson.status}`}
                  style={{ '--animation-order': lessonIndex }}
                >
                  <div className="lesson-header">
                    <h3>{lesson.title}</h3>
                    {getStatusIcon(lesson.status)}
                  </div>
                  <p className="lesson-description">{lesson.description}</p>
                  <div className="lesson-meta">
                    <span className="lesson-duration"><FiCpu /> {lesson.duration}</span>
                    {getDifficultyBadge(lesson.difficulty)}
                  </div>
                  <div className="lesson-footer">
                    <div className="lesson-xp-reward">
                      <FiZap />
                      <span>{lesson.xpReward} XP</span>
                    </div>
                    {lesson.status !== 'locked' && (
                      <Link 
                        to={lesson.path} 
                        className="start-lesson-btn"
                        aria-label={`${lesson.status === 'completed' ? 'Review' : 'Start'} lesson: ${lesson.title}`}
                      >
                        {lesson.status === 'completed' ? 'Review Lesson' : 'Start Lesson'}
                      </Link>
                    )}
                    {lesson.status === 'locked' && (
                      <button 
                        className="start-lesson-btn locked" 
                        disabled
                        aria-label={`Lesson locked: ${lesson.title}`}
                      >
                        Locked
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Module completion badge - shown when module is 100% complete */}
              {module.progress === 100 && (
                <div className="module-completion-badge">
                  <div className="badge-icon">
                    <FiAward />
                  </div>
                  <div className="badge-info">
                    <h3>Module Completed!</h3>
                    <p>Badge Earned: {module.completionBadge || 'Module Master'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Achievements Section */}
      <div className="achievements-section">
        <h2>Your Achievements</h2>
        <div className="achievements-grid">
          {achievements.map((achievement, index) => {
            const isUnlocked = userProgress.achievements.includes(achievement.id);
            return (
              <div 
                key={achievement.id} 
                className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                style={{ '--animation-order': index + modulesData.length }}
                tabIndex={0}
              >
                <div className="achievement-card-icon">
                  {achievement.icon}
                </div>
                <div className="achievement-card-content">
                  <h3>{achievement.title}</h3>
                  <p>{achievement.description}</p>
                  <div className="achievement-card-reward">
                    <FiZap />
                    <span>{achievement.xpReward} XP</span>
                  </div>
                </div>
                {!isUnlocked && <div className="achievement-lock-overlay"><FiLock /></div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LearningPaths; 