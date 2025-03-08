import React, { useState, useEffect } from 'react';
import { FiVolume2, FiVolumeX } from 'react-icons/fi';
import { BsSun, BsMoon } from 'react-icons/bs';
import { BiReset } from 'react-icons/bi';
import SoundManager from '../../utils/SoundManager';

function Settings() {
  // Default to dark mode (set true to start with dark mode enabled)
  const [darkMode, setDarkMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(SoundManager.isSoundEnabled());

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

  return (
    <div className="content" style={{ padding: '2rem', textAlign: 'center' }}>
      <h3 className="section-title">Settings</h3>
      <div className="game-card" style={{ marginTop: '2rem' }}>
        <h4>Display</h4>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <button className="collapse-btn" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? (
              <span>
                <span role="img" aria-label="sun" style={{ marginRight: '0.5rem' }}>⚪</span>
                Switch to Light Mode
              </span>
            ) : (
              <span>
                <span role="img" aria-label="moon" style={{ marginRight: '0.5rem' }}>⚫</span>
                Switch to Dark Mode
              </span>
            )}
          </button>
        </div>
        
        <h4>Sound</h4>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <button className="collapse-btn" onClick={toggleSound}>
            {soundEnabled ? (
              <span>
                <span role="img" aria-label="sound on" style={{ marginRight: '0.5rem' }}>🔊</span>
                Sound On - Click to Mute
              </span>
            ) : (
              <span>
                <span role="img" aria-label="sound off" style={{ marginRight: '0.5rem' }}>🔇</span>
                Sound Off - Click to Unmute
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
