import { Howl } from 'howler';

// Create a sounds directory in public folder if you want to use custom sounds later

// Define fallback sound effects that will work without custom files
const defaultSounds = {
  click: { frequency: 800, type: 'sine', duration: 0.1 },
  correct: { frequency: 1200, type: 'sine', duration: 0.15 },
  incorrect: { frequency: 300, type: 'triangle', duration: 0.3 },
  levelUp: { frequency: [500, 800, 1000], type: 'sine', duration: 0.6 },
  achievement: { frequency: [600, 800, 1000, 1200], type: 'sine', duration: 0.8 },
  countdown: { frequency: 400, type: 'sine', duration: 0.2 },
  streakMilestone: { frequency: [700, 900, 1100], type: 'sine', duration: 0.5 },
  gameOver: { frequency: [400, 350, 300], type: 'sawtooth', duration: 0.7 },
};

// For custom sound files when you add them later
const customSounds = {};

// User preference for sound (default on)
let soundEnabled = localStorage.getItem('netQuestSoundEnabled') !== 'false';
let audioContext = null;

// Sound manager API
const SoundManager = {
  // Play a sound effect
  play: (soundName) => {
    if (!soundEnabled) return;
    
    // Try to play custom sound if available
    if (customSounds[soundName]) {
      customSounds[soundName].play();
      return;
    }
    
    // Fallback to generating sound with Web Audio API
    playTone(soundName);
  },
  
  // Load a custom sound
  loadSound: (name, url) => {
    customSounds[name] = new Howl({ src: [url], volume: 0.7 });
  },
  
  // Toggle sound on/off
  toggleSound: () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem('netQuestSoundEnabled', soundEnabled.toString());
    
    // Play a test sound when enabling
    if (soundEnabled) {
      SoundManager.play('click');
    }
    
    return soundEnabled;
  },
  
  // Get current sound state
  isSoundEnabled: () => soundEnabled
};

// Helper function to generate tones
function playTone(soundName) {
  if (!defaultSounds[soundName]) return;
  
  try {
    // Initialize AudioContext on first use (needs user interaction first)
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const sound = defaultSounds[soundName];
    
    // Handle frequency arrays (for multi-tone sounds)
    if (Array.isArray(sound.frequency)) {
      const totalDuration = sound.duration;
      const toneCount = sound.frequency.length;
      const toneDuration = totalDuration / toneCount;
      
      sound.frequency.forEach((freq, index) => {
        setTimeout(() => {
          playSimpleTone(freq, sound.type, toneDuration);
        }, index * toneDuration * 1000);
      });
    } else {
      // Simple single tone
      playSimpleTone(sound.frequency, sound.type, sound.duration);
    }
  } catch (err) {
    console.log('Audio error:', err);
  }
}

function playSimpleTone(frequency, type, duration) {
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Apply volume envelope
    gainNode.gain.value = 0.3;
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch (err) {
    console.log('Tone generation error:', err);
  }
}

export default SoundManager; 