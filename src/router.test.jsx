import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, BrowserRouter, Link, useLocation, useNavigate } from 'react-router-dom';
import { vi } from 'vitest';
import App, { Header } from './App';
import AppRoutes from './routes/AppRoutes';
import { UserContext } from './context/UserContext';

const mockComponent = (name) => function MockRoute() { return <div data-testid={`content-${name}`}>{name} content</div>; };
vi.mock('./components/games/ProtocolGame', () => ({ default: mockComponent('protocol') }));
vi.mock('./components/games/PortGame', () => ({ default: mockComponent('port') }));
vi.mock('./components/games/SubnettingChallenge', () => ({ default: mockComponent('subnet') }));
vi.mock('./components/games/TechAcronymQuiz', () => ({ default: mockComponent('acronym') }));
vi.mock('./components/games/CommandLineChallenge', () => ({ default: mockComponent('command') }));
vi.mock('./components/games/NetworkTopologyGame', () => ({ default: mockComponent('network-topology') }));
vi.mock('./components/games/FirewallRulesGame', () => ({ default: mockComponent('firewall-rules') }));
vi.mock('./components/games/EncryptionChallengeGame', () => ({ default: mockComponent('encryption-challenge') }));
vi.mock('./components/ui/LessonDetail', () => ({ default: mockComponent('lesson') }));

function LocationProbe() { return <output data-testid="location">{useLocation().pathname}</output>; }
const pages = { landing:<div data-testid="content-landing">Landing content</div>, settings:<div data-testid="content-settings">Settings content</div>, learningPaths:<div data-testid="content-learning-paths">Learning paths content</div>, achievements:<div data-testid="content-achievements">Achievements content</div>, stats:<div data-testid="content-stats">Stats content</div> };
function production(path, props = {}) { return <MemoryRouter initialEntries={[path]}><LocationProbe /><AppRoutes authenticated shell={{ header:<header data-testid="header">Header</header>, sidebar:<aside data-testid="sidebar">Sidebar</aside> }} home={<div data-testid="content-dashboard">Dashboard content</div>} overlays={<div data-testid="overlay">Overlay</div>} pages={pages} {...props} /></MemoryRouter>; }

const appPaths = [
  ['/dashboard','dashboard','full'], ['/dashboard/protocol','protocol','game'], ['/dashboard/port','port','game'], ['/dashboard/subnet','subnet','game'], ['/dashboard/acronym','acronym','game'], ['/dashboard/command','command','game'], ['/dashboard/network-topology','network-topology','game'], ['/dashboard/firewall-rules','firewall-rules','game'], ['/dashboard/encryption-challenge','encryption-challenge','game'], ['/dashboard/settings','settings','full'], ['/dashboard/learning-paths','learning-paths','full'], ['/dashboard/learning/module/networking/lesson/intro','lesson','lesson'], ['/dashboard/achievements','achievements','full'], ['/dashboard/stats','stats','full'],
];

