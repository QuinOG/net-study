import React, { useContext, useState } from 'react';
import { FiArrowRight, FiBookOpen, FiCheck, FiCopy, FiGitBranch, FiLogOut, FiPlay, FiShare2, FiShield, FiUsers, FiZap } from 'react-icons/fi';
import '../../styles/ui/LandingPage.css';
import logo from '../../assets/images/netquest.png';
import LoginSignup from './LoginSignup';
import { UserContext } from '../../context/UserContext';
import { Badge, Button, Dialog } from '../foundations/Primitives';

const missions = [
  { icon: <FiShield />, name: 'Port Number Game', detail: 'Match services to the ports that carry them.', meta: '5–8 min' },
  { icon: <FiGitBranch />, name: 'Subnetting Challenge', detail: 'Practice CIDR, hosts, and network ranges.', meta: '8–12 min' },
  { icon: <FiZap />, name: 'Protocol Matcher', detail: 'Connect protocols with their real-world roles.', meta: '5–8 min' },
];

export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const { user, logout, userStats, isLoggedIn } = useContext(UserContext);
  const isGuest = Boolean(user?.isGuest);
  const referralLink = `${window.location.origin}?ref=${encodeURIComponent(userStats?.username || user?.username || 'friend')}`;

  const startGuest = () => { window.location.href = '/dashboard?mode=guest'; };
  const continueJourney = () => { window.location.href = '/dashboard'; };
  const copyReferral = async () => {
    try { await navigator.clipboard.writeText(referralLink); setCopyStatus('Referral link copied.'); }
    catch { setCopyStatus('Copy failed. Select the link and copy it manually.'); }
  };

  return <div className="nq-landing">
    <header className="nq-public-header">
      <a className="nq-public-brand" href="#top" aria-label="NetQuest home"><img src={logo} alt="" /><span>NetQuest</span></a>
      <nav aria-label="Public navigation"><a href="#how-it-works">How it works</a><a href="#missions">Missions</a><a href="#community">Community</a></nav>
      <div className="nq-public-header__actions">
        {isLoggedIn ? <><Button variant="ghost" size="sm" onClick={continueJourney}>Dashboard</Button><Button variant="secondary" size="sm" onClick={logout}><FiLogOut /> Log out</Button></>
          : <Button variant="secondary" size="sm" onClick={() => setAuthOpen(true)}>Sign in</Button>}
      </div>
    </header>

    <main id="top">
      <section className="nq-landing-hero" aria-labelledby="landing-title">
        <div className="nq-landing-hero__copy">
          <Badge tone="info">Network operations academy</Badge>
          <h1 id="landing-title">{isLoggedIn ? <>Welcome back, {user?.displayName || 'operator'}.</> : 'Learn networking by running the mission.'}</h1>
          <p>{isLoggedIn ? 'Your next networking mission is ready.' : 'Build practical networking instincts with short lessons, focused challenges, and feedback that shows you what to improve.'}</p>
          <div className="nq-landing-hero__actions">
            <Button size="lg" onClick={isLoggedIn ? continueJourney : startGuest}>{isLoggedIn ? 'Continue to Dashboard' : 'Start as guest'} <FiArrowRight /></Button>
            {!isLoggedIn && <Button variant="secondary" size="lg" onClick={() => setAuthOpen(true)}>Sign in</Button>}
            {isGuest && <Button variant="secondary" size="lg" onClick={() => setAuthOpen(true)}>Save guest progress</Button>}
          </div>
          <p className="nq-landing-hero__note"><FiCheck aria-hidden="true" /> No account required to start</p>
        </div>
        <div className="nq-mission-preview" aria-label="Mission preview">
          <div className="nq-mission-preview__top"><span><i /> LIVE MISSION</span><span data-technical>04 / 10</span></div>
          <div className="nq-mission-preview__route" aria-hidden="true"><span className="is-complete">1</span><i /><span className="is-active">2</span><i /><span>3</span></div>
          <p className="nq-eyebrow">Port → service</p><h2 data-technical>443 / TCP</h2><p>Which service usually receives this traffic?</p>
          <div className="nq-mission-preview__answers"><span>HTTP</span><span className="is-selected"><FiCheck /> HTTPS</span><span>SSH</span></div>
          <div className="nq-mission-preview__feedback"><FiCheck /> Correct · secure web traffic <strong>+120 XP</strong></div>
        </div>
      </section>

      <section className="nq-public-section" id="how-it-works" aria-labelledby="loop-title">
        <div className="nq-public-section__heading"><span className="nq-eyebrow">A clear learning loop</span><h2 id="loop-title">Know what to do next—and why.</h2></div>
        <div className="nq-learning-loop">
          <article><span>01</span><FiBookOpen /><h3>Learn the signal</h3><p>Read concise lessons grounded in real network tasks.</p></article>
          <article><span>02</span><FiPlay /><h3>Run a mission</h3><p>Practice with an interactive challenge at your level.</p></article>
          <article><span>03</span><FiZap /><h3>Review and advance</h3><p>See feedback, earn XP, and continue along your path.</p></article>
        </div>
      </section>

      <section className="nq-public-section" id="missions" aria-labelledby="missions-title">
        <div className="nq-public-section__heading"><span className="nq-eyebrow">Mission library</span><h2 id="missions-title">Practice the skills behind the diagram.</h2><p>Eight focused games turn abstract concepts into repeatable decisions.</p></div>
        <div className="nq-public-missions">{missions.map(mission => <article key={mission.name}><span className="nq-public-missions__icon">{mission.icon}</span><Badge>{mission.meta}</Badge><h3>{mission.name}</h3><p>{mission.detail}</p></article>)}</div>
      </section>

      <section className="nq-public-section nq-community" id="community" aria-labelledby="community-title">
        <div><span className="nq-eyebrow">Learn together</span><h2 id="community-title">Bring another operator onto the network.</h2><p>Invite a friend after you understand the experience. Your referral link is ready when you are.</p></div>
        <Button variant="secondary" onClick={() => setReferralOpen(true)}><FiUsers /> Invite a friend</Button>
      </section>
    </main>

    <footer className="nq-public-footer"><a className="nq-public-brand" href="#top"><img src={logo} alt="" /><span>NetQuest</span></a><p>Practical networking, one mission at a time.</p><small>© {new Date().getFullYear()} NetQuest</small></footer>
    <LoginSignup open={authOpen} onClose={() => setAuthOpen(false)} />
    <Dialog open={referralOpen} onClose={() => { setReferralOpen(false); setCopyStatus(''); }} title="Invite a friend" description="Share NetQuest with someone who wants to build practical networking skills."
      actions={<Button variant="secondary" onClick={() => setReferralOpen(false)}>Done</Button>}>
      <label className="nq-referral-label" htmlFor="referral-link">Your referral link</label><div className="nq-referral-copy"><input id="referral-link" readOnly value={referralLink} onFocus={event => event.target.select()} /><Button onClick={copyReferral}><FiCopy /> Copy</Button></div>
      <p className="nq-referral-status" role="status" aria-live="polite">{copyStatus}</p>
      <a className="nq-referral-share" href={`mailto:?subject=${encodeURIComponent('Join me on NetQuest')}&body=${encodeURIComponent(`Build your networking skills with me: ${referralLink}`)}`}><FiShare2 /> Share by email</a>
    </Dialog>
  </div>;
}
