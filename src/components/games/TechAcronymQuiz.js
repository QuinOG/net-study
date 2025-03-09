import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import SoundManager from '../../utils/SoundManager';
import scrollToTop from '../../utils/ScrollHelper';
import '../../styles/games/TechAcronymQuiz.css';
import '../../styles/games/GameModeCards.css';

// Organize acronyms by category
const ACRONYM_CATEGORIES = {
  NETWORKING: 'Networking',
  HARDWARE: 'Hardware',
  SOFTWARE: 'Software',
  SECURITY: 'Security'
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
    timeLimit: 20,
    timePenalty: 3,
    multiplier: 1,
    showHints: true
  },
  MEDIUM: {
    name: 'Medium',
    timeLimit: 15,
    timePenalty: 5,
    multiplier: 1.5,
    showHints: false
  },
  HARD: {
    name: 'Hard',
    timeLimit: 10,
    timePenalty: 7,
    multiplier: 2,
    showHints: false
  }
};

// Dictionary of tech acronyms with variants and categories
const ACRONYM_DATA = {
  // Networking category (30 items)
  DHCP: {
    correct: "Dynamic Host Configuration Protocol",
    variants: [
      "Dynamic Host Configuration Protocol",
      "Dynamic Host Control Protocol",
      "Distributed Host Configuration Protocol",
      "Direct Host Configuration Protocol"
    ],
    category: ACRONYM_CATEGORIES.NETWORKING
  },
  DNS: {
    correct: "Domain Name System",
    variants: [
      "Domain Name System",
      "Domain Name Service",
      "Domain Naming System",
      "Directory Name Service"
    ],
    category: ACRONYM_CATEGORIES.NETWORKING
  },
  HTTP: {
    correct: "Hypertext Transfer Protocol",
    variants: [
      "Hypertext Transfer Protocol",
      "Hypertext Transmission Protocol",
      "Hypertext Transport Protocol",
      "Hypertext Transfer Process"
    ],
    category: ACRONYM_CATEGORIES.NETWORKING
  },
  IP: {
    correct: "Internet Protocol",
    variants: [
      "Internet Protocol",
      "Internet Process",
      "Information Protocol",
      "Interface Protocol"
    ],
    category: ACRONYM_CATEGORIES.NETWORKING
  },
  VPN: {
    correct: "Virtual Private Network",
    variants: [
      "Virtual Private Network",
      "Virtual Protected Network",
      "Virtual Public Network",
      "Virtual Public Network"
    ],
    category: ACRONYM_CATEGORIES.NETWORKING
  },
  FTP: {
    correct: "File Transfer Protocol",
    variants: [
      "File Transfer Protocol",
      "File Transmit Protocol",
      "Fast Transfer Protocol",
      "File Transport Protocol"
    ],
    category: ACRONYM_CATEGORIES.NETWORKING
  },
  SMTP: {
    correct: "Simple Mail Transfer Protocol",
    variants: [
      "Simple Mail Transfer Protocol",
      "Simple Message Transfer Protocol",
      "Standard Mail Transfer Protocol",
      "Simple Mail Transit Protocol"
    ],
    category: ACRONYM_CATEGORIES.NETWORKING
  },
  POP3: {
    correct: "Post Office Protocol version 3",
    variants: [
      "Post Office Protocol version 3",
      "Post Office Protocol 3",
      "Postal Office Protocol 3",
      "Post Protocol 3"
    ],
    category: ACRONYM_CATEGORIES.NETWORKING
  },
  IMAP: {
    correct: "Internet Message Access Protocol",
    variants: [
      "Internet Message Access Protocol",
      "Internet Mail Access Protocol",
      "Interactive Message Access Protocol",
      "Internet Management Access Protocol"
    ],
    category: ACRONYM_CATEGORIES.NETWORKING
  },
  TCP: {
    correct: "Transmission Control Protocol",
    variants: [
      "Transmission Control Protocol",
      "Transfer Control Protocol",
      "Transmission Communication Protocol",
      "Telecommunication Control Protocol"
    ],
    category: ACRONYM_CATEGORIES.NETWORKING
  },
  UDP: {
    correct: "User Datagram Protocol",
    variants: [
      "User Datagram Protocol",
      "Universal Datagram Protocol",
      "Unicast Datagram Protocol",
      "User Data Protocol"
    ],
    category: ACRONYM_CATEGORIES.NETWORKING
  },
  NAT: {
    correct: "Network Address Translation",
    variants: [
      "Network Address Translation",
      "Network Address Transform",
      "Network Address Transition",
      "Network Address Transfer"
    ],
    category: ACRONYM_CATEGORIES.NETWORKING
  },
  ICMP: {
    correct: "Internet Control Message Protocol",
    variants: [
      "Internet Control Message Protocol",
      "Internet Communication Message Protocol",
      "Internet Control Messaging Protocol",
      "Internet Connection Message Protocol"
    ],
    category: ACRONYM_CATEGORIES.NETWORKING
  },
  ARP: {
    correct: "Address Resolution Protocol",
    variants: [
      "Address Resolution Protocol",
      "Address Recognition Protocol",
      "Address Routing Protocol",
      "Address Reconciliation Protocol"
    ],
    category: ACRONYM_CATEGORIES.NETWORKING
  },
  RARP: {
    correct: "Reverse Address Resolution Protocol",
    variants: [
      "Reverse Address Resolution Protocol",
      "Reverse Address Recognition Protocol",
      "Reverse Address Routing Protocol",
      "Reversed Address Resolution Protocol"
    ],
    category: ACRONYM_CATEGORIES.NETWORKING
  },
  VLAN: {
    correct: "Virtual Local Area Network",
    variants: [
      "Virtual Local Area Network",
      "Virtual LAN",
      "Virtual Limited Area Network",
      "Virtual Logical Area Network"
    ],
    category: ACRONYM_CATEGORIES.NETWORKING
  },
  WAN: {
    correct: "Wide Area Network",
    variants: [
      "Wide Area Network",
      "Wide Access Network",
      "Wireless Area Network",
      "Wired Area Network"
    ],
    category: ACRONYM_CATEGORIES.NETWORKING
  },
  LAN: {
    correct: "Local Area Network",
    variants: [
      "Local Area Network",
      "Local Access Network",
      "Loopback Area Network",
      "Localized Area Network"
    ],
    category: ACRONYM_CATEGORIES.NETWORKING
  },
  MAN: {
    correct: "Metropolitan Area Network",
    variants: [
      "Metropolitan Area Network",
      "Metro Area Network",
      "Metropolitan Access Network",
      "Metropolitan Automated Network"
    ],
    category: ACRONYM_CATEGORIES.NETWORKING
  },
  VoIP: {
    correct: "Voice over Internet Protocol",
    variants: [
      "Voice over Internet Protocol",
      "Voice over IP",
      "VoIP",
      "Voice Internet Protocol"
    ],
    category: ACRONYM_CATEGORIES.NETWORKING
  },
  SIP: {
    correct: "Session Initiation Protocol",
    variants: [
      "Session Initiation Protocol",
      "Session Interactive Protocol",
      "Signal Initiation Protocol",
      "Session Interface Protocol"
    ],
    category: ACRONYM_CATEGORIES.NETWORKING
  },
  RTP: {
    correct: "Real-time Transport Protocol",
    variants: [
      "Real-time Transport Protocol",
      "Real Time Transmission Protocol",
      "Real-time Transfer Protocol",
      "Real-time Transport Process"
    ],
    category: ACRONYM_CATEGORIES.NETWORKING
  },
  QoS: {
    correct: "Quality of Service",
    variants: [
      "Quality of Service",
      "Quality Service",
      "QoS",
      "Quality of Signal"
    ],
    category: ACRONYM_CATEGORIES.NETWORKING
  },
  BGP: {
    correct: "Border Gateway Protocol",
    variants: [
      "Border Gateway Protocol",
      "Border Group Protocol",
      "Big Gateway Protocol",
      "Bordering Gateway Protocol"
    ],
    category: ACRONYM_CATEGORIES.NETWORKING
  },
  OSPF: {
    correct: "Open Shortest Path First",
    variants: [
      "Open Shortest Path First",
      "Open Source Path First",
      "Optimized Shortest Path First",
      "Open Short Path First"
    ],
    category: ACRONYM_CATEGORIES.NETWORKING
  },
  RIP: {
    correct: "Routing Information Protocol",
    variants: [
      "Routing Information Protocol",
      "Routing Info Protocol",
      "Route Information Protocol",
      "Routing Interactive Protocol"
    ],
    category: ACRONYM_CATEGORIES.NETWORKING
  },
  L2TP: {
    correct: "Layer 2 Tunneling Protocol",
    variants: [
      "Layer 2 Tunneling Protocol",
      "Level 2 Tunneling Protocol",
      "Layer Two Tunneling Protocol",
      "Link 2 Tunneling Protocol"
    ],
    category: ACRONYM_CATEGORIES.NETWORKING
  },
  PPTP: {
    correct: "Point-to-Point Tunneling Protocol",
    variants: [
      "Point-to-Point Tunneling Protocol",
      "Peer-to-Peer Tunneling Protocol",
      "Point to Point Tunneling Protocol",
      "Point-to-Point Transfer Protocol"
    ],
    category: ACRONYM_CATEGORIES.NETWORKING
  },
  SNMP: {
    correct: "Simple Network Management Protocol",
    variants: [
      "Simple Network Management Protocol",
      "Simple Network Monitor Protocol",
      "Standard Network Management Protocol",
      "Simple Node Management Protocol"
    ],
    category: ACRONYM_CATEGORIES.NETWORKING
  },
  NTP: {
    correct: "Network Time Protocol",
    variants: [
      "Network Time Protocol",
      "Network Timing Protocol",
      "Network Time Process",
      "Network Time Procedure"
    ],
    category: ACRONYM_CATEGORIES.NETWORKING
  },

  // Hardware category (25 items)
  CPU: {
    correct: "Central Processing Unit",
    variants: [
      "Central Processing Unit",
      "Core Processing Unit",
      "Computer Processing Unit",
      "Central Processor Unit"
    ],
    category: ACRONYM_CATEGORIES.HARDWARE
  },
  GPU: {
    correct: "Graphics Processing Unit",
    variants: [
      "Graphics Processing Unit",
      "Graphical Processing Unit",
      "Graphics Processor Unit",
      "Graphics Performance Unit"
    ],
    category: ACRONYM_CATEGORIES.HARDWARE
  },
  RAM: {
    correct: "Random Access Memory",
    variants: [
      "Random Access Memory",
      "Rapid Access Memory",
      "Read Access Memory",
      "Random Allocated Memory"
    ],
    category: ACRONYM_CATEGORIES.HARDWARE
  },
  HDD: {
    correct: "Hard Disk Drive",
    variants: [
      "Hard Disk Drive",
      "Hard Drive Disk",
      "Hard Data Drive",
      "Heavy Disk Drive"
    ],
    category: ACRONYM_CATEGORIES.HARDWARE
  },
  SSD: {
    correct: "Solid State Drive",
    variants: [
      "Solid State Drive",
      "Solid Storage Drive",
      "Static Storage Device",
      "Solid State Disk"
    ],
    category: ACRONYM_CATEGORIES.HARDWARE
  },
  PSU: {
    correct: "Power Supply Unit",
    variants: [
      "Power Supply Unit",
      "Power Source Unit",
      "Primary Supply Unit",
      "Power System Unit"
    ],
    category: ACRONYM_CATEGORIES.HARDWARE
  },
  NIC: {
    correct: "Network Interface Card",
    variants: [
      "Network Interface Card",
      "Network Interface Controller",
      "Network Interconnect Card",
      "Network Interface Component"
    ],
    category: ACRONYM_CATEGORIES.HARDWARE
  },
  MOBO: {
    correct: "Motherboard",
    variants: [
      "Motherboard",
      "Main Board",
      "Mobo",
      "System Board"
    ],
    category: ACRONYM_CATEGORIES.HARDWARE
  },
  DIMM: {
    correct: "Dual In-line Memory Module",
    variants: [
      "Dual In-line Memory Module",
      "Dual Inline Memory Module",
      "Dual In Line Memory Module",
      "Double In-line Memory Module"
    ],
    category: ACRONYM_CATEGORIES.HARDWARE
  },
  SATA: {
    correct: "Serial ATA",
    variants: [
      "Serial ATA",
      "Serial Advanced Technology Attachment",
      "Serial AT Attachment",
      "Serial Advanced Transfer Attachment"
    ],
    category: ACRONYM_CATEGORIES.HARDWARE
  },
  USB: {
    correct: "Universal Serial Bus",
    variants: [
      "Universal Serial Bus",
      "Universal System Bus",
      "Unified Serial Bus",
      "Universal Serial Bridge"
    ],
    category: ACRONYM_CATEGORIES.HARDWARE
  },
  PCI: {
    correct: "Peripheral Component Interconnect",
    variants: [
      "Peripheral Component Interconnect",
      "Peripheral Computer Interconnect",
      "Peripheral Component Interface",
      "Peripheral Connection Interconnect"
    ],
    category: ACRONYM_CATEGORIES.HARDWARE
  },
  PCIe: {
    correct: "PCI Express",
    variants: [
      "PCI Express",
      "Peripheral Component Interconnect Express",
      "PCI-Express",
      "PCI Express Bus"
    ],
    category: ACRONYM_CATEGORIES.HARDWARE
  },
  VRAM: {
    correct: "Video Random Access Memory",
    variants: [
      "Video Random Access Memory",
      "Visual Random Access Memory",
      "Video RAM",
      "Visual RAM"
    ],
    category: ACRONYM_CATEGORIES.HARDWARE
  },
  FDD: {
    correct: "Floppy Disk Drive",
    variants: [
      "Floppy Disk Drive",
      "Floppy Drive",
      "Diskette Drive",
      "Floppy Disk Device"
    ],
    category: ACRONYM_CATEGORIES.HARDWARE
  },
  CMOS: {
    correct: "Complementary Metal-Oxide-Semiconductor",
    variants: [
      "Complementary Metal-Oxide-Semiconductor",
      "Complementary Metal Oxide Semiconductor",
      "CMOS",
      "C-MOS"
    ],
    category: ACRONYM_CATEGORIES.HARDWARE
  },
  SLI: {
    correct: "Scalable Link Interface",
    variants: [
      "Scalable Link Interface",
      "Scalable Line Interface",
      "Shared Link Interface",
      "System Link Interface"
    ],
    category: ACRONYM_CATEGORIES.HARDWARE
  },
  RAID: {
    correct: "Redundant Array of Independent Disks",
    variants: [
      "Redundant Array of Independent Disks",
      "Redundant Array of Inexpensive Disks",
      "Redundant Array of Independent Drives",
      "Redundant Array of Internal Disks"
    ],
    category: ACRONYM_CATEGORIES.HARDWARE
  },
  TPM: {
    correct: "Trusted Platform Module",
    variants: [
      "Trusted Platform Module",
      "Trusted Processing Module",
      "Trusted Platform Manager",
      "Trusted Processor Module"
    ],
    category: ACRONYM_CATEGORIES.HARDWARE
  },
  DSP: {
    correct: "Digital Signal Processor",
    variants: [
      "Digital Signal Processor",
      "Digital Signal Processing Unit",
      "Digital Sound Processor",
      "Digital Signal Pro"
    ],
    category: ACRONYM_CATEGORIES.HARDWARE
  },
  LED: {
    correct: "Light Emitting Diode",
    variants: [
      "Light Emitting Diode",
      "Light Emission Diode",
      "LED",
      "Luminescent Emitting Diode"
    ],
    category: ACRONYM_CATEGORIES.HARDWARE
  },
  BGA: {
    correct: "Ball Grid Array",
    variants: [
      "Ball Grid Array",
      "Ball Gate Array",
      "Ball Grid Architecture",
      "Ball Grid Assembly"
    ],
    category: ACRONYM_CATEGORIES.HARDWARE
  },
  VRM: {
    correct: "Voltage Regulator Module",
    variants: [
      "Voltage Regulator Module",
      "Voltage Regulation Module",
      "Variable Regulator Module",
      "Voltage Regulating Module"
    ],
    category: ACRONYM_CATEGORIES.HARDWARE
  },
  IO: {
    correct: "Input/Output",
    variants: [
      "Input/Output",
      "I/O",
      "In/Out",
      "Input Output"
    ],
    category: ACRONYM_CATEGORIES.HARDWARE
  },
  HID: {
    correct: "Human Interface Device",
    variants: [
      "Human Interface Device",
      "Human Input Device",
      "Human Interconnection Device",
      "Human Interface Design"
    ],
    category: ACRONYM_CATEGORIES.HARDWARE
  },

  // Software category (25 items)
  OS: {
    correct: "Operating System",
    variants: [
      "Operating System",
      "Operation System",
      "Output System",
      "Operating Software"
    ],
    category: ACRONYM_CATEGORIES.SOFTWARE
  },
  IDE: {
    correct: "Integrated Development Environment",
    variants: [
      "Integrated Development Environment",
      "Interactive Development Environment",
      "Integrated Design Environment",
      "Interface Development Environment"
    ],
    category: ACRONYM_CATEGORIES.SOFTWARE
  },
  API: {
    correct: "Application Programming Interface",
    variants: [
      "Application Programming Interface",
      "Application Program Interface",
      "Application Protocol Interface",
      "Advanced Programming Interface"
    ],
    category: ACRONYM_CATEGORIES.SOFTWARE
  },
  BIOS: {
    correct: "Basic Input/Output System",
    variants: [
      "Basic Input/Output System",
      "Basic Input/Output Service",
      "Basic Integrated Operating System",
      "Binary Input/Output System"
    ],
    category: ACRONYM_CATEGORIES.SOFTWARE
  },
  GUI: {
    correct: "Graphical User Interface",
    variants: [
      "Graphical User Interface",
      "Graphic User Interface",
      "General User Interface",
      "Graphical Unified Interface"
    ],
    category: ACRONYM_CATEGORIES.SOFTWARE
  },
  CLI: {
    correct: "Command Line Interface",
    variants: [
      "Command Line Interface",
      "Command-Line Interface",
      "CLI",
      "Console Line Interface"
    ],
    category: ACRONYM_CATEGORIES.SOFTWARE
  },
  SDK: {
    correct: "Software Development Kit",
    variants: [
      "Software Development Kit",
      "Software Design Kit",
      "System Development Kit",
      "Software Deployment Kit"
    ],
    category: ACRONYM_CATEGORIES.SOFTWARE
  },
  DBMS: {
    correct: "Database Management System",
    variants: [
      "Database Management System",
      "Database Management Service",
      "DataBase Management System",
      "Database Monitor System"
    ],
    category: ACRONYM_CATEGORIES.SOFTWARE
  },
  ERP: {
    correct: "Enterprise Resource Planning",
    variants: [
      "Enterprise Resource Planning",
      "Enterprise Resource Program",
      "Enterprise Resource Process",
      "Enterprise Research Planning"
    ],
    category: ACRONYM_CATEGORIES.SOFTWARE
  },
  CRM: {
    correct: "Customer Relationship Management",
    variants: [
      "Customer Relationship Management",
      "Customer Relations Management",
      "Client Relationship Management",
      "Customer Relationship Module"
    ],
    category: ACRONYM_CATEGORIES.SOFTWARE
  },
  SaaS: {
    correct: "Software as a Service",
    variants: [
      "Software as a Service",
      "Software as Service",
      "Software a Service",
      "SaaS"
    ],
    category: ACRONYM_CATEGORIES.SOFTWARE
  },
  PaaS: {
    correct: "Platform as a Service",
    variants: [
      "Platform as a Service",
      "Platform as Service",
      "Platform a Service",
      "PaaS"
    ],
    category: ACRONYM_CATEGORIES.SOFTWARE
  },
  IaaS: {
    correct: "Infrastructure as a Service",
    variants: [
      "Infrastructure as a Service",
      "Infrastructure as Service",
      "Infrastructure a Service",
      "IaaS"
    ],
    category: ACRONYM_CATEGORIES.SOFTWARE
  },
  MVC: {
    correct: "Model View Controller",
    variants: [
      "Model View Controller",
      "Model-View-Controller",
      "MVC",
      "Model View Component"
    ],
    category: ACRONYM_CATEGORIES.SOFTWARE
  },
  ORM: {
    correct: "Object-Relational Mapping",
    variants: [
      "Object-Relational Mapping",
      "Object Relation Mapping",
      "Object-Relation Mapping",
      "Object-Relate Mapping"
    ],
    category: ACRONYM_CATEGORIES.SOFTWARE
  },
  JSON: {
    correct: "JavaScript Object Notation",
    variants: [
      "JavaScript Object Notation",
      "JS Object Notation",
      "JSON",
      "JavaScript Obejct Notation"
    ],
    category: ACRONYM_CATEGORIES.SOFTWARE
  },
  XML: {
    correct: "Extensible Markup Language",
    variants: [
      "Extensible Markup Language",
      "Extensible Modeling Language",
      "eXtensible Markup Language",
      "Extensible Markup Lingo"
    ],
    category: ACRONYM_CATEGORIES.SOFTWARE
  },
  HTML: {
    correct: "Hypertext Markup Language",
    variants: [
      "Hypertext Markup Language",
      "Hyper Text Markup Language",
      "HTML",
      "Hypertext Makeup Language"
    ],
    category: ACRONYM_CATEGORIES.SOFTWARE
  },
  CSS: {
    correct: "Cascading Style Sheets",
    variants: [
      "Cascading Style Sheets",
      "Cascading Style Sheet",
      "CSS",
      "Cascading Stylesheet"
    ],
    category: ACRONYM_CATEGORIES.SOFTWARE
  },
  SQL: {
    correct: "Structured Query Language",
    variants: [
      "Structured Query Language",
      "Structured Question Language",
      "SQL",
      "Standard Query Language"
    ],
    category: ACRONYM_CATEGORIES.SOFTWARE
  },
  JWT: {
    correct: "JSON Web Token",
    variants: [
      "JSON Web Token",
      "JWT",
      "JS Web Token",
      "JavaScript Web Token"
    ],
    category: ACRONYM_CATEGORIES.SOFTWARE
  },
  REST: {
    correct: "Representational State Transfer",
    variants: [
      "Representational State Transfer",
      "REST",
      "Representational Standard Transfer",
      "Representational Service Transfer"
    ],
    category: ACRONYM_CATEGORIES.SOFTWARE
  },
  SOAP: {
    correct: "Simple Object Access Protocol",
    variants: [
      "Simple Object Access Protocol",
      "SOAP",
      "Simple Object Application Protocol",
      "Simple Oriented Access Protocol"
    ],
    category: ACRONYM_CATEGORIES.SOFTWARE
  },
  OOP: {
    correct: "Object-Oriented Programming",
    variants: [
      "Object-Oriented Programming",
      "Object Oriented Programming",
      "OOP",
      "Object-Oriented Process"
    ],
    category: ACRONYM_CATEGORIES.SOFTWARE
  },
  TDD: {
    correct: "Test Driven Development",
    variants: [
      "Test Driven Development",
      "Test-Driven Development",
      "TDD",
      "Test Development Driven"
    ],
    category: ACRONYM_CATEGORIES.SOFTWARE
  },

  // Security category (20 items)
  SSL: {
    correct: "Secure Sockets Layer",
    variants: [
      "Secure Sockets Layer",
      "Secure Socket Layer",
      "Security Socket Layer",
      "System Socket Layer"
    ],
    category: ACRONYM_CATEGORIES.SECURITY
  },
  WPA: {
    correct: "Wi-Fi Protected Access",
    variants: [
      "Wi-Fi Protected Access",
      "Wireless Protected Access",
      "WiFi Protected Access",
      "Wi-Fi Privacy Access"
    ],
    category: ACRONYM_CATEGORIES.SECURITY
  },
  "2FA": {
    correct: "Two-Factor Authentication",
    variants: [
      "Two-Factor Authentication",
      "Two-Form Authentication",
      "Two-Factor Authorization",
      "Two-Feature Authentication"
    ],
    category: ACRONYM_CATEGORIES.SECURITY
  },
  DDoS: {
    correct: "Distributed Denial of Service",
    variants: [
      "Distributed Denial of Service",
      "Dynamic Denial of Service",
      "Distributed Denial of System",
      "Direct Denial of Service"
    ],
    category: ACRONYM_CATEGORIES.SECURITY
  },
  IDS: {
    correct: "Intrusion Detection System",
    variants: [
      "Intrusion Detection System",
      "Intrusion Defense System",
      "Identity Detection System",
      "Incident Detection Service"
    ],
    category: ACRONYM_CATEGORIES.SECURITY
  },
  IPS: {
    correct: "Intrusion Prevention System",
    variants: [
      "Intrusion Prevention System",
      "Intrusion Protect System",
      "Intrusion Prevention Service",
      "Intrusion Protection System"
    ],
    category: ACRONYM_CATEGORIES.SECURITY
  },
  MFA: {
    correct: "Multi-Factor Authentication",
    variants: [
      "Multi-Factor Authentication",
      "Multi-Form Authentication",
      "Multiple Factor Authentication",
      "Multi-Factor Authorisation"
    ],
    category: ACRONYM_CATEGORIES.SECURITY
  },
  PKI: {
    correct: "Public Key Infrastructure",
    variants: [
      "Public Key Infrastructure",
      "Public Key Interchange",
      "Public Key Interface",
      "Public Key Integration"
    ],
    category: ACRONYM_CATEGORIES.SECURITY
  },
  TLS: {
    correct: "Transport Layer Security",
    variants: [
      "Transport Layer Security",
      "Transport Level Security",
      "Transmission Layer Security",
      "Transport Lock Security"
    ],
    category: ACRONYM_CATEGORIES.SECURITY
  },
  SSO: {
    correct: "Single Sign-On",
    variants: [
      "Single Sign-On",
      "Single Sign On",
      "Single Signon",
      "Single Sign On"
    ],
    category: ACRONYM_CATEGORIES.SECURITY
  },
  HIDS: {
    correct: "Host-based Intrusion Detection System",
    variants: [
      "Host-based Intrusion Detection System",
      "Host Intrusion Detection System",
      "HIDS",
      "Host-based IDS"
    ],
    category: ACRONYM_CATEGORIES.SECURITY
  },
  NIDS: {
    correct: "Network-based Intrusion Detection System",
    variants: [
      "Network-based Intrusion Detection System",
      "Network Intrusion Detection System",
      "NIDS",
      "Network IDS"
    ],
    category: ACRONYM_CATEGORIES.SECURITY
  },
  SIEM: {
    correct: "Security Information and Event Management",
    variants: [
      "Security Information and Event Management",
      "Security Information Event Management",
      "SIEM",
      "Security IE Management"
    ],
    category: ACRONYM_CATEGORIES.SECURITY
  },
  UTM: {
    correct: "Unified Threat Management",
    variants: [
      "Unified Threat Management",
      "Universal Threat Management",
      "Unified Threat Monitor",
      "Universal Threat Monitor"
    ],
    category: ACRONYM_CATEGORIES.SECURITY
  },
  FIM: {
    correct: "File Integrity Monitoring",
    variants: [
      "File Integrity Monitoring",
      "File Integrity Management",
      "File Information Monitoring",
      "File Integrity Measure"
    ],
    category: ACRONYM_CATEGORIES.SECURITY
  },
  NAC: {
    correct: "Network Access Control",
    variants: [
      "Network Access Control",
      "Network Access Configuration",
      "Network Administration Control",
      "Network Access Command"
    ],
    category: ACRONYM_CATEGORIES.SECURITY
  },
  RBAC: {
    correct: "Role-Based Access Control",
    variants: [
      "Role-Based Access Control",
      "Role Based Access Control",
      "RBAC",
      "Role-Based Account Control"
    ],
    category: ACRONYM_CATEGORIES.SECURITY
  },
  AAA: {
    correct: "Authentication, Authorization, and Accounting",
    variants: [
      "Authentication, Authorization, and Accounting",
      "Authentication, Authorisation, and Accounting",
      "AAA",
      "Auth, Auth, and Accounting"
    ],
    category: ACRONYM_CATEGORIES.SECURITY
  },
  CVE: {
    correct: "Common Vulnerabilities and Exposures",
    variants: [
      "Common Vulnerabilities and Exposures",
      "Common Vulnerability and Exposures",
      "CVE",
      "Common Vulnerability Exposures"
    ],
    category: ACRONYM_CATEGORIES.SECURITY
  },
  APT: {
    correct: "Advanced Persistent Threat",
    variants: [
      "Advanced Persistent Threat",
      "Advanced Persistence Threat",
      "APT",
      "Advanced Persistent Tactic"
    ],
    category: ACRONYM_CATEGORIES.SECURITY
  }
};

