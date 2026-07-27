import React, { useMemo, useState } from 'react';
import { FiAward, FiCheck, FiCompass, FiLock, FiRadio, FiTarget, FiTrendingUp, FiZap } from 'react-icons/fi';
import { Badge, ProgressBar, StatTile, Tabs } from '../foundations/Primitives';
import '../../styles/ui/Achievements.css';

const achievements = [
  ['proto_beginner', 'First signal', 'Complete 5 protocol challenges', 5, 'protocol', FiRadio], ['proto_novice', 'Protocol operator', 'Complete 15 protocol challenges', 15, 'protocol', FiRadio], ['proto_expert', 'Protocol specialist', 'Complete 50 protocol challenges', 50, 'protocol', FiAward], ['proto_master', 'Protocol mastery', 'Complete 100 protocol challenges', 100, 'protocol', FiAward],
  ['port_beginner', 'Port explorer', 'Match 10 ports correctly', 10, 'port', FiCompass], ['port_novice', 'Port navigator', 'Match 30 ports correctly', 30, 'port', FiCompass], ['port_expert', 'Port authority', 'Match 100 ports correctly', 100, 'port', FiAward], ['port_master', 'Port mastery', 'Match 250 ports correctly', 250, 'port', FiAward],
  ['subnet_beginner', 'Subnet starter', 'Complete 5 subnetting challenges', 5, 'subnet', FiTarget], ['subnet_novice', 'Subnet solver', 'Complete 15 subnetting challenges', 15, 'subnet', FiTarget], ['subnet_expert', 'Subnet specialist', 'Complete 30 subnetting challenges', 30, 'subnet', FiAward], ['subnet_master', 'Subnet mastery', 'Complete 75 subnetting challenges', 75, 'subnet', FiAward],
  ['streak_beginner', 'Habit forming', 'Maintain a 3-day streak', 3, 'streak', FiZap], ['streak_novice', 'Connected week', 'Maintain a 7-day streak', 7, 'streak', FiZap], ['streak_expert', 'Dedicated operator', 'Maintain a 14-day streak', 14, 'streak', FiZap], ['streak_master', 'Unstoppable', 'Maintain a 30-day streak', 30, 'streak', FiAward],
].map(([id, name, description, requirement, category, Icon]) => ({ id, name, description, requirement, category, Icon }));
const filters = [{ id: 'all', label: 'All' }, { id: 'earned', label: 'Earned' }, { id: 'in-progress', label: 'In progress' }];
const progressFor = (stats, category) => ({ protocol: stats?.protocolChallengesCompleted, port: stats?.portsMatchedCorrectly, subnet: stats?.subnettingChallengesCompleted, streak: stats?.currentStreak }[category] || 0);

export default function AchievementSystem({ userStats }) {
  const [filter, setFilter] = useState('all');
  const items = useMemo(() => achievements.map(item => ({ ...item, progress: progressFor(userStats, item.category), earned: progressFor(userStats, item.category) >= item.requirement })), [userStats]);
  const earned = items.filter(item => item.earned).length;
  const visible = items.filter(item => filter === 'all' || (filter === 'earned' ? item.earned : !item.earned));
  const closest = items.filter(item => !item.earned).sort((a, b) => b.progress / b.requirement - a.progress / a.requirement)[0];
  return <div className="nq-achievements">
    <div className="nq-achievements__summary">
      <StatTile icon={<FiAward />} tone="xp" label="Achievements earned" value={`${earned} / ${items.length}`} detail={`${Math.round(earned / items.length * 100)}% complete`} />
      <StatTile icon={<FiTrendingUp />} label="Closest milestone" value={closest ? closest.name : 'All complete'} detail={closest ? `${closest.requirement - closest.progress} remaining` : 'Excellent work'} />
      <StatTile icon={<FiZap />} tone="streak" label="Current streak" value={`${userStats?.currentStreak || 0} days`} detail="Keep the signal active" />
    </div>
    <section className="achievements-container" aria-labelledby="achievement-list-title">
      <div className="nq-achievements__toolbar"><div><h2 id="achievement-list-title">Achievement collection</h2><p>Earned milestones and your progress toward what comes next.</p></div><Tabs label="Achievement status" items={filters} activeId={filter} onChange={setFilter} /></div>
      <div className="achievements-list">{visible.map(item => { const bounded = Math.min(item.progress, item.requirement); return <article key={item.id} className={`achievement-item ${item.earned ? 'unlocked' : 'locked'}`}>
        <span className="achievement-icon" aria-hidden="true"><item.Icon /></span><div className="achievement-content"><div className="achievement-content__title"><h3>{item.name}</h3><Badge tone={item.earned ? 'success' : 'neutral'}>{item.earned ? <><FiCheck /> Earned</> : <><FiLock /> Locked</>}</Badge></div><p>{item.description}</p><ProgressBar label={`${item.name} progress`} value={bounded} max={item.requirement} valueLabel={`${bounded} / ${item.requirement}`} tone={item.earned ? 'success' : 'xp'} /></div>
      </article>; })}</div>
    </section>
  </div>;
}
