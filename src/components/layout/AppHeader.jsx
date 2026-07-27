import React, { useState } from 'react';
import { FiLogOut, FiMenu, FiMoon, FiSun, FiVolume2, FiVolumeX, FiX } from 'react-icons/fi';
import logo from '../../assets/images/netquest.png';
import SoundManager from '../../utils/SoundManager';
import { Button, IconButton } from '../foundations/Primitives';

export default function AppHeader({ user, isGuest, logout, menuOpen = false, onToggleMenu, menuButtonRef, resolvedTheme = 'dark', onToggleTheme }) {
  const [soundEnabled, setSoundEnabled] = useState(() => SoundManager.isSoundEnabled());
  const toggleSound = () => setSoundEnabled(SoundManager.toggleSound());
  const storedAvatar = localStorage.getItem('net-study-settings-avatar');
  const avatar = isGuest
    ? (storedAvatar ? `/avatars/${storedAvatar}` : 'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png')
    : (user?.avatar ? `/avatars/${user.avatar}` : storedAvatar ? `/avatars/${storedAvatar}` : 'https://www.pngkey.com/png/full/159-1593637_photo-angry-face-meme.png');

  return <header className="nq-app-header">
    <div className="nq-app-header__brand-group">
      <IconButton ref={menuButtonRef} className="nq-app-header__menu" label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} aria-controls="primary-sidebar" onClick={onToggleMenu}>{menuOpen ? <FiX /> : <FiMenu />}</IconButton>
      <a className="nq-app-brand" href="/" aria-label="NetQuest home"><img src={logo} alt="" /><span>NetQuest</span></a>
    </div>
    <div className="nq-app-header__utilities" aria-label="Account and application controls">
      <IconButton label={`Use ${resolvedTheme === 'dark' ? 'light' : 'dark'} theme`} onClick={onToggleTheme}>{resolvedTheme === 'dark' ? <FiSun /> : <FiMoon />}</IconButton>
      <IconButton label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'} aria-pressed={!soundEnabled} onClick={toggleSound}>{soundEnabled ? <FiVolume2 /> : <FiVolumeX />}</IconButton>
      {isGuest && <div className="nq-app-header__session"><span>Guest mode</span><a href="/">Sign in to save progress</a></div>}
      <img className="nq-app-header__avatar" src={avatar} alt="User Avatar" />
      {user && !isGuest && <Button size="sm" variant="secondary" onClick={logout}><FiLogOut aria-hidden="true" /> Logout</Button>}
    </div>
  </header>;
}