describe('production routing configuration', () => {
  beforeEach(() => { Object.defineProperty(window, 'scrollTo', { configurable:true, writable:true, value:vi.fn() }); });
  test.each(appPaths)('%s resolves to production content and shell type', async (path, content, shell) => {
    render(production(path));
    await waitFor(() => expect(screen.getByTestId(`content-${content}`)).toBeInTheDocument());
    expect(screen.getByTestId('location')).toHaveTextContent(path);
    if (shell === 'full') { expect(screen.getByTestId('header')).toBeInTheDocument(); expect(screen.getByTestId('sidebar')).toBeInTheDocument(); }
    else { expect(screen.queryByTestId('header')).not.toBeInTheDocument(); expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument(); expect(screen.getByTestId(`route-shell-${shell}`)).toBeInTheDocument(); }
    if (shell === 'game' || shell === 'lesson') expect(screen.getByTestId('overlay')).toBeInTheDocument();
  });

  const redirects = [['/protocol','/dashboard/protocol','protocol'],['/port','/dashboard/port','port'],['/subnet','/dashboard/subnet','subnet'],['/acronym','/dashboard/acronym','acronym'],['/command','/dashboard/command','command'],['/network-topology','/dashboard/network-topology','network-topology'],['/firewall-rules','/dashboard/firewall-rules','firewall-rules'],['/encryption-challenge','/dashboard/encryption-challenge','encryption-challenge'],['/settings','/dashboard/settings','settings'],['/learning-paths','/dashboard/learning-paths','learning-paths'],['/achievements','/dashboard/achievements','achievements'],['/stats','/dashboard/stats','stats']];
  test.each(redirects)('%s redirects to exact production destination', async (from, to, content) => { render(production(from)); await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent(to)); expect(screen.getByTestId(`content-${content}`)).toBeInTheDocument(); });

  test('unauthenticated dashboard redirects to public content', async () => { render(production('/dashboard', { authenticated:false })); await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/')); expect(screen.getByTestId('content-landing')).toBeInTheDocument(); });
  test('unknown production path shows recovery', () => { render(production('/unknown')); expect(screen.getByRole('heading', { name:/page not found/i })).toBeInTheDocument(); expect(screen.getByRole('link', { name:/return home/i })).toBeInTheDocument(); });

  test('guest entry settles on concrete usable UI', async () => { localStorage.clear(); window.history.replaceState({}, '', '/?mode=guest'); render(<App />); await waitFor(() => expect(window.location.search).toBe('')); await waitFor(() => expect(screen.getByRole('heading', { name:/welcome back, guest user/i })).toBeInTheDocument()); expect(screen.getByRole('button', { name:/continue to dashboard/i })).toBeInTheDocument(); });

  test('production retry recovers a route in place and hides thrown detail', async () => { let shouldThrow = true; function Flaky() { if (shouldThrow) throw new Error('hidden route detail'); return <div>Recovered route</div>; } const { rerender } = render(production('/dashboard/stats', { pages:{ ...pages, stats:<Flaky /> } })); expect(screen.getByRole('heading', { name:/could not load this page/i })).toBeInTheDocument(); expect(screen.queryByText('hidden route detail')).not.toBeInTheDocument(); shouldThrow = false; fireEvent.click(screen.getByRole('button', { name:/try again/i })); expect(await screen.findByText('Recovered route')).toBeInTheDocument(); rerender(production('/dashboard/stats', { pages:{ ...pages, stats:<div>Safe route</div> } })); expect(screen.getByText('Safe route')).toBeInTheDocument(); });

  function NavigationFixture() { const navigate = useNavigate(); return <><button onClick={() => navigate('/dashboard/settings')}>Push settings</button><button onClick={() => navigate(-1)}>Back</button></>; }
  test('production manager does not scroll/focus initially, handles PUSH, and restores POP position', async () => { const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {}); Object.defineProperty(window, 'scrollY', { configurable:true, writable:true, value:0 }); render(<MemoryRouter initialEntries={['/dashboard']}><LocationProbe /><NavigationFixture /><AppRoutes authenticated shell={{header:null,sidebar:null}} home={<div data-route-focus data-testid="dashboard-focus" tabIndex="-1">Dashboard</div>} overlays={null} pages={{...pages, settings:<div data-route-focus data-testid="settings-focus" tabIndex="-1">Settings</div>}} /></MemoryRouter>); expect(scroll).not.toHaveBeenCalled(); expect(document.activeElement).not.toHaveAttribute('data-route-focus'); window.scrollY=120; fireEvent.click(screen.getByRole('button',{name:'Push settings'})); await waitFor(() => expect(screen.getByTestId('settings-focus')).toHaveFocus()); expect(scroll).toHaveBeenLastCalledWith(0,0); window.scrollY=240; fireEvent.click(screen.getByRole('button',{name:'Back'})); await waitFor(() => expect(screen.getByTestId('dashboard-focus')).toHaveFocus()); expect(scroll).toHaveBeenLastCalledWith(0,120); scroll.mockRestore(); });

  test('real Header preserves authenticated and guest avatar precedence', () => { const cases = [[{avatar:'user.png'},'stored.png','/avatars/user.png'],[{id:'u'},'stored.png','/avatars/stored.png'],[{id:'u'},null,'https://www.pngkey.com/png/full/159-1593637_photo-angry-face-meme.png'],[{isGuest:true},null,'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png']]; for (const [user, stored, expected] of cases) { localStorage.clear(); if (stored) localStorage.setItem('net-study-settings-avatar',stored); const { unmount } = render(<BrowserRouter><UserContext.Provider value={{user,isGuest:!!user.isGuest,logout:vi.fn()}}><Header /></UserContext.Provider></BrowserRouter>); expect(screen.getByRole('img',{name:'User Avatar'})).toHaveAttribute('src',expected); unmount(); } });
});
