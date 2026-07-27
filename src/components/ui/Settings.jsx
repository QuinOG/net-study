import React, { useState, useEffect, useContext } from 'react';
import { FiVolume2, FiVolumeX, FiMoon, FiSun, FiUser, FiBell, FiBellOff, FiSliders, FiRefreshCw, FiCheck, FiX, FiImage, FiMonitor } from 'react-icons/fi';
import '../../styles/ui/Settings.css';
import { UserContext } from '../../context/UserContext';
import { updateUserProfile } from '../../services/api';
import SoundManager from '../../utils/SoundManager';
import { useTheme } from '../../hooks/useTheme';

// Define localStorage keys
const SETTINGS_PREFIX = 'net-study-settings-';
const DARK_MODE_KEY = `${SETTINGS_PREFIX}darkMode`;
const SOUND_KEY = `${SETTINGS_PREFIX}soundEnabled`;
const NOTIFICATIONS_KEY = `${SETTINGS_PREFIX}notificationsEnabled`;
const DIFFICULTY_KEY = `${SETTINGS_PREFIX}defaultDifficulty`;
const USERNAME_KEY = `${SETTINGS_PREFIX}username`;
const EMAIL_KEY = `${SETTINGS_PREFIX}email`;
const AVATAR_KEY = `${SETTINGS_PREFIX}avatar`;

