import React, { useState, useEffect } from 'react';
import { FiBook, FiServer, FiWifi, FiShield, FiGlobe, FiCode, FiLock, FiLayers, FiCheck, FiCpu, FiChevronDown, FiLoader } from 'react-icons/fi';
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
    lessons: [
      {
        id: 'lesson1_1',
        title: 'Definition and Importance of Computer Networks',
        description: 'Understand what computer networks are and why they are essential in modern computing.',
        duration: '20-25 minutes',
        difficulty: 'Beginner',
        status: 'completed',
        path: '/dashboard/learning/module/1/lesson/1'
      },
      {
        id: 'lesson1_2',
        title: 'Brief History of Computer Networks',
        description: 'Understand the evolution of computer networks from their early beginnings to today\'s internet.',
        duration: '25-30 minutes',
        difficulty: 'Beginner',
        status: 'available',
        path: '/dashboard/learning/module/1/lesson/2'
      },
      {
        id: 'lesson1_3',
        title: 'Types of Computer Networks',
        description: 'Explore different network classifications based on scale, technology, and architecture.',
        duration: '25-30 minutes',
        difficulty: 'Beginner',
        status: 'locked',
        path: '/dashboard/learning/module/1/lesson/3'
      },
      {
        id: 'lesson1_4',
        title: 'Network Topologies',
        description: 'Learn about the physical and logical arrangements of network components.',
        duration: '30-35 minutes',
        difficulty: 'Beginner',
        status: 'locked',
        path: '/dashboard/learning/module/1/lesson/4'
      },
      {
        id: 'lesson1_5',
        title: 'Network Components',
        description: 'Understand the hardware and software elements that make up computer networks.',
        duration: '30-35 minutes',
        difficulty: 'Beginner',
        status: 'locked',
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
    lessons: [
      {
        id: 'lesson2_1',
        title: 'OSI Reference Model',
        description: 'Understand the seven-layer conceptual model that standardizes network functions.',
        duration: '30-35 minutes',
        difficulty: 'Intermediate',
        status: 'locked',
        path: '/dashboard/learning/module/2/lesson/1'
      },
      {
        id: 'lesson2_2',
        title: 'TCP/IP Model',
        description: 'Learn about the model that forms the foundation of the modern internet.',
        duration: '30-35 minutes',
        difficulty: 'Intermediate',
        status: 'locked',
        path: '/dashboard/learning/module/2/lesson/2'
      },
      {
        id: 'lesson2_3',
        title: 'IP Addressing and Subnetting',
        description: 'Master the fundamentals of IPv4, IPv6, and subnet calculations.',
        duration: '40-45 minutes',
        difficulty: 'Intermediate',
        status: 'locked',
        path: '/dashboard/learning/module/2/lesson/3'
      },
      {
        id: 'lesson2_4',
        title: 'Key Network Protocols',
        description: 'Explore essential protocols like HTTP, DNS, DHCP, and more.',
        duration: '35-40 minutes',
        difficulty: 'Intermediate',
        status: 'locked',
        path: '/dashboard/learning/module/2/lesson/4'
      },
      {
        id: 'lesson2_5',
        title: 'Routing Protocols',
        description: 'Understand how networks determine the optimal path for data transmission.',
        duration: '40-45 minutes',
        difficulty: 'Intermediate',
        status: 'locked',
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
    lessons: [
      {
        id: 'lesson3_1',
        title: 'Network Security Principles',
        description: 'Understand the core concepts and importance of network security.',
        duration: '30-35 minutes',
        difficulty: 'Intermediate',
        status: 'locked',
        path: '/dashboard/learning/module/3/lesson/1'
      },
      {
        id: 'lesson3_2',
        title: 'Common Network Threats',
        description: 'Identify and understand various attacks that target networks.',
        duration: '35-40 minutes',
        difficulty: 'Intermediate',
        status: 'locked',
        path: '/dashboard/learning/module/3/lesson/2'
      },
      {
        id: 'lesson3_3',
        title: 'Firewalls and Access Control',
        description: 'Learn how to control traffic and protect network boundaries.',
        duration: '35-40 minutes',
        difficulty: 'Intermediate',
        status: 'locked',
        path: '/dashboard/learning/module/3/lesson/3'
      },
      {
        id: 'lesson3_4',
        title: 'Encryption and VPNs',
        description: 'Understand how to secure data transmission across networks.',
        duration: '40-45 minutes',
        difficulty: 'Advanced',
        status: 'locked',
        path: '/dashboard/learning/module/3/lesson/4'
      },
      {
        id: 'lesson3_5',
        title: 'Network Monitoring and Intrusion Detection',
        description: 'Learn techniques to detect and respond to network security incidents.',
        duration: '40-45 minutes',
        difficulty: 'Advanced',
        status: 'locked',
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
    lessons: [
      {
        id: 'lesson4_1',
        title: 'Wireless Network Fundamentals',
        description: 'Understand the basics of wireless communication and standards.',
        duration: '30-35 minutes',
        difficulty: 'Intermediate',
        status: 'locked',
        path: '/dashboard/learning/module/4/lesson/1'
      },
      {
        id: 'lesson4_2',
        title: 'Wi-Fi Standards and Technologies',
        description: 'Learn about different Wi-Fi protocols and their capabilities.',
        duration: '35-40 minutes',
        difficulty: 'Intermediate',
        status: 'locked',
        path: '/dashboard/learning/module/4/lesson/2'
      },
      {
        id: 'lesson4_3',
        title: 'Wireless Security',
        description: 'Explore security challenges and solutions specific to wireless networks.',
        duration: '40-45 minutes',
        difficulty: 'Advanced',
        status: 'locked',
        path: '/dashboard/learning/module/4/lesson/3'
      },
      {
        id: 'lesson4_4',
        title: 'Wireless Network Design',
        description: 'Learn principles for planning and implementing effective wireless networks.',
        duration: '35-40 minutes',
        difficulty: 'Advanced',
        status: 'locked',
        path: '/dashboard/learning/module/4/lesson/4'
      },
      {
        id: 'lesson4_5',
        title: 'Emerging Wireless Technologies',
        description: 'Discover new developments in wireless networking like 5G and IoT.',
        duration: '30-35 minutes',
        difficulty: 'Advanced',
        status: 'locked',
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
    lessons: [
      {
        id: 'lesson5_1',
        title: 'Network Troubleshooting Methodology',
        description: 'Learn systematic approaches to diagnosing network problems.',
        duration: '35-40 minutes',
        difficulty: 'Advanced',
        status: 'locked',
        path: '/dashboard/learning/module/5/lesson/1'
      },
      {
        id: 'lesson5_2',
        title: 'Network Diagnostic Tools',
        description: 'Master essential tools like ping, traceroute, netstat, and packet analyzers.',
        duration: '40-45 minutes',
        difficulty: 'Advanced',
        status: 'locked',
        path: '/dashboard/learning/module/5/lesson/2'
      },
      {
        id: 'lesson5_3',
        title: 'Common Network Issues',
        description: 'Identify and resolve frequently encountered network problems.',
        duration: '35-40 minutes',
        difficulty: 'Advanced',
        status: 'locked',
        path: '/dashboard/learning/module/5/lesson/3'
      },
      {
        id: 'lesson5_4',
        title: 'Performance Optimization',
        description: 'Learn techniques to analyze and improve network performance.',
        duration: '40-45 minutes',
        difficulty: 'Advanced',
        status: 'locked',
        path: '/dashboard/learning/module/5/lesson/4'
      },
      {
        id: 'lesson5_5',
        title: 'Network Documentation and Maintenance',
        description: 'Understand best practices for maintaining network infrastructure.',
        duration: '30-35 minutes',
        difficulty: 'Advanced',
        status: 'locked',
        path: '/dashboard/learning/module/5/lesson/5'
      }
    ]
  }
];

const LearningPaths = () => {
  const [expandedModule, setExpandedModule] = useState('module1');
  const [loading, setLoading] = useState(true);
  const [modulesData, setModulesData] = useState(modules);

  useEffect(() => {
    // Simulate loading of content
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Effect to sync with localStorage completed lessons
  useEffect(() => {
    const updateLessonStatus = () => {
      const completedLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]');
      
      // Create a deep copy of modules to update
      const updatedModules = modules.map(module => {
        // Calculate which lessons are completed
        const updatedLessons = module.lessons.map(lesson => {
          const lessonKey = `module${module.id.replace('module', '')}_lesson${lesson.id.replace(`lesson${module.id.replace('module', '')}_`, '')}`;
          
          // If the lesson is marked as completed in localStorage
          if (completedLessons.includes(lessonKey)) {
            return { ...lesson, status: 'completed' };
          }
          
          // If previous lesson is completed, make this one available
          const lessonNumber = parseInt(lesson.id.replace(`lesson${module.id.replace('module', '')}_`, ''));
          const prevLessonKey = `module${module.id.replace('module', '')}_lesson${lessonNumber - 1}`;
          
          if (lessonNumber > 1 && completedLessons.includes(prevLessonKey)) {
            return { ...lesson, status: 'available' };
          }
          
          // Otherwise keep the status as is
          return lesson;
        });
        
        // Calculate module progress
        const totalLessons = updatedLessons.length;
        const completedCount = updatedLessons.filter(l => l.status === 'completed').length;
        const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
        
        return {
          ...module,
          lessons: updatedLessons,
          progress
        };
      });
      
      // Update the first lesson of the first module to be available if nothing is completed
      if (completedLessons.length === 0 && updatedModules.length > 0 && updatedModules[0].lessons.length > 0) {
        updatedModules[0].lessons[0].status = 'available';
      }
      
      // Update the state with the new module data
      setModulesData(updatedModules);
    };
    
    // Initial update
    updateLessonStatus();
    
    // Listen for storage events (if another tab updates localStorage)
    window.addEventListener('storage', updateLessonStatus);
    
    return () => {
      window.removeEventListener('storage', updateLessonStatus);
    };
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
      <div className="learning-paths-header">
        <h1>Learning Paths</h1>
        <p>Master networking concepts through structured learning paths with interactive lessons and hands-on activities</p>
      </div>

      <div className="learning-paths-content">
        {modulesData.map((module) => (
          <div 
            key={module.id} 
            className={`learning-module ${expandedModule === module.id ? 'expanded' : ''}`}
          >
            <div className="module-header" onClick={() => toggleModule(module.id)}>
              <div className="module-icon-container">
                <div className="module-icon">{module.icon}</div>
              </div>
              <div className="module-info">
                <h2>{module.title}</h2>
                <p>{module.description}</p>
                <div className="module-progress-container">
                  <div className="module-progress-bar">
                    <div className="module-progress-fill" style={{width: `${module.progress}%`}}></div>
                  </div>
                  <span className="module-progress-text">{module.progress}% Complete</span>
                </div>
              </div>
              <div className="module-toggle">
                <FiChevronDown className={expandedModule === module.id ? 'rotate' : ''} />
              </div>
            </div>
            
            <div className="module-lessons">
              {module.lessons.map((lesson) => (
                <div key={lesson.id} className={`lesson-card ${lesson.status}`}>
                  <div className="lesson-header">
                    <h3>{lesson.title}</h3>
                    {getStatusIcon(lesson.status)}
                  </div>
                  <p className="lesson-description">{lesson.description}</p>
                  <div className="lesson-meta">
                    <span className="lesson-duration"><FiCpu /> {lesson.duration}</span>
                    {getDifficultyBadge(lesson.difficulty)}
                  </div>
                  {lesson.status !== 'locked' && (
                    <Link to={lesson.path} className="start-lesson-btn">
                      {lesson.status === 'completed' ? 'Review Lesson' : 'Start Lesson'}
                    </Link>
                  )}
                  {lesson.status === 'locked' && (
                    <button className="start-lesson-btn locked" disabled>
                      Locked
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningPaths; 