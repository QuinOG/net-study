import React, { useContext } from 'react';
import { FiArrowRight, FiBookOpen, FiCode, FiLock, FiServer, FiShare2, FiShield, FiTerminal, FiWifi } from 'react-icons/fi';
import { UserContext } from '../../context/UserContext';
import SoundManager from '../../utils/SoundManager';
import { formatNumber, getLevelProgress } from '../../utils/progression';
import { Badge, ButtonLink, PageHeader, ProgressBar, SectionHeader, StatTile, Surface } from '../foundations/Primitives';
import CompactLeaderboard from './CompactLeaderboard';
import '../../styles/dashboard/Dashboard.css';

const missions = [
  { slug: 'port', title: 'Port Number Game', description: 'Match common networking ports with their services.', category: 'Network services', difficulty: 'Beginner', duration: '3–5 min', icon: <FiServer /> },
  { slug: 'protocol', title: 'Protocol Matcher', description: 'Connect networking protocols with their core functions.', category: 'Protocols', difficulty: 'Beginner', duration: '4–6 min', icon: <FiWifi /> },
  { slug: 'subnet', title: 'Subnetting Challenge', description: 'Calculate network ranges and broadcast addresses.', category: 'Addressing', difficulty: 'Intermediate', duration: '5–8 min', icon: <FiCode /> },
  { slug: 'acronym', title: 'Tech Acronym Quiz', description: 'Decode the terminology used across networking and IT.', category: 'Terminology', difficulty: 'Beginner', duration: '3–5 min', icon: <FiBookOpen /> },
  { slug: 'command', title: 'Command Line Challenge', description: 'Practice essential commands across systems and devices.', category: 'Operations', difficulty: 'Intermediate', duration: '5–8 min', icon: <FiTerminal /> },
  { slug: 'network-topology', title: 'Network Topology', description: 'Build and analyze common network arrangements.', category: 'Architecture', difficulty: 'Intermediate', duration: '5–8 min', icon: <FiShare2 /> },
  { slug: 'firewall-rules', title: 'Firewall Rules', description: 'Configure access controls for realistic traffic scenarios.', category: 'Security', difficulty: 'Advanced', duration: '6–10 min', icon: <FiShield /> },
  { slug: 'encryption-challenge', title: 'Encryption Challenge', description: 'Identify and work with common cryptographic methods.', category: 'Security', difficulty: 'Advanced', duration: '5–8 min', icon: <FiLock /> },
];

function readBestScore(slug, user) {
  const userKey = user?.id || user?.guestId || 'guest';
  const keys = { port: `portGameStats_${userKey}`, protocol: `protocolGameStats_${userKey}`, acronym: `acronymQuizStats_${userKey}`, subnet: 'subnettingGameStats', command: 'commandLineStats' };
  try { return JSON.parse(localStorage.getItem(keys[slug]) || 'null')?.bestScore || 0; } catch { return 0; }
}

function MissionCard({ mission, user, featured = false }) {
  const bestScore = readBestScore(mission.slug, user);
  return <Surface className={`nq-mission-card ${featured ? 'nq-mission-card--featured' : ''}`} padding="md">
    <div className="nq-mission-card__top"><span className="nq-mission-card__icon" aria-hidden="true">{mission.icon}</span><Badge tone={mission.difficulty === 'Advanced' ? 'warning' : mission.difficulty === 'Intermediate' ? 'info' : 'success'}>{mission.difficulty}</Badge></div>
    <div className="nq-mission-card__body"><span className="nq-eyebrow">{mission.category}</span><h3>{mission.title}</h3><p>{mission.description}</p></div>
    <div className="nq-mission-card__meta"><span data-technical>{bestScore ? `BEST ${formatNumber(bestScore)}` : 'READY TO START'}</span><span>{mission.duration}</span></div>
    <ButtonLink to={`/dashboard/${mission.slug}`} onClick={() => SoundManager.play('click')}>Start mission <FiArrowRight aria-hidden="true" /></ButtonLink>
  </Surface>;
}

export default function Dashboard() {
  const { user, userStats } = useContext(UserContext);
  const progress = getLevelProgress(userStats?.totalXP || 0);
  const streak = userStats?.currentStreak || 0;
  const dailyProgress = Math.min(3, userStats?.subnettingChallengesCompletedToday || 0);
  const displayName = user?.displayName || user?.username || 'Explorer';

  return <div className="nq-dashboard">
    <PageHeader eyebrow="Network operations academy" title={`Welcome back, ${displayName}`} description="Pick up your route, build today’s signal, or choose a new mission." />
    <Surface className="nq-dashboard__continue" padding="lg">
      <div className="nq-dashboard__continue-copy"><Badge tone="info">Recommended next</Badge><h2>Strengthen your network service recall</h2><p>Port Number Game is a fast way to practice the service and port pairings used throughout networking.</p><div className="nq-dashboard__continue-meta"><span data-technical>PORT → SERVICE</span><span>3–5 minutes</span><span>Beginner</span></div><ButtonLink to="/dashboard/port" size="lg" onClick={() => SoundManager.play('click')}>Start next mission <FiArrowRight aria-hidden="true" /></ButtonLink></div>
      <div className="nq-dashboard__network" data-motion="decorative" aria-hidden="true"><span /><span /><span /><span /></div>
    </Surface>

    <section className="nq-dashboard__signals" aria-label="Daily and account progress">
      <Surface padding="md" className="nq-dashboard__daily"><SectionHeader title="Daily signal" description="Complete three subnetting challenges today." /><ProgressBar label="Daily progress" value={dailyProgress} max={3} valueLabel={`${dailyProgress} of 3`} tone="success" /><div className="nq-dashboard__reward"><Badge tone="xp">+60 XP</Badge><span>Resets at midnight</span></div></Surface>
      <div className="nq-dashboard__stats"><StatTile label="Level" value={progress.level} detail={`${progress.current} / ${progress.required} XP`} tone="xp" /><StatTile label="Day streak" value={`${streak} day${streak === 1 ? '' : 's'}`} detail={streak ? 'Keep the route alive' : 'Start your streak today'} tone="streak" /><StatTile label="Missions played" value={userStats?.gamesPlayed || 0} detail={`${userStats?.questionsAnswered || 0} questions answered`} /></div>
    </section>

    <section className="nq-dashboard__section" aria-labelledby="recommended-title"><SectionHeader title="Recommended missions" description="A short route through networking fundamentals." headingId="recommended-title" /><div className="nq-dashboard__recommended">{missions.slice(0, 3).map((mission) => <MissionCard key={mission.slug} mission={mission} user={user} featured />)}</div></section>
    <section className="nq-dashboard__section" aria-labelledby="library-title"><SectionHeader title="All missions" description="Eight ways to practice networking concepts without changing your learning path." headingId="library-title" /><div className="nq-dashboard__library">{missions.map((mission) => <MissionCard key={mission.slug} mission={mission} user={user} />)}</div></section>
    <section className="nq-dashboard__social" aria-label="Community leaderboard"><CompactLeaderboard /></section>
  </div>;
}
