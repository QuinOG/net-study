import React, { useContext, useMemo, useState } from 'react';
import { FiArrowDown, FiArrowRight, FiArrowUp, FiMinus } from 'react-icons/fi';
import { UserContext } from '../../context/UserContext';
import { formatNumber, getLevelProgress } from '../../utils/progression';
import { Badge, ButtonLink, LoadingState, Surface, Tabs } from '../foundations/Primitives';

const players = [
  { id: 'user1', name: 'NetworkNinja', xp: 4200, streak: 15, level: 12, previousRank: 2 },
  { id: 'user2', name: 'PacketPro', xp: 3800, streak: 22, level: 11, previousRank: 1 },
  { id: 'user6', name: 'FirewallFinder', xp: 4000, streak: 10, level: 8, previousRank: 6 },
  { id: 'user3', name: 'RouterGuru', xp: 3500, streak: 8, level: 10, previousRank: 3 },
];

const tabItems = [{ id: 'xp', label: 'XP' }, { id: 'streak', label: 'Streak' }, { id: 'level', label: 'Level' }];

function RankChange({ rank, previousRank }) {
  const delta = previousRank - rank;
  if (delta > 0) return <span className="nq-compact-board__change nq-compact-board__change--up" aria-label={`Up ${delta} place${delta === 1 ? '' : 's'}`}><FiArrowUp />{delta}</span>;
  if (delta < 0) return <span className="nq-compact-board__change nq-compact-board__change--down" aria-label={`Down ${Math.abs(delta)} place${delta === -1 ? '' : 's'}`}><FiArrowDown />{Math.abs(delta)}</span>;
  return <span className="nq-compact-board__change" aria-label="No rank change"><FiMinus /></span>;
}

export default function CompactLeaderboard() {
  const { userStats, loading } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('xp');
  const { rows, userRank } = useMemo(() => {
    const current = userStats ? { id: 'current', name: 'You', xp: userStats.totalXP || 0, streak: userStats.currentStreak || 0, level: getLevelProgress(userStats.totalXP || 0).level, previousRank: userStats.previousRank, current: true } : null;
    const sorted = [...players, ...(current ? [current] : [])].sort((a, b) => activeTab === 'xp' ? b.xp - a.xp : activeTab === 'streak' ? b.streak - a.streak : b.level - a.level || b.xp - a.xp);
    return { rows: sorted.slice(0, 3), userRank: current ? sorted.findIndex((player) => player.current) + 1 : null };
  }, [activeTab, userStats]);

  if (loading) return <Surface className="nq-compact-board" padding="sm"><LoadingState label="Loading leaderboard…" /></Surface>;
  const valueLabel = activeTab === 'xp' ? 'XP' : activeTab === 'streak' ? 'days' : 'level';
  return <Surface className="nq-compact-board" padding="md">
    <div className="nq-compact-board__header"><div><span className="nq-eyebrow">Community signal</span><h2>Leaderboard</h2></div>{userRank && <Badge tone="info">Your rank: {userRank}</Badge>}</div>
    <Tabs label="Leaderboard metric" items={tabItems} activeId={activeTab} onChange={setActiveTab} />
    <ol className="nq-compact-board__list" aria-label={`Top players by ${activeTab}`}>{rows.map((player, index) => <li key={player.id} className={player.current ? 'nq-compact-board__current' : undefined}><span className="nq-compact-board__rank" data-rank={index + 1} data-technical>{index + 1}</span><strong>{player.name}</strong><span className="nq-compact-board__score" data-technical>{activeTab === 'xp' ? formatNumber(player.xp) : activeTab === 'streak' ? player.streak : player.level} <small>{valueLabel}</small></span><RankChange rank={index + 1} previousRank={player.previousRank} /></li>)}</ol>
    <ButtonLink to="/dashboard/stats" variant="quiet" size="sm">View full leaderboard <FiArrowRight aria-hidden="true" /></ButtonLink>
  </Surface>;
}
