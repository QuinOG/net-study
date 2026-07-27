import React, { useContext, useState } from 'react';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from '../../router';
import { Button, Dialog, Field, Notice } from '../foundations/Primitives';
import '../../styles/ui/LoginSignup.css';

export default function LoginSignup({ open = true, onClose }) {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({ username: '', email: '', password: '', displayName: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login, register } = useContext(UserContext);
  const navigate = useNavigate();
  const isLogin = mode === 'login';
  const update = event => { setFormData(data => ({ ...data, [event.target.name]: event.target.value })); setErrors(value => ({ ...value, [event.target.name]: '' })); };
  const changeMode = next => { setMode(next); setErrors({}); };
  const submit = async event => {
    event.preventDefault(); const next = {};
    if (!isLogin && !formData.username.trim()) next.username = 'Enter a username.';
    if (!formData.email.trim()) next.email = 'Enter your email.'; else if (!/^\S+@\S+\.\S+$/.test(formData.email)) next.email = 'Enter a valid email address.';
    if (!formData.password) next.password = 'Enter your password.'; else if (formData.password.length < 8) next.password = 'Use at least 8 characters.';
    if (!isLogin && !formData.displayName.trim()) next.displayName = 'Enter a display name.';
    if (Object.keys(next).length) { setErrors(next); return; }
    setLoading(true);
    try { if (isLogin) await login(formData.email, formData.password); else await register(formData); onClose?.(); navigate('/dashboard'); }
    catch (error) { setErrors({ form: error.response?.data?.message || (isLogin ? 'Sign in failed. Check your details and try again.' : 'Account creation failed. Try again.') }); }
    finally { setLoading(false); }
  };
  return <Dialog open={open} onClose={onClose} title={isLogin ? 'Welcome back' : 'Create your NetQuest account'} description={isLogin ? 'Sign in to continue your saved learning journey.' : 'Save progress, streaks, and achievements across devices.'}>
    <div className="nq-auth-tabs" role="tablist" aria-label="Account action"><button type="button" role="tab" aria-selected={isLogin} onClick={() => changeMode('login')}>Sign in</button><button type="button" role="tab" aria-selected={!isLogin} onClick={() => changeMode('signup')}>Create account</button></div>
    {errors.form && <Notice tone="danger" title="Unable to continue">{errors.form}</Notice>}
    <form className="nq-auth-form" onSubmit={submit} noValidate>
      {!isLogin && <><Field label="Username" name="username" autoComplete="username" value={formData.username} onChange={update} error={errors.username} disabled={loading} /><Field label="Display name" name="displayName" autoComplete="name" value={formData.displayName} onChange={update} hint="This is the name other learners will see." error={errors.displayName} disabled={loading} /></>}
      <Field label="Email address" name="email" type="email" autoComplete="email" value={formData.email} onChange={update} error={errors.email} disabled={loading} />
      <Field label="Password" name="password" type="password" autoComplete={isLogin ? 'current-password' : 'new-password'} value={formData.password} onChange={update} hint="At least 8 characters." error={errors.password} disabled={loading} />
      <Button type="submit" size="lg" loading={loading}>{isLogin ? 'Sign in' : 'Create account'}</Button>
    </form>
    <p className="nq-auth-guest">Want to look around first? <a href="/dashboard?mode=guest">Continue as guest</a>.</p>
  </Dialog>;
}
