import { Howl } from 'howler';

// Updated default sound definitions with parameters tuned for richer, more engaging sounds
const defaultSounds = {
  click: { frequency: 800, type: 'sine', duration: 0.15, volume: 0.4 },
  correct: { frequency: 1200, type: 'sine', duration: 0.3, volume: 0.2 },
  incorrect: { frequency: 300, type: 'triangle', duration: 0.35, volume: 0.2 },
  levelUp: { frequency: [500, 800, 1000], type: 'sine', duration: 0.8, volume: 0.2 },
  achievement: { frequency: [600, 800, 1000, 1200], type: 'sine', duration: 1.0, volume: 0.2 },
  countdown: { frequency: 400, type: 'sine', duration: 0.3, volume: 0.18 },
  streakMilestone: { frequency: [700, 900, 1100], type: 'sine', duration: 0.6, volume: 0.2 },
  gameOver: { frequency: [400, 350, 300], type: 'sawtooth', duration: 1.0, volume: 0.2 },
};

const gameVolumeMultipliers = {
  default: 1.0,
  TechAcronymQuiz: 0.6, // Specific adjustment for a game context
};

const customSounds = {};
let soundEnabled = localStorage.getItem('netQuestSoundEnabled') !== 'false';
let audioContext = null;
let currentGameContext = 'default';

const SoundManager = {
  play: (soundName) => {
    if (!soundEnabled) return;
    if (customSounds[soundName]) {
      const baseVolume = customSounds[soundName]._volume || 0.4;
      const multiplier = gameVolumeMultipliers[currentGameContext] || 1.0;
      customSounds[soundName].volume(baseVolume * multiplier);
      customSounds[soundName].play();
      return;
    }
    playTone(soundName);
  },
  
  loadSound: (name, url) => {
    customSounds[name] = new Howl({ src: [url], volume: 0.4 });
  },
  
  setGameContext: (gameName) => {
    currentGameContext = gameName;
  },
  
  toggleSound: () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem('netQuestSoundEnabled', soundEnabled.toString());
    if (soundEnabled) {
      SoundManager.play('click');
    }
    return soundEnabled;
  },
  
  isSoundEnabled: () => soundEnabled
};

SoundManager.loadSound('click', '../sounds/click.mp3');
SoundManager.loadSound('correct', '../sounds/correct.mp3');
SoundManager.loadSound('incorrect', '../sounds/incorrect.mp3');
SoundManager.loadSound('gameOver', '../sounds/gameover.mp3');
SoundManager.loadSound('streakMilestone', '../sounds/streak.mp3');
SoundManager.loadSound('achievement', '../sounds/streak.mp3');
SoundManager.loadSound('countdown', '../sounds/streak.mp3');
SoundManager.loadSound('levelUp', '../sounds/streak.mp3');

function playTone(soundName) {
  if (!defaultSounds[soundName]) return;
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const sound = defaultSounds[soundName];
    const multiplier = gameVolumeMultipliers[currentGameContext] || 1.0;
    const adjustedVolume = (sound.volume || 0.2) * multiplier;
    
    // Handle arrays of frequencies by splitting duration evenly
    if (Array.isArray(sound.frequency)) {
      const totalDuration = sound.duration;
      const toneCount = sound.frequency.length;
      const toneDuration = totalDuration / toneCount;
      sound.frequency.forEach((freq, index) => {
        setTimeout(() => {
          playSuperAdvancedTone(freq, sound.type, toneDuration, adjustedVolume);
        }, index * toneDuration * 1000);
      });
    } else {
      playSuperAdvancedTone(sound.frequency, sound.type, sound.duration, adjustedVolume);
    }
  } catch (err) {
    console.log('Audio error:', err);
  }
}

// New super advanced tone generator with vibrato, distortion, and a delay (chorus-like effect)
function playSuperAdvancedTone(frequency, type, duration, volume = 0.2) {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const now = audioContext.currentTime;
    
    // ADSR envelope parameters
    const attack = 0.1 * duration;
    const decay = 0.1 * duration;
    const sustainLevel = 0.7 * volume;
    const release = 0.2 * duration;
    let sustain = duration - attack - decay - release;
    if (sustain < 0) sustain = 0;
    
    // Create dual oscillators with a slight detune for richness
    const osc1 = audioContext.createOscillator();
    osc1.type = type;
    osc1.frequency.setValueAtTime(frequency, now);
    
    const osc2 = audioContext.createOscillator();
    osc2.type = type;
    osc2.frequency.setValueAtTime(frequency * 1.01, now);
    
    // Create an LFO for vibrato effect (pitch modulation)
    const lfo = audioContext.createOscillator();
    lfo.frequency.value = 5; // Vibrato rate in Hz
    const lfoGain = audioContext.createGain();
    lfoGain.gain.value = frequency * 0.005; // Modulation depth (0.5% of frequency)
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    lfoGain.connect(osc2.frequency);
    lfo.start(now);
    lfo.stop(now + duration);
    
    // Gain node with refined ADSR envelope
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + attack);
    gainNode.gain.linearRampToValueAtTime(sustainLevel, now + attack + decay);
    gainNode.gain.setValueAtTime(sustainLevel, now + attack + decay + sustain);
    gainNode.gain.linearRampToValueAtTime(0, now + attack + decay + sustain + release);
    
    // Distortion node to add harmonic richness
    const distortion = audioContext.createWaveShaper();
    distortion.curve = makeDistortionCurve(400);
    distortion.oversample = '4x';
    
    // Low-pass filter for smoothing high frequencies
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(frequency * 2, now);
    
    // Optional delay for a slight chorus/spatial effect
    const delay = audioContext.createDelay();
    delay.delayTime.value = 0.03; // 30ms delay
    const delayGain = audioContext.createGain();
    delayGain.gain.value = 0.3; // Mix level for the delay
    
    // Connect nodes: oscillators -> gain (with ADSR) -> distortion -> filter -> destination
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(distortion);
    distortion.connect(filter);
    
    // Blend the dry and delayed signals for added depth
    filter.connect(audioContext.destination);
    filter.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(audioContext.destination);
    
    // Start and stop oscillators
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  } catch (err) {
    console.log('Super advanced tone generation error:', err);
  }
}

// Helper function to create a distortion curve
function makeDistortionCurve(amount) {
  const k = typeof amount === 'number' ? amount : 50;
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < n_samples; ++i) {
    const x = i * 2 / n_samples - 1;
    curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

export default SoundManager;