// Rest of the acronyms from your original list can be added with appropriate categories

function TechAcronymQuiz() {
  const navigate = useNavigate();
  const { userStats, addXP, updateStats } = useContext(UserContext);
  
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState(null);
  const [difficulty, setDifficulty] = useState('EASY');
  const [category, setCategory] = useState(null);
  const [showDifficultySelect, setShowDifficultySelect] = useState(false);
  const [showCategorySelect, setShowCategorySelect] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  
  // Quiz state
  const [currentAcronym, setCurrentAcronym] = useState("");
  const [options, setOptions] = useState([]);
  const [feedback, setFeedback] = useState({ show: false, isCorrect: false, message: '' });
  const [answerCooldown, setAnswerCooldown] = useState(false); // Cooldown state to prevent answer spamming
  
  // Performance tracking
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [combo, setCombo] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(15);
  
  // Power-ups
  const [powerUps, setPowerUps] = useState({
    timeFreeze: 2,
    eliminateTwo: 2, // Eliminate two wrong answers
    skipQuestion: 1
  });
  
  // Game stats
  const [gameStats, setGameStats] = useState(() => {
    const savedStats = localStorage.getItem('acronymQuizStats');
    return savedStats ? JSON.parse(savedStats) : {
      bestScore: 0,
      bestStreak: 0,
      gamesPlayed: 0,
      totalAttempts: 0,
      correctAnswers: 0,
      categoryMastery: {}
    };
  });
  
  const timerRef = useRef(null);

  // Generate a question based on selected category
  const generateQuestion = () => {
    // Get all acronyms filtered by category if specified
    const acronyms = Object.keys(ACRONYM_DATA).filter(acronym => 
      !category || ACRONYM_DATA[acronym].category === category
    );
    
    // Make sure we have acronyms to choose from
    if (acronyms.length === 0) {
      console.error("No acronyms available for the selected category!");
      return;
    }
    
    // Select a random acronym
    const randomIndex = Math.floor(Math.random() * acronyms.length);
    const selectedAcronym = acronyms[randomIndex];
    
    // Set the current acronym
    setCurrentAcronym(selectedAcronym);
    
    // Get the correct answer and variants for this acronym
    const { correct, variants } = ACRONYM_DATA[selectedAcronym];
    
    // Shuffle the variants and take 3 incorrect ones
    const shuffledVariants = [...variants].sort(() => Math.random() - 0.5);
    const incorrectOptions = shuffledVariants.filter(v => v !== correct).slice(0, 3);
    
    // Combine correct answer with 3 incorrect options and shuffle
    const allOptions = [correct, ...incorrectOptions].sort(() => Math.random() - 0.5);
    
    // Set the options
    setOptions(allOptions);
    
    // Reset feedback
    setFeedback({ show: false, isCorrect: false, message: '' });
    
    // IMPORTANT: Do NOT reset the timer here to maintain the time between questions
    
    // Make sure cooldown is disabled after generating a new question
    setAnswerCooldown(false);
    
    // Play sound
    SoundManager.play('click');
  };

  // Initialize game with selected mode, difficulty, and category
  const initializeGame = (mode, diff, cat = null) => {
    scrollToTop();
    setGameMode(mode);
    setDifficulty(diff);
    setCategory(cat);
    setGameStarted(true);
    setShowGameOver(false);
    
    // Reset game state
    setScore(0);
    setCorrectAnswers(0);
    setCurrentStreak(0);
    setCombo(1);
    
    // Set initial time based on difficulty
    setTimeRemaining(DIFFICULTY_LEVELS[diff].timeLimit);
    
    // Reset power-ups
    setPowerUps({
      timeFreeze: 2,
      eliminateTwo: 2,
      skipQuestion: 1
    });
    
    // Generate first question
    generateQuestion();
    
    // Start the timer for time attack mode
    if (mode === GAME_MODES.TIME_ATTACK) {
      startTimer();
    }
    
    // Play start sound
    SoundManager.play('gameStart');
  };

  // Handle power-up usage
  const handlePowerUp = (type) => {
    // No power-ups in practice mode or if all used
    if (gameMode === GAME_MODES.PRACTICE || powerUps[type] <= 0) return;
    
    // Update power-up count
    setPowerUps(prev => ({
      ...prev,
      [type]: prev[type] - 1
    }));
    
    SoundManager.play('powerup');
    
    // Stop timer temporarily
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Apply power-up effect
    switch (type) {
      case 'timeFreeze':
        // Add time in time attack mode
        setTimeRemaining(prev => prev + 10);
        setFeedback({
          show: true,
          isCorrect: true,
          message: "Time freeze activated! +10 seconds"
        });
        break;
      case 'eliminateTwo':
        // Eliminate two wrong answers
        const correctAnswer = ACRONYM_DATA[currentAcronym].correct;
        const wrongOptions = options.filter(option => option !== correctAnswer);
        const eliminating = wrongOptions.slice(0, 2);
        
        // Create new options with only two choices
        const newOptions = options.filter(option => 
          option === correctAnswer || !eliminating.includes(option)
        );
        
        setOptions(newOptions);
        
        setFeedback({
          show: true,
          isCorrect: true,
          message: "Two wrong answers eliminated!"
        });
        break;
      case 'skipQuestion':
        // Generate a new question
        generateQuestion();
        setFeedback({
          show: true,
          isCorrect: true,
          message: "Question skipped!"
        });
        break;
      default:
        break;
    }
    
    // Restart the timer after a short delay
    setTimeout(() => {
      if (gameMode === GAME_MODES.TIME_ATTACK) {
        startTimer();
      }
      
      // Hide feedback after 1.5 seconds
      setTimeout(() => {
        setFeedback({ show: false, isCorrect: false, message: '' });
      }, 1500);
    }, 500);
  };

  // End the game and update stats
  const endGame = () => {
    // Clear any timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Update game stats
    const newStats = {
      ...gameStats,
      bestScore: Math.max(gameStats.bestScore, score),
      bestStreak: Math.max(gameStats.bestStreak, currentStreak),
      gamesPlayed: gameStats.gamesPlayed + 1,
      totalAttempts: gameStats.totalAttempts + correctAnswers + (score > 0 ? 1 : 0),
      correctAnswers: gameStats.correctAnswers + correctAnswers
    };
    
    setGameStats(newStats);
    localStorage.setItem('acronymQuizStats', JSON.stringify(newStats));
    
    // Award XP based on score
    const xpEarned = Math.round(score / 10);
    if (xpEarned > 0) {
      addXP(xpEarned);
      
      // Update global stats if exists
      if (updateStats) {
        updateStats('acronymQuiz', {
          gamesPlayed: newStats.gamesPlayed,
          bestScore: newStats.bestScore,
          totalCorrect: newStats.correctAnswers
        });
      }
    }
    
    // Show game over screen
    setShowGameOver(true);
    
    // Play game over sound
    SoundManager.play('gameOver');
  };

  // Handle time out
  const handleTimeOut = () => {
    // Check if currentAcronym is valid before accessing properties
    if (currentAcronym && ACRONYM_DATA[currentAcronym]) {
      setFeedback({
        show: true,
        isCorrect: false,
        message: `Time's up! The correct answer is: ${ACRONYM_DATA[currentAcronym].correct}`
      });
    } else {
      setFeedback({
        show: true,
        isCorrect: false,
        message: `Time's up!`
      });
    }
    
    // End the game after showing feedback briefly
    setTimeout(() => {
      endGame();
    }, 2000); // Reduced from 3000ms for shorter feedback time
  };

  // Handle answer selection
  const handleAnswerClick = (selectedAnswer) => {
    // If in cooldown, do nothing
    if (answerCooldown) return;
    
    // Set cooldown to prevent answer spamming
    setAnswerCooldown(true);
    
    // Pause the timer but don't clear it yet (we'll restart the same timer after processing)
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Check if currentAcronym is valid
    if (!currentAcronym || !ACRONYM_DATA[currentAcronym]) {
      setFeedback({
        show: true,
        isCorrect: false,
        message: "Error: Invalid question. Starting a new one."
      });
      generateQuestion();
      
      if (gameMode === GAME_MODES.TIME_ATTACK) {
        // Restart the timer with the current time value
        startTimer();
      }
      
      // No need to set cooldown here as generateQuestion will reset it
      return;
    }
    
    // Check if the selected answer is correct
    const isCorrect = selectedAnswer === ACRONYM_DATA[currentAcronym].correct;
    
    if (isCorrect) {
      // Update streak and score
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      
      // Update combo multiplier
      const newCombo = Math.min(combo + 0.1, 3);
      setCombo(newCombo);
      
      // Calculate points based on difficulty, combo, and time bonus
      const difficultyMultiplier = DIFFICULTY_LEVELS[difficulty].multiplier;
      const timeBonus = gameMode === GAME_MODES.TIME_ATTACK 
        ? Math.max(1, timeRemaining / DIFFICULTY_LEVELS[difficulty].timeLimit) 
        : 1;
      const points = Math.round(100 * difficultyMultiplier * combo * timeBonus);
      
      // Update score and correct answers
      setScore(prev => prev + points);
      setCorrectAnswers(prev => prev + 1);
      
      // Add time for time attack mode
      if (gameMode === GAME_MODES.TIME_ATTACK) {
        // Add 5 seconds for correct answer, cap at 1.5x the initial time limit
        setTimeRemaining(prev => Math.min(prev + 5, DIFFICULTY_LEVELS[difficulty].timeLimit * 1.5));
      }
      
      // Show feedback
      setFeedback({
        show: true,
        isCorrect: true,
        message: `Correct! +${points} points`
      });
      
      // Play correct sound
      SoundManager.play('correct');
      
      // Set a timer to generate new question after feedback is shown
      setTimeout(() => {
        // Generate a new question - this will also reset the cooldown
        generateQuestion();
        
        // Start the timer again for time attack mode, keeping the current time
        if (gameMode === GAME_MODES.TIME_ATTACK) {
          startTimer();
        }
      }, 1500); // Show feedback for 1.5 seconds before new question
    } else {
      // Reset streak and combo
      setCurrentStreak(0);
      setCombo(1);
      
      // Apply time penalty in time attack mode
      if (gameMode === GAME_MODES.TIME_ATTACK) {
        // Calculate new time after penalty (subtract the difficulty's time penalty)
        const newTime = Math.max(0, timeRemaining - DIFFICULTY_LEVELS[difficulty].timePenalty);
        setTimeRemaining(newTime);
        
        // If time is now zero, end the game immediately
        if (newTime <= 0) {
          // Show feedback briefly before ending game
          setFeedback({
            show: true,
            isCorrect: false,
            message: `Incorrect! The correct answer is: ${ACRONYM_DATA[currentAcronym].correct}`
          });
          SoundManager.play('wrong');
          
          // Short delay before ending game
          setTimeout(() => {
            endGame();
          }, 2000); // Reduced from 3000ms to 2000ms for shorter feedback time
          return;
        }
      }
      
      // Show feedback
      setFeedback({
        show: true,
        isCorrect: false,
        message: `Incorrect! The correct answer is: ${ACRONYM_DATA[currentAcronym].correct}`
      });
      
      // Play wrong sound
      SoundManager.play('wrong');
      
      // In practice mode, generate a new question after feedback
      if (gameMode === GAME_MODES.PRACTICE) {
        // Generate a new question after a delay
        setTimeout(() => {
          generateQuestion(); // This will also reset the cooldown
        }, 2000); // Reduced from 3000ms to 2000ms for shorter feedback time
      } else {
        // In time attack mode, continue the game with a time penalty
        setTimeout(() => {
          if (!showGameOver) { // Only generate a new question if the game hasn't ended
            generateQuestion(); // This will also reset the cooldown
            // Restart the timer with the current (penalized) time value
            startTimer();
          }
        }, 2000); // Reduced from 3000ms to 2000ms for shorter feedback time
      }
    }
  };

  // Start the timer for time attack mode
  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prevTimer => {
        if (prevTimer <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
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

  // Save game stats when they change
  useEffect(() => {
    localStorage.setItem('acronymQuizStats', JSON.stringify(gameStats));
  }, [gameStats]);

  // Set game context for proper volume adjustment
  useEffect(() => {
    // Set game context for volume balancing
    SoundManager.setGameContext('TechAcronymQuiz');
    
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

  // Rendering the menu if the game has not started
  if (!gameStarted && !showGameOver) {
    if (showCategorySelect) {
      return (
        <div className="acronym-game">
          <h2 className="game-title">Select Category</h2>
          <div className="category-select">
            <div className="category-cards">
              {Object.entries(ACRONYM_CATEGORIES).map(([key, value]) => (
                <div
                  key={key}
                  className="category-card"
                  onClick={() => {
                    setCategory(value);
                    setShowCategorySelect(false);
                    
                    if (gameMode === GAME_MODES.TIME_ATTACK) {
                      setShowDifficultySelect(true);
                    } else {
                      initializeGame(GAME_MODES.PRACTICE, 'EASY', value);
                    }
                    
                    scrollToTop();
                  }}
                >
                  <div className="category-icon">
                    {key === 'NETWORKING' ? '🌐' : 
                     key === 'HARDWARE' ? '💻' :
                     key === 'SOFTWARE' ? '📊' : '🔒'}
                  </div>
                  <h4>{value}</h4>
                  <p>Test your knowledge of {value.toLowerCase()} acronyms</p>
                </div>
              ))}
              <div
                className="category-card"
                onClick={() => {
                  setCategory(null);
                  setShowCategorySelect(false);
                  
                  if (gameMode === GAME_MODES.TIME_ATTACK) {
                    setShowDifficultySelect(true);
                  } else {
                    initializeGame(GAME_MODES.PRACTICE, 'EASY', null);
                  }
                  
                  scrollToTop();
                }}
              >
                <div className="category-icon">🔄</div>
                <h4>All Categories</h4>
                <p>Mix of acronyms from all categories</p>
              </div>
            </div>
            
            <div className="nav-buttons">
              <button 
                className="back-button"
                onClick={() => {
                  setShowCategorySelect(false);
                  scrollToTop();
                }}
              >
                ← Back to Mode Selection
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    if (showDifficultySelect) {
      return (
        <div className="acronym-game">
          <h2 className="game-title">Select Difficulty</h2>
          <div className="difficulty-select">
            <div className="difficulty-cards">
              {Object.entries(DIFFICULTY_LEVELS).map(([key, value]) => (
                <div
                  key={key}
                  className="difficulty-card"
                  data-difficulty={key}
                  onClick={() => {
                    initializeGame(GAME_MODES.TIME_ATTACK, key, category);
                    scrollToTop();
                  }}
                >
                  <h4>{value.name}</h4>
                  <ul>
                    <li>{value.timeLimit} second time limit</li>
                    <li>{value.multiplier}x score multiplier</li>
                    {value.showHints && <li>Hints available</li>}
                    <li>{value.timePenalty} second penalty for wrong answers</li>
                  </ul>
                </div>
              ))}
            </div>
            
            <div className="nav-buttons">
              <button 
                className="back-button"
                onClick={() => {
                  setShowDifficultySelect(false);
                  setShowCategorySelect(true);
                  scrollToTop();
                }}
              >
                ← Back to Categories
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="acronym-game">
        <h2 className="game-title">Tech Acronym Quiz</h2>
        <p className="game-description">
          Test your knowledge of technology acronyms and their meanings
        </p>
        
        <div className="stats-container">
          <h3>Your Stats</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{gameStats.bestScore}</span>
              <span className="stat-label">Best Score</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{gameStats.bestStreak}</span>
              <span className="stat-label">Best Streak</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{gameStats.gamesPlayed}</span>
              <span className="stat-label">Games Played</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {gameStats.totalAttempts === 0 
                  ? '0%' 
                  : `${Math.floor((gameStats.correctAnswers / gameStats.totalAttempts) * 100)}%`}
              </span>
              <span className="stat-label">Accuracy</span>
            </div>
          </div>
        </div>
        
        <div className="game-setup">
          <h3>Select Game Mode</h3>
          <div className="game-modes">
            <div 
              className="game-mode-card"
              onClick={() => {
                setGameMode(GAME_MODES.TIME_ATTACK);
                setShowCategorySelect(true);
                scrollToTop();
              }}
            >
              <h3>Time Attack</h3>
              <p>Race against the clock to identify as many acronyms as possible!</p>
              <ul>
                <li>Limited time based on difficulty</li>
                <li>Correct answers add time</li>
                <li>Incorrect answers end the game</li>
                <li>Score based on speed and accuracy</li>
              </ul>
            </div>
            <div 
              className="game-mode-card"
              onClick={() => {
                setGameMode(GAME_MODES.PRACTICE);
                setShowCategorySelect(true);
                scrollToTop();
              }}
            >
              <h3>Practice Mode</h3>
              <p>Learn at your own pace without time pressure</p>
              <ul>
                <li>No time limit</li>
                <li>Unlimited attempts</li>
                <li>Detailed feedback</li>
                <li>Great for beginners</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="nav-buttons">
          <button 
            className="back-button"
            onClick={() => navigate('/dashboard')}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Game over screen
  if (showGameOver) {
    const isNewHighScore = score > gameStats.bestScore;
    return (
      <div className="acronym-game">
        <div className="game-over-stats">
          <h2>{isNewHighScore ? '🏆 New High Score! 🏆' : 'Game Over'}</h2>
          <div className="final-stats">
            <div className="stat-item">
              <span className="stat-label">Score</span>
              <span className={`stat-value ${isNewHighScore ? 'highlight' : ''}`}>{score}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Correct Answers</span>
              <span className="stat-value">{correctAnswers}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Best Streak</span>
              <span className="stat-value">{Math.max(currentStreak, gameStats.bestStreak)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">XP Earned</span>
              <span className="stat-value">{Math.round(score / 10)}</span>
            </div>
          </div>
          <div className="game-over-buttons">
            <button 
              className="restart-btn"
              onClick={() => initializeGame(gameMode, difficulty, category)}
            >
              Play Again
            </button>
            <button 
              className="home-btn"
              onClick={() => {
                setShowGameOver(false);
                setGameStarted(false);
                scrollToTop();
              }}
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main game interface
  return (
    <div className="acronym-game">
      <div className="game-header">
        <div className="game-info">
          <div className="mode-indicator">
            {gameMode === GAME_MODES.TIME_ATTACK ? 'Time Attack' : 'Practice Mode'}
            <span className="difficulty-badge">{DIFFICULTY_LEVELS[difficulty].name}</span>
            {category && <span className="category-badge">{category}</span>}
          </div>
          
          <div className="score-display">
            Score: <span>{score}</span>
          </div>
          
          {gameMode === GAME_MODES.TIME_ATTACK && (
            <div className={`time-display ${timeRemaining < 5 ? 'urgent' : ''}`}>
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
            className={`power-up-btn ${powerUps.eliminateTwo > 0 ? '' : 'disabled'}`}
            onClick={() => handlePowerUp('eliminateTwo')}
            disabled={gameMode === GAME_MODES.PRACTICE || powerUps.eliminateTwo <= 0 || options.length <= 2}
          >
            ✂️ Eliminate ({powerUps.eliminateTwo})
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
          <div className={`feedback-message ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
            {feedback.message}
          </div>
        )}
        
        <div className="question-container">
          <div className="acronym-display">
            {currentAcronym}
          </div>
          
          <div className="timer-bar-container">
            <div 
              className={`timer-bar ${timeRemaining < 5 ? 'urgent' : ''}`} 
              style={{width: `${(timeRemaining / DIFFICULTY_LEVELS[difficulty].timeLimit) * 100}%`}}
            ></div>
          </div>
          
          <div className="answer-options">
            {options.map((option, index) => (
              <button 
                key={index} 
                className={`answer-option ${answerCooldown ? 'disabled' : ''}`}
                onClick={() => handleAnswerClick(option)}
                disabled={answerCooldown}
              >
                {option}
              </button>
            ))}
          </div>
          
          {currentStreak >= 3 && (
            <div className="combo-display">
              <span>Combo: <span className="combo-count">{currentStreak}</span></span>
              <span>Multiplier: <span className="multiplier">x{combo.toFixed(1)}</span></span>
            </div>
          )}
        </div>
      </div>
      
      {/* Back to menu and End Game buttons */}
      <div style={{ marginTop: '2rem', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        {gameMode === GAME_MODES.PRACTICE && (
          <button 
            className="restart-btn"
            onClick={() => endGame()}
          >
            End Game & Collect XP
          </button>
        )}
        
        <button 
          className="back-button"
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
      </div>
    </div>
  );
}

export default TechAcronymQuiz;
