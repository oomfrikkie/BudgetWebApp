import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { IconLogout, IconCheck } from '../components/Icons';

const fmt = (n) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

function Section({ title, children }) {
  return (
    <div className="settings-section">
      <h2 className="settings-section-title">{title}</h2>
      <div className="card">{children}</div>
    </div>
  );
}

function SaveRow({ onSave, saved }) {
  return (
    <div className="settings-save-row">
      <button className="btn btn-primary btn-sm" onClick={onSave}>
        {saved ? <><IconCheck size={14} /> Saved</> : 'Save changes'}
      </button>
    </div>
  );
}

export default function Settings() {
  const { user, settings, logout, updateSettings } = useApp();
  const navigate = useNavigate();

  // Profile
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Salary
  const [salaryMode, setSalaryMode] = useState('monthly');
  const [monthly, setMonthly] = useState(String(settings.estimatedSalary));
  const [hourlyRate, setHourlyRate] = useState(String(settings.hourlyRate || 17.5));
  const [hoursPerWeek, setHoursPerWeek] = useState(String(settings.hoursPerWeek || 40));
  const [salarySaved, setSalarySaved] = useState(false);

  const calculated =
    salaryMode === 'hourly'
      ? (parseFloat(hourlyRate) || 0) * (parseFloat(hoursPerWeek) || 0) * 4.33
      : null;

  const saveProfile = () => {
    updateSettings({ name, email });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const saveSalary = () => {
    const sal =
      salaryMode === 'monthly' ? parseFloat(monthly) : Math.round(calculated);
    if (!sal || sal <= 0) return;
    updateSettings({
      estimatedSalary: sal,
      ...(salaryMode === 'hourly' && {
        hourlyRate: parseFloat(hourlyRate),
        hoursPerWeek: parseFloat(hoursPerWeek),
      }),
    });
    setSalarySaved(true);
    setTimeout(() => setSalarySaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Manage your account and preferences</p>
        </div>
      </div>

      <Section title="Profile">
        <div className="settings-fields">
          <div className="form-field">
            <label className="form-label">Full name</label>
            <input
              className="form-input"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setProfileSaved(false); }}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setProfileSaved(false); }}
            />
          </div>
          <SaveRow onSave={saveProfile} saved={profileSaved} />
        </div>
      </Section>

      <Section title="Estimated Salary">
        <div className="settings-fields">
          <p className="settings-hint">
            Current estimate: <strong>{fmt(settings.estimatedSalary)}/month</strong>
          </p>

          <div className="mode-toggle" style={{ marginBottom: 16 }}>
            <button
              className={`mode-btn ${salaryMode === 'monthly' ? 'mode-btn--active' : ''}`}
              onClick={() => { setSalaryMode('monthly'); setSalarySaved(false); }}
            >
              Monthly
            </button>
            <button
              className={`mode-btn ${salaryMode === 'hourly' ? 'mode-btn--active' : ''}`}
              onClick={() => { setSalaryMode('hourly'); setSalarySaved(false); }}
            >
              Hourly rate
            </button>
          </div>

          {salaryMode === 'monthly' ? (
            <div className="form-field">
              <label className="form-label">Monthly salary</label>
              <div className="input-prefix-wrap">
                <span className="input-prefix">€</span>
                <input
                  className="form-input input-with-prefix"
                  type="number"
                  min="1"
                  value={monthly}
                  onChange={(e) => { setMonthly(e.target.value); setSalarySaved(false); }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Hourly rate</label>
                  <div className="input-prefix-wrap">
                    <span className="input-prefix">€</span>
                    <input
                      className="form-input input-with-prefix"
                      type="number"
                      min="1"
                      step="0.5"
                      value={hourlyRate}
                      onChange={(e) => { setHourlyRate(e.target.value); setSalarySaved(false); }}
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label className="form-label">Hours / week</label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    max="80"
                    value={hoursPerWeek}
                    onChange={(e) => { setHoursPerWeek(e.target.value); setSalarySaved(false); }}
                  />
                </div>
              </div>
              {calculated > 0 && (
                <div className="calc-preview">
                  <span className="calc-label">Estimated monthly</span>
                  <span className="calc-value">{fmt(Math.round(calculated))}</span>
                </div>
              )}
            </>
          )}

          <SaveRow onSave={saveSalary} saved={salarySaved} />
        </div>
      </Section>

      <Section title="Account">
        <div className="settings-fields">
          <button className="btn btn-danger" onClick={handleLogout}>
            <IconLogout size={16} />
            Log out
          </button>
        </div>
      </Section>
    </div>
  );
}
