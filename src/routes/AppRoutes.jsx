import React, { useEffect, useRef } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation, useNavigationType } from 'react-router-dom';
import RouteErrorBoundary from './RouteErrorBoundary';
import NotFoundPage from './NotFoundPage';
import { LoadingState } from '../components/foundations/Primitives';

const defaultGames = {
  protocol: React.lazy(() => import('../components/games/ProtocolGame')),
  port: React.lazy(() => import('../components/games/PortGame')),
  subnet: React.lazy(() => import('../components/games/SubnettingChallenge')),
  acronym: React.lazy(() => import('../components/games/TechAcronymQuiz')),
  command: React.lazy(() => import('../components/games/CommandLineChallenge')),
  'network-topology': React.lazy(() => import('../components/games/NetworkTopologyGame')),
  'firewall-rules': React.lazy(() => import('../components/games/FirewallRulesGame')),
  'encryption-challenge': React.lazy(() => import('../components/games/EncryptionChallengeGame')),
};
const DefaultLesson = React.lazy(() => import('../components/ui/LessonDetail'));
const StyleLab = import.meta.env.DEV ? React.lazy(() => import('./StyleLab')) : null;

export function ScrollAndFocusManager() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const initial = useRef(true);
  const positions = useRef(new Map());
  useEffect(() => {
    if (initial.current) { initial.current = false; return; }
    const previous = positions.current.get(location.key);
    if (navigationType === 'POP' && previous) window.scrollTo(0, previous);
    else window.scrollTo(0, 0);
    const routeContent = document.querySelector('.route-content');
    const focusTarget = routeContent?.querySelector('[data-route-focus]') || routeContent || document.querySelector('main[data-route-focus], [data-route-focus], main');
    focusTarget?.focus({ preventScroll: true });
  }, [location.key, navigationType]);
  useEffect(() => () => { positions.current.set(location.key, window.scrollY); }, [location.key]);
  return null;
}
function Lazy({ children }) { return <React.Suspense fallback={<div className="loading-container"><LoadingState label="Loading page" /></div>}>{children}</React.Suspense>; }
function Guard({ authenticated }) { return authenticated ? <Outlet /> : <Navigate to="/" replace />; }
function PublicShell({ children }) { return <div data-route-shell="public"><RouteErrorBoundary>{children}</RouteErrorBoundary></div>; }
function FullShell({ shell, overlays }) { const location = useLocation(); return <div className="app-container"><a className="nq-skip-link" href="#route-content">Skip to content</a>{shell.header}<div className="main-layout">{shell.sidebar}<main id="route-content" className="route-content" data-route-focus tabIndex="-1"><RouteErrorBoundary key={location.key}><Outlet /></RouteErrorBoundary></main></div>{overlays}</div>; }
function GameShell({ overlays }) { const location = useLocation(); return <div className="game-shell" data-testid="route-shell-game" data-route-shell="game"><main data-route-focus tabIndex="-1"><RouteErrorBoundary key={location.key}><Outlet /></RouteErrorBoundary></main>{overlays}</div>; }
function LessonShell({ overlays }) { const location = useLocation(); return <div className="lesson-shell" data-testid="route-shell-lesson" data-route-shell="lesson"><main data-route-focus tabIndex="-1"><RouteErrorBoundary key={location.key}><Outlet /></RouteErrorBoundary></main>{overlays}</div>; }

export default function AppRoutes({ authenticated, shell, home, overlays, pages, gameComponents = defaultGames, lessonComponent = DefaultLesson }) {
  return <><ScrollAndFocusManager /><Routes>
    <Route path="/" element={<PublicShell>{pages.landing}</PublicShell>} />
    {import.meta.env.DEV && <Route path="/dev/ui-lab" element={<PublicShell><Lazy><StyleLab /></Lazy></PublicShell>} />}
    <Route path="/dashboard" element={<Guard authenticated={authenticated} />}>
      <Route element={<FullShell shell={shell} overlays={overlays} />}>
        <Route index element={home} />
        <Route path="settings" element={pages.settings} />
        <Route path="learning-paths" element={pages.learningPaths} />
        <Route path="achievements" element={pages.achievements} />
        <Route path="stats" element={pages.stats} />
      </Route>
      <Route element={<GameShell overlays={overlays} />}>
        {Object.entries(gameComponents).map(([path, Component]) => <Route key={path} path={path} element={<Lazy><Component /></Lazy>} />)}
      </Route>
      <Route element={<LessonShell overlays={overlays} />}><Route path="learning/module/:moduleId/lesson/:lessonId" element={<Lazy>{React.createElement(lessonComponent)}</Lazy>} /></Route>
    </Route>
    {['protocol','port','subnet','acronym','command','network-topology','firewall-rules','encryption-challenge','settings','learning-paths','achievements','stats'].map(path => <Route key={path} path={`/${path}`} element={<Navigate to={`/dashboard/${path}`} replace />} />)}
    <Route path="*" element={<NotFoundPage />} />
  </Routes></>;
}
