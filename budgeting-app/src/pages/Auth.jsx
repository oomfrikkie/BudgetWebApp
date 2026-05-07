import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { IconWallet } from '../components/Icons';

export default function Auth() {
  const { login, beginRegistration, authError } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const validateLogin = () => {
    const e = {};
    if (!form.email.includes('@')) e.email = 'Enter a valid email';
    if (form.password.length < 1) e.password = 'Password is required';
    return e;
  }; 

  const validateRegister = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.includes('@')) e.email = 'Enter a valid email';
    if (form.password.length < 6) e.password = 'Min 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = tab === 'login' ? validateLogin() : validateRegister();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    if (tab === 'login') {
      setSubmitting(true);
      const ok = await login({ email: form.email, password: form.password });
      setSubmitting(false);
      if (ok) navigate('/dashboard');
    } else {
      beginRegistration({ name: form.name, email: form.email, password: form.password });
      navigate('/onboarding');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">
            <IconWallet size={20} />
          </div>
          <span className="logo-text">Vault</span>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === 'login' ? 'auth-tab--active' : ''}`}
            onClick={() => { setTab('login'); setErrors({}); }}
          >
            Log in
          </button>
          <button
            className={`auth-tab ${tab === 'register' ? 'auth-tab--active' : ''}`}
            onClick={() => { setTab('register'); setErrors({}); }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {tab === 'register' && (
            <div className="form-field">
              <label className="form-label">Full name</label>
              <input
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                type="text"
                placeholder="Alex Johnson"
                value={form.name}
                onChange={set('name')}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>
          )}

          <div className="form-field">
            <label className="form-label">Email</label>
            <input
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-field">
            <label className="form-label">Password</label>
            <input
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              type="password"
              placeholder={tab === 'register' ? 'Min 6 characters' : '••••••••'}
              value={form.password}
              onChange={set('password')}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {tab === 'register' && (
            <div className="form-field">
              <label className="form-label">Confirm password</label>
              <input
                className={`form-input ${errors.confirm ? 'input-error' : ''}`}
                type="password"
                placeholder="••••••••"
                value={form.confirm}
                onChange={set('confirm')}
              />
              {errors.confirm && <span className="field-error">{errors.confirm}</span>}
            </div>
          )}

          {authError && <p className="field-error" style={{ textAlign: 'center' }}>{authError}</p>}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            style={{ marginTop: 8 }}
            disabled={submitting}
          >
            {submitting ? 'Please wait…' : tab === 'login' ? 'Log in' : 'Continue'}
          </button>
        </form>

      </div>
    </div>
  );
}