function Settings() {
  const { user, loading } = useContext(UserContext);
  const { theme, resolvedTheme, setTheme } = useTheme();

  // Initialize settings with localStorage values or defaults
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem(SOUND_KEY);
    return saved !== null ? JSON.parse(saved) : SoundManager.isSoundEnabled();
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem(NOTIFICATIONS_KEY);
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [defaultDifficulty, setDefaultDifficulty] = useState(() => {
    const saved = localStorage.getItem(DIFFICULTY_KEY);
    return saved !== null ? saved : 'medium';
  });
  
  const [username, setUsername] = useState(() => {
    const saved = localStorage.getItem(USERNAME_KEY);
    return saved !== null ? saved : '';
  });
  
  const [email, setEmail] = useState(() => {
    const saved = localStorage.getItem(EMAIL_KEY);
    return saved !== null ? saved : '';
  });

  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    const saved = localStorage.getItem(AVATAR_KEY);
    return saved !== null ? saved : 'avatar1.png';
  });

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Set username and email from user data when loaded
  useEffect(() => {
    if (!loading && user) {
      if (user.username && user.username !== username) {
        setUsername(user.username);
      }
      if (user.email && user.email !== email) {
        setEmail(user.email);
      }
    }
  }, [user, loading, username, email]);

  // Theme application and persistence are handled centrally by ThemeProvider.

  // Save sound setting to localStorage and update SoundManager
  useEffect(() => {
    // We don't call enableSound/disableSound as those don't exist
    // Instead, we'll just update localStorage, and SoundManager checks this value
    localStorage.setItem(SOUND_KEY, JSON.stringify(soundEnabled));
    
    // SoundManager reads directly from localStorage, so we just need to update that
    localStorage.setItem('netQuestSoundEnabled', soundEnabled.toString());
  }, [soundEnabled]);

  // Save other settings to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notificationsEnabled));
      localStorage.setItem(DIFFICULTY_KEY, defaultDifficulty);
      localStorage.setItem(USERNAME_KEY, username || '');
      localStorage.setItem(EMAIL_KEY, email || '');
      localStorage.setItem(AVATAR_KEY, selectedAvatar || 'avatar1.png');
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  }, [notificationsEnabled, defaultDifficulty, username, email, selectedAvatar]);

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    
    // Play click sound if we're enabling sound
    if (!soundEnabled) {
      SoundManager.play('click');
    }
  };

  const handleAvatarSelect = (avatar) => {
    try {
      setSelectedAvatar(avatar);
      // Save immediately to localStorage
      localStorage.setItem(AVATAR_KEY, avatar);
      
      if (soundEnabled) {
        SoundManager.play('click');
      }
    } catch (error) {
      console.error('Error selecting avatar:', error);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    setErrorMessage('');
    
    try {
      // If user is logged in (and not a guest), update profile
      if (user && !user.isGuest && user.id) {
        try {
          await updateUserProfile(user.id, {
            displayName: username,
            email: email,
            avatar: selectedAvatar,
            preferences: {
              theme,
              darkMode: resolvedTheme === 'dark',
              soundEnabled,
              notificationsEnabled,
              defaultDifficulty
            }
          });
        } catch (profileError) {
          console.error('Error updating user profile:', profileError);
          setErrorMessage('Failed to update profile. Please try again.');
          setIsSaving(false);
          return;
        }
      }
      
      // Show success message
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
      // Play success sound if enabled
      if (soundEnabled) {
        SoundManager.play('success');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setErrorMessage('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = () => {
    // Reset to default values
    setTheme('system');
    setSoundEnabled(true);
    setNotificationsEnabled(true);
    setDefaultDifficulty('medium');
    setSelectedAvatar('avatar1.png');
    
    // Don't reset username/email if user is logged in
    if (!user || user.isGuest) {
      setUsername('');
      setEmail('');
    }
    
    // ThemeProvider applies the resolved theme immediately.
    // Update localStorage for sound
    localStorage.setItem('netQuestSoundEnabled', 'true');
    
    // Clear any error messages
    setErrorMessage('');
    
    // Play click sound if enabled
    if (soundEnabled) {
      SoundManager.play('click');
    }
  };

  // Show loading state while user data is being fetched
  if (loading) {
    return (
      <div className="content">
        <h3 className="section-title">Settings</h3>
        <div className="settings-container">
          <div className="loading-message">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <header className="settings-page-header"><span className="nq-eyebrow">Account & preferences</span><h1 className="section-title">Settings</h1><p>Manage your profile, experience, and gameplay defaults.</p></header>
      
      {showSuccessMessage && (
        <div className="settings-success-message">
          <FiCheck size={18} />
          <span>Settings saved successfully!</span>
        </div>
      )}
      
      {errorMessage && (
        <div className="settings-error-message">
          <FiX size={18} />
          <span>{errorMessage}</span>
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
              className="settings-input" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              disabled={loading} 
            />
          </div>
          <div className="settings-option">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email"
              className="settings-input" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              disabled={loading} 
            />
          </div>
          
          <div className="settings-option avatar-selection">
            <span id="avatar-label">Select Avatar</span>
            <div className="avatar-options">
              {[1, 2, 3, 4, 5, 6].map((num) => {
                const avatarFile = `avatar${num}.png`;
                return (
                  <button type="button"
                    key={num}
                    className={`avatar-option ${selectedAvatar === avatarFile ? 'selected' : ''}`}
                    onClick={() => handleAvatarSelect(avatarFile)}
                    aria-label={`Use avatar ${num}`}
                    aria-pressed={selectedAvatar === avatarFile}
                  >
                    <img 
                      src={`/avatars/${avatarFile}`} 
                      alt={`Avatar ${num}`} 
                      title={`Avatar ${num}`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h4 className="settings-section-title">
            <FiSliders size={20} />
            <span>Appearance</span>
          </h4>
          <fieldset className="settings-option theme-choice">
            <legend>Theme</legend>
            <div className="settings-radio-group" role="radiogroup" aria-label="Theme preference">
              <label className={theme === 'system' ? 'active' : ''}><input type="radio" name="theme" value="system" checked={theme === 'system'} onChange={() => setTheme('system')} /><FiMonitor size={18} /><span>System</span></label>
              <label className={theme === 'dark' ? 'active' : ''}><input type="radio" name="theme" value="dark" checked={theme === 'dark'} onChange={() => setTheme('dark')} /><FiMoon size={18} /><span>Dark</span></label>
              <label className={theme === 'light' ? 'active' : ''}><input type="radio" name="theme" value="light" checked={theme === 'light'} onChange={() => setTheme('light')} /><FiSun size={18} /><span>Light</span></label>
            </div>
          </fieldset>
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
              aria-pressed={soundEnabled}
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
              className={`settings-toggle-btn ${notificationsEnabled ? 'active' : ''}`}
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              aria-pressed={notificationsEnabled}
            >
              {notificationsEnabled ? (
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
              <label 
                className={defaultDifficulty === 'easy' ? 'active' : ''}
                onClick={() => setDefaultDifficulty('easy')}
              >
                <input
                  type="radio"
                  name="difficulty"
                  value="easy"
                  checked={defaultDifficulty === 'easy'}
                  onChange={() => setDefaultDifficulty('easy')}
                />
                <span>Easy</span>
              </label>
              <label 
                className={defaultDifficulty === 'medium' ? 'active' : ''}
                onClick={() => setDefaultDifficulty('medium')}
              >
                <input
                  type="radio"
                  name="difficulty"
                  value="medium"
                  checked={defaultDifficulty === 'medium'}
                  onChange={() => setDefaultDifficulty('medium')}
                />
                <span>Medium</span>
              </label>
              <label 
                className={defaultDifficulty === 'hard' ? 'active' : ''}
                onClick={() => setDefaultDifficulty('hard')}
              >
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
          <button 
            className="settings-btn settings-reset" 
            onClick={resetSettings}
            disabled={isSaving}
          >
            <FiRefreshCw size={18} />
            <span>Reset to Default</span>
          </button>
          <button 
            className="settings-btn settings-save" 
            onClick={saveSettings}
            disabled={isSaving}
          >
            <FiCheck size={18} />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
