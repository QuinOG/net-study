import React, { useState, useEffect } from 'react';
import { FiVolume2, FiVolumeX, FiMoon, FiSun, FiUser, FiMail, FiBell, FiBellOff, FiSliders, FiRefreshCw, FiCheck, FiX } from 'react-icons/fi';
import SoundManager from '../../utils/SoundManager';
import '../../styles/ui/Settings.css';

function Settings() {
  // Default to dark mode (set true to start with dark mode enabled)
  const [darkMode, setDarkMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(SoundManager.isSoundEnabled());
  const [notifications, setNotifications] = useState(true);
  const [defaultDifficulty, setDefaultDifficulty] = useState('medium');
  const [username, setUsername] = useState('NetworkMaster');
  const [email, setEmail] = useState('user@example.com');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // When darkMode changes, add or remove the "light-mode" class from <body>
  useEffect(() => {
    if (darkMode) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }, [darkMode]);

  const toggleSound = () => {
    // Initialize audio context if enabling sound
    if (!soundEnabled) {
      // This creates an AudioContext which will allow sounds to play
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const audioCtx = new AudioContext();
        
        // Create and play a silent sound to initialize audio
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 0; // Silent
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.01);
      }
    }
    
    const isEnabled = SoundManager.toggleSound();
    setSoundEnabled(isEnabled);
    
    // Play test sound if enabled
    if (isEnabled) {
      SoundManager.play('click');
    }
  };

  const saveSettings = () => {
    // In a real app, you would save these settings to backend/localStorage
    console.log('Saving settings:', {
      darkMode,
      soundEnabled,
      notifications,
      defaultDifficulty,
      username,
      email
    });
    
    // Show success message
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const resetSettings = () => {
    setDarkMode(true);
    setSoundEnabled(true);
    setNotifications(true);
    setDefaultDifficulty('medium');
    document.body.classList.remove('light-mode');
    SoundManager.enableSound();
  };

  return (
    <div className="content">
      <h3 className="section-title">Settings</h3>
      
      {showSuccessMessage && (
        <div className="settings-success-message">
          <FiCheck size={18} />
          <span>Settings saved successfully!</span>
        </div>
      )}
      
      <div className="settings-container">
        <div className="settings-section">
          <h4 className="settings-section-title">
            <FiUser size={20} />
            <span>Profile</span>
          </h4>
          <div className="settings-option">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="settings-input"
            />
          </div>
          <div className="settings-option">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="settings-input"
            />
          </div>
        </div>

        <div className="settings-section">
          <h4 className="settings-section-title">
            <FiSliders size={20} />
            <span>Appearance</span>
          </h4>
          <div className="settings-option">
            <span>Theme</span>
            <button 
              className={`settings-toggle-btn ${!darkMode ? 'active' : ''}`}
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? (
                <>
                  <FiSun size={18} />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <FiMoon size={18} />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h4 className="settings-section-title">
            <FiVolume2 size={20} />
            <span>Sound</span>
          </h4>
          <div className="settings-option">
            <span>Sound Effects</span>
            <button 
              className={`settings-toggle-btn ${soundEnabled ? 'active' : ''}`}
              onClick={toggleSound}
            >
              {soundEnabled ? (
                <>
                  <FiVolume2 size={18} />
                  <span>Enabled</span>
                </>
              ) : (
                <>
                  <FiVolumeX size={18} />
                  <span>Disabled</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h4 className="settings-section-title">
            <FiBell size={20} />
            <span>Notifications</span>
          </h4>
          <div className="settings-option">
            <span>Daily Challenges</span>
            <button 
              className={`settings-toggle-btn ${notifications ? 'active' : ''}`}
              onClick={() => setNotifications(!notifications)}
            >
              {notifications ? (
                <>
                  <FiBell size={18} />
                  <span>Enabled</span>
                </>
              ) : (
                <>
                  <FiBellOff size={18} />
                  <span>Disabled</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h4 className="settings-section-title">
            <FiSliders size={20} />
            <span>Game Preferences</span>
          </h4>
          <div className="settings-option">
            <span>Default Difficulty</span>
            <div className="settings-radio-group">
              <label className={defaultDifficulty === 'easy' ? 'active' : ''}>
                <input 
                  type="radio" 
                  name="difficulty" 
                  value="easy" 
                  checked={defaultDifficulty === 'easy'} 
                  onChange={() => setDefaultDifficulty('easy')} 
                />
                <span>Easy</span>
              </label>
              <label className={defaultDifficulty === 'medium' ? 'active' : ''}>
                <input 
                  type="radio" 
                  name="difficulty" 
                  value="medium" 
                  checked={defaultDifficulty === 'medium'} 
                  onChange={() => setDefaultDifficulty('medium')} 
                />
                <span>Medium</span>
              </label>
              <label className={defaultDifficulty === 'hard' ? 'active' : ''}>
                <input 
                  type="radio" 
                  name="difficulty" 
                  value="hard" 
                  checked={defaultDifficulty === 'hard'} 
                  onChange={() => setDefaultDifficulty('hard')} 
                />
                <span>Hard</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="settings-actions">
          <button className="settings-btn settings-reset" onClick={resetSettings}>
            <FiRefreshCw size={18} />
            <span>Reset to Default</span>
          </button>
          <button className="settings-btn settings-save" onClick={saveSettings}>
            <FiCheck size={18} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
