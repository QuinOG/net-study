import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SoundManager from './utils/SoundManager';

// Dictionary of 55 tech acronyms with variants (for CompTIA A+)
// For each acronym, we include a "correct" answer and several similar alternatives.
const acronymVariants = {
    BIOS: {
      correct: "Basic Input/Output System",
      variants: [
        "Basic Input/Output System",
        "Basic Internal/Output System",
        "Binary Input/Output System",
        "Basic Input/Output Service"
      ]
    },
    CPU: {
      correct: "Central Processing Unit",
      variants: [
        "Central Processing Unit",
        "Core Processing Unit",
        "Central Processor Unit",
        "Computer Processing Unit"
      ]
    },
    RAM: {
      correct: "Random Access Memory",
      variants: [
        "Random Access Memory",
        "Read Access Memory",
        "Rapid Access Memory",
        "Random Active Memory"
      ]
    },
    HDD: {
      correct: "Hard Disk Drive",
      variants: [
        "Hard Disk Drive",
        "Hard Disk Device",
        "Heavy Disk Drive",
        "High Density Drive"
      ]
    },
    SSD: {
      correct: "Solid State Drive",
      variants: [
        "Solid State Drive",
        "Solid Storage Drive",
        "Stable State Drive",
        "Solid-State Device"
      ]
    },
    VPN: {
      correct: "Virtual Private Network",
      variants: [
        "Virtual Private Network",
        "Virtual Public Network",
        "Verified Private Network",
        "Virtual Protected Network"
      ]
    },
    DHCP: {
      correct: "Dynamic Host Configuration Protocol",
      variants: [
        "Dynamic Host Configuration Protocol",
        "Dynamic Host Control Protocol",
        "Dynamic Hypertext Configuration Protocol",
        "Direct Host Configuration Protocol"
      ]
    },
    OS: {
      correct: "Operating System",
      variants: [
        "Operating System",
        "Operating Software",
        "Operator System",
        "Organized System"
      ]
    },
    GPU: {
      correct: "Graphics Processing Unit",
      variants: [
        "Graphics Processing Unit",
        "Graphic Processing Unit",
        "Graphical Processing Unit",
        "GPU Processing Unit"
      ]
    },
    RAID: {
      correct: "Redundant Array of Independent Disks",
      variants: [
        "Redundant Array of Independent Disks",
        "Redundant Array of Inexpensive Disks",
        "Robust Array of Independent Disks",
        "Reliable Array of Independent Disks"
      ]
    },
    PSU: {
      correct: "Power Supply Unit",
      variants: [
        "Power Supply Unit",
        "Primary Supply Unit",
        "Power Source Unit",
        "Primary Source Unit"
      ]
    },
    CMOS: {
      correct: "Complementary Metal-Oxide Semiconductor",
      variants: [
        "Complementary Metal-Oxide Semiconductor",
        "Complementary Metal Oxide Semiconductor",
        "Composite Metal-Oxide Semiconductor",
        "Complementary Mono-Oxide Semiconductor"
      ]
    },
    SATA: {
      correct: "Serial Advanced Technology Attachment",
      variants: [
        "Serial Advanced Technology Attachment",
        "Serial Access Technology Attachment",
        "Serial Advanced Transfer Attachment",
        "Serial Alternative Technology Attachment"
      ]
    },
    UPS: {
      correct: "Uninterruptible Power Supply",
      variants: [
        "Uninterruptible Power Supply",
        "Universal Power Supply",
        "Uninterrupted Power Source",
        "Uninterrupted Power Supply Unit"
      ]
    },
    NIC: {
      correct: "Network Interface Card",
      variants: [
        "Network Interface Card",
        "Network Interconnect Card",
        "Node Interface Card",
        "Network Internal Card"
      ]
    },
    TCP: {
      correct: "Transmission Control Protocol",
      variants: [
        "Transmission Control Protocol",
        "Transfer Control Protocol",
        "Transmission Coordination Protocol",
        "Transfer Coordination Protocol"
      ]
    },
    UDP: {
      correct: "User Datagram Protocol",
      variants: [
        "User Datagram Protocol",
        "Universal Datagram Protocol",
        "Unicast Datagram Protocol",
        "User Data Protocol"
      ]
    },
    OSI: {
      correct: "Open Systems Interconnection",
      variants: [
        "Open Systems Interconnection",
        "Open Software Interconnection",
        "Organized Systems Interconnection",
        "Operational Systems Interconnection"
      ]
    },
    DSL: {
      correct: "Digital Subscriber Line",
      variants: [
        "Digital Subscriber Line",
        "Data Subscriber Line",
        "Direct Subscriber Line",
        "Digital Signal Line"
      ]
    },
    VoIP: {
      correct: "Voice over Internet Protocol",
      variants: [
        "Voice over Internet Protocol",
        "Voice on Internet Protocol",
        "Virtual Voice over IP",
        "Voice over IP"
      ]
    },
    PCI: {
      correct: "Peripheral Component Interconnect",
      variants: [
        "Peripheral Component Interconnect",
        "Peripheral Computer Interconnect",
        "Primary Component Interconnect",
        "Peripheral Connection Interface"
      ]
    },
    USB: {
      correct: "Universal Serial Bus",
      variants: [
        "Universal Serial Bus",
        "Universal System Bus",
        "Universal Service Bus",
        "Unified Serial Bus"
      ]
    },
    HDMI: {
      correct: "High-Definition Multimedia Interface",
      variants: [
        "High-Definition Multimedia Interface",
        "High Definition Media Interface",
        "High-Definition Media Interface",
        "High-Density Multimedia Interface"
      ]
    },
    VGA: {
      correct: "Video Graphics Array",
      variants: [
        "Video Graphics Array",
        "Visual Graphics Array",
        "Video Graphic Assembly",
        "Visual Graphic Array"
      ]
    },
    LAN: {
      correct: "Local Area Network",
      variants: [
        "Local Area Network",
        "Local Access Network",
        "Local Area Node",
        "Local Area Net"
      ]
    },
    WAN: {
      correct: "Wide Area Network",
      variants: [
        "Wide Area Network",
        "Wide Access Network",
        "Wide Area Node",
        "Wide Area Net"
      ]
    },
    WLAN: {
      correct: "Wireless Local Area Network",
      variants: [
        "Wireless Local Area Network",
        "Wireless LAN",
        "Wireless Local Access Network",
        "Wireless Local Area Net"
      ]
    },
    MBR: {
      correct: "Master Boot Record",
      variants: [
        "Master Boot Record",
        "Main Boot Record",
        "Master Base Record",
        "Main Base Record"
      ]
    },
    UEFI: {
      correct: "Unified Extensible Firmware Interface",
      variants: [
        "Unified Extensible Firmware Interface",
        "Unified Extensible Function Interface",
        "Universal Extensible Firmware Interface",
        "Unified External Firmware Interface"
      ]
    },
    DPI: {
      correct: "Dots Per Inch",
      variants: [
        "Dots Per Inch",
        "Dashes Per Inch",
        "Dots Per Image",
        "Dots Per Input"
      ]
    },
    LCD: {
      correct: "Liquid Crystal Display",
      variants: [
        "Liquid Crystal Display",
        "Liquid Color Display",
        "Liquid Crystal Detector",
        "Light Crystal Display"
      ]
    },
    LED: {
      correct: "Light Emitting Diode",
      variants: [
        "Light Emitting Diode",
        "Light Energy Diode",
        "Luminescent Emitting Diode",
        "Light Emission Diode"
      ]
    },
    AC: {
      correct: "Alternating Current",
      variants: [
        "Alternating Current",
        "Alternate Current",
        "Alternating Circuit",
        "Alternate Circuit"
      ]
    },
    DC: {
      correct: "Direct Current",
      variants: [
        "Direct Current",
        "Direct Circuit",
        "Distributed Current",
        "Directed Current"
      ]
    },
    API: {
      correct: "Application Programming Interface",
      variants: [
        "Application Programming Interface",
        "Applied Programming Interface",
        "Application Process Interface",
        "Applied Process Interface"
      ]
    },
    GUI: {
      correct: "Graphical User Interface",
      variants: [
        "Graphical User Interface",
        "Graphical Unit Interface",
        "Graphical User Interphase",
        "Graphical User Interfacing"
      ]
    },
    URL: {
      correct: "Uniform Resource Locator",
      variants: [
        "Uniform Resource Locator",
        "Universal Resource Locator",
        "Unified Resource Locator",
        "Uniform Reference Locator"
      ]
    },
    HTTP: {
      correct: "HyperText Transfer Protocol",
      variants: [
        "HyperText Transfer Protocol",
        "Hypertext Transmission Protocol",
        "Hypertext Transfer Procedure",
        "Hyper Transfer Protocol"
      ]
    },
    IoT: {
      correct: "Internet of Things",
      variants: [
        "Internet of Things",
        "Internet on Things",
        "Interconnected of Things",
        "Interlinked Objects of Technology"
      ]
    },
    IDE: {
      correct: "Integrated Development Environment",
      variants: [
        "Integrated Development Environment",
        "Integrated Debugging Environment",
        "Integrated Design Environment",
        "Interactive Development Environment"
      ]
    },
    "I/O": {
      correct: "Input/Output",
      variants: [
        "Input/Output",
        "In/Out",
        "I/O Operations",
        "Input and Output"
      ]
    },
    TTL: {
      correct: "Time To Live",
      variants: [
        "Time To Live",
        "Time To Linger",
        "Time To Load",
        "Time To Leave"
      ]
    },
    NAT: {
      correct: "Network Address Translation",
      variants: [
        "Network Address Translation",
        "Network Assignment Translation",
        "Network Address Transformation",
        "Network Address Transfer"
      ]
    },
    ARP: {
      correct: "Address Resolution Protocol",
      variants: [
        "Address Resolution Protocol",
        "Address Recognition Protocol",
        "Address Request Protocol",
        "Address Retrieval Protocol"
      ]
    },
    ICMP: {
      correct: "Internet Control Message Protocol",
      variants: [
        "Internet Control Message Protocol",
        "Internet Communication Message Protocol",
        "Inter-network Control Message Protocol",
        "Internet Control Messaging Protocol"
      ]
    },
    SQL: {
      correct: "Structured Query Language",
      variants: [
        "Structured Query Language",
        "Standard Query Language",
        "Structured Question Language",
        "Sequential Query Language"
      ]
    },
    XML: {
      correct: "eXtensible Markup Language",
      variants: [
        "eXtensible Markup Language",
        "Extensible Markup Language",
        "eXecutable Markup Language",
        "Extended Markup Language"
      ]
    },
    JSON: {
      correct: "JavaScript Object Notation",
      variants: [
        "JavaScript Object Notation",
        "JavaScript Object Naming",
        "JavaScript Object Network",
        "JavaScript Object Node"
      ]
    },
    CDN: {
      correct: "Content Delivery Network",
      variants: [
        "Content Delivery Network",
        "Content Distribution Network",
        "Content Diffusion Network",
        "Central Delivery Network"
      ]
    },
    SaaS: {
      correct: "Software as a Service",
      variants: [
        "Software as a Service",
        "Software and a Service",
        "System as a Service",
        "Software as a Solution"
      ]
    },
    PaaS: {
      correct: "Platform as a Service",
      variants: [
        "Platform as a Service",
        "Platform and a Service",
        "Product as a Service",
        "Platform as a Solution"
      ]
    },
    IaaS: {
      correct: "Infrastructure as a Service",
      variants: [
        "Infrastructure as a Service",
        "Infrastructure and a Service",
        "Internet as a Service",
        "Infrastructure as a Solution"
      ]
    },
    BYOD: {
      correct: "Bring Your Own Device",
      variants: [
        "Bring Your Own Device",
        "Bring Your Own Data",
        "Bring Your Own Desk",
        "Bring Your Own Digital"
      ]
    },
    MFA: {
      correct: "Multi-Factor Authentication",
      variants: [
        "Multi-Factor Authentication",
        "Multi-Face Authentication",
        "Multi-Function Authentication",
        "Multiple Factor Authentication"
      ]
    },
    RMM: {
      correct: "Remote Monitoring and Management",
      variants: [
        "Remote Monitoring and Management",
        "Remote Management and Monitoring",
        "Remote Maintenance and Management",
        "Remote Monitoring and Maintenance"
      ]
    }
  };
  
