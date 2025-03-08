import React, { useState, useEffect } from 'react';

function Settings() {
  // Default to dark mode (set true to start with dark mode enabled)
  const [darkMode, setDarkMode] = useState(true);

  // When darkMode changes, add or remove the "light-mode" class from <body>
  useEffect(() => {
    if (darkMode) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }, [darkMode]);

  return (
    <div className="content" style={{ padding: '2rem', textAlign: 'center' }}>
      <h3 className="section-title">Settings</h3>
      <div className="" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
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
      </div>
    </div>
  );
}

export default Settings;
