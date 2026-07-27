import React, { useEffect } from 'react';
import { FiArrowUp } from 'react-icons/fi';
import { Button } from '../foundations/Primitives';
import '../../styles/ui/RewardAnimation.css';

export default function RewardAnimation({ xpGained = 0, show = false, onComplete }) {
  useEffect(() => { if (!show) return undefined; const timer = window.setTimeout(() => onComplete?.(), 2500); return () => window.clearTimeout(timer); }, [show, onComplete]);
  if (!show) return null;
  return <div className="reward-animation-container" role="dialog" aria-modal="true" aria-labelledby="reward-title">
    <div className="reward-center"><span className="reward-center__icon" aria-hidden="true"><FiArrowUp /></span><span className="nq-eyebrow">Mission reward</span><h2 id="reward-title" className="xp-text-large">+{xpGained} XP</h2><p>Progress added to your learning journey.</p><Button variant="secondary" onClick={onComplete}>Continue</Button></div>
  </div>;
}