function TechAcronymQuiz() {
  const navigate = useNavigate();
  const [currentAcronym, setCurrentAcronym] = useState("");
  const [options, setOptions] = useState([]);
  const [result, setResult] = useState("");
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(15);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('acronymQuizHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const timerRef = useRef(null);

  const generateQuestion = () => {
    // Get all acronyms
    const acronyms = Object.keys(acronymVariants);
    
    // Make sure we have acronyms to choose from
    if (acronyms.length === 0) {
      console.error("No acronyms available!");
      return;
    }
    
    // Select a random acronym
    const randomIndex = Math.floor(Math.random() * acronyms.length);
    const selectedAcronym = acronyms[randomIndex];
    
    // Set the current acronym
    setCurrentAcronym(selectedAcronym);
    
    // Get the correct answer and variants for this acronym
    const { correct, variants } = acronymVariants[selectedAcronym];
    
    // Shuffle the variants and take 3 incorrect ones
    const shuffledVariants = [...variants].sort(() => Math.random() - 0.5);
    const incorrectOptions = shuffledVariants.filter(v => v !== correct).slice(0, 3);
    
    // Combine correct answer with 3 incorrect options and shuffle
    const allOptions = [correct, ...incorrectOptions].sort(() => Math.random() - 0.5);
    
    // Set the options
    setOptions(allOptions);
    
    // Reset result
    setResult("");
    
    // Reset timer
    setTimer(15);
    
    // Play sound
    SoundManager.play('click');
  };

  const handleTimeOut = () => {
    // Check if currentAcronym is valid before accessing properties
    if (currentAcronym && acronymVariants[currentAcronym]) {
      setResult(`Time's up! The correct answer is: ${acronymVariants[currentAcronym].correct}`);
    } else {
      setResult(`Time's up!`);
    }
    setGameOver(true);
    SoundManager.play('gameOver');
  };

  const handleAnswerClick = (selectedAnswer) => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Check if currentAcronym is valid
    if (!currentAcronym || !acronymVariants[currentAcronym]) {
      setResult("Error: Invalid question. Starting a new one.");
      generateQuestion();
      startTimer();
      return;
    }
    
    // Check if the selected answer is correct
    const isCorrect = selectedAnswer === acronymVariants[currentAcronym].correct;
    
    if (isCorrect) {
      setResult("Correct!");
      setScore(prev => prev + 1);
      
      // Check if new high score
      if (score + 1 > highScore) {
        setHighScore(score + 1);
        localStorage.setItem('acronymQuizHighScore', (score + 1).toString());
        SoundManager.play('achievement');
      } else {
        SoundManager.play('correct');
      }
      
      // Generate a new question
      generateQuestion();
      
      // Start the timer again
      startTimer();
    } else {
      setResult(`Incorrect! The correct answer is: ${acronymVariants[currentAcronym].correct}`);
      setGameOver(true);
      SoundManager.play('incorrect');
    }
  };

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimer(prevTimer => {
        if (prevTimer <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        // Sound warning when time is low
        if (prevTimer === 5) {
          SoundManager.play('countdown');
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const startGame = () => {
    setScore(0);
    setGameOver(false);
    generateQuestion();
    startTimer();
    SoundManager.play('click');
  };

  // Set game context for proper volume adjustment
  useEffect(() => {
    // Set game context for volume balancing
    SoundManager.setGameContext('TechAcronymQuiz');
    
    // Initialize the game
    startGame();
    
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

  return (
    <main className="content">
      <div className="game-interface">
        <h3 className="section-title">Tech Acronym Quiz</h3>
        <p>
          What does the acronym <strong>{currentAcronym}</strong> stand for?
        </p>
        <p className="timer">Time Left: {timer} seconds</p>
        <div className="options-container">
          {options.map((option, index) => (
            <button 
              key={index} 
              className="collapse-btn" 
              onClick={() => handleAnswerClick(option)}
            >
              {option}
            </button>
          ))}
        </div>
        {result && <p className="result">{result}</p>}
        <div className="button-row">
          <button className="collapse-btn" onClick={() => navigate(-1)}>
            Game Menu
          </button>
        </div>
        <div className="streak-card">
          Score: {score}
        </div>
        <div className="streak-card">
          High Score: {highScore}
        </div>
      </div>
    </main>
  );
}

export default TechAcronymQuiz;
