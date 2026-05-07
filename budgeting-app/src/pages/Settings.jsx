import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { IconLogout, IconCheck, IconTrash, IconPlus } from '../components/Icons';

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

function SaveRow({ onSave, saved, saving }) {
  return (
    <div className="settings-save-row">
      <button className="btn btn-primary btn-sm" onClick={onSave} disabled={saving}>
        {saved ? <><IconCheck size={14} /> Saved</> : saving ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  );
}

const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const fmtAmount = (n) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

function IncomeScheduleManager() {
  const { incomeSchedules, addIncomeSchedule, removeIncomeSchedule } = useApp();
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [day, setDay] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async () => {
    const amt = parseFloat(amount);
    const d = parseInt(day, 10);
    if (!label.trim()) { setError('Label is required'); return; }
    if (!amt || amt <= 0) { setError('Enter a valid amount'); return; }
    if (!d || d < 1 || d > 31) { setError('Day must be between 1 and 31'); return; }
    setError('');
    setAdding(true);
    try {
      await addIncomeSchedule({ label: label.trim(), amount: amt, dayOfMonth: d });
      setLabel(''); setAmount(''); setDay('');
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const onKey = (e) => { if (e.key === 'Enter') handleAdd(); };

  return (
    <div className="settings-fields">
      <p className="settings-hint">
        Add each recurring income source with the day of the month it arrives. The dashboard uses this to show what you actually have available right now vs. what you'll have by month-end.
      </p>

      {incomeSchedules.length > 0 && (
        <div className="schedule-list">
          {incomeSchedules.map((s) => (
            <div key={s.id} className="schedule-row">
              <span className="schedule-dot" />
              <span className="schedule-label">{s.label}</span>
              <span className="schedule-day text-muted">on the {ordinal(s.dayOfMonth)}</span>
              <span className="schedule-amount">{fmtAmount(s.amount)}</span>
              <button
                className="icon-btn icon-btn--danger"
                onClick={() => removeIncomeSchedule(s.id)}
                aria-label="Remove"
              >
                <IconTrash size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {incomeSchedules.length === 0 && (
        <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 12 }}>
          No income sources yet. Add one below.
        </p>
      )}

      <div className="schedule-add-form">
        <div className="form-field">
          <label className="form-label">Label</label>
          <input
            className="form-input"
            type="text"
            placeholder="e.g. Salary, Grant, Freelance"
            value={label}
            onChange={(e) => { setLabel(e.target.value); setError(''); }}
            onKeyDown={onKey}
          />
        </div>
        <div className="schedule-add-row-inputs">
          <div className="form-field">
            <label className="form-label">Amount</label>
            <div className="input-prefix-wrap">
              <span className="input-prefix">€</span>
              <input
                className="form-input input-with-prefix"
                type="number"
                min="1"
                placeholder="0"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(''); }}
                onKeyDown={onKey}
              />
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Day of month</label>
            <input
              className="form-input"
              type="number"
              min="1"
              max="31"
              placeholder="1–31"
              value={day}
              onChange={(e) => { setDay(e.target.value); setError(''); }}
              onKeyDown={onKey}
            />
          </div>
        </div>
        {error && <p className="field-error">{error}</p>}
        <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={adding}>
          <IconPlus size={14} />
          {adding ? 'Adding…' : 'Add income source'}
        </button>
      </div>
    </div>
  );
}

export default function Settings() {
  const { user, settings, logout, updateSettings } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  const [salaryMode, setSalaryMode] = useState('monthly');
  const [monthly, setMonthly] = useState(String(settings.estimatedSalary));
  const [hourlyRate, setHourlyRate] = useState(String(settings.hourlyRate || 17.5));
  const [hoursPerWeek, setHoursPerWeek] = useState(String(settings.hoursPerWeek || 40));
  const [salarySaved, setSalarySaved] = useState(false);
  const [salarySaving, setSalarySaving] = useState(false);

  const calculated =
    salaryMode === 'hourly'
      ? (parseFloat(hourlyRate) || 0) * (parseFloat(hoursPerWeek) || 0) * 4.33
      : null;

  const saveProfile = async () => {
    setProfileSaving(true);
    try {
      await updateSettings({ name, email });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } finally {
      setProfileSaving(false);
    }
  };

  const saveSalary = async () => {
    const sal = salaryMode === 'monthly' ? parseFloat(monthly) : Math.round(calculated);
    if (!sal || sal <= 0) return;
    setSalarySaving(true);
    try {
      await updateSettings({
        estimatedSalary: sal,
        ...(salaryMode === 'hourly' && {
          hourlyRate: parseFloat(hourlyRate),
          hoursPerWeek: parseFloat(hoursPerWeek),
        }),
      });
      setSalarySaved(true);
      setTimeout(() => setSalarySaved(false), 2000);
    } finally {
      setSalarySaving(false);
    }
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
          <SaveRow onSave={saveProfile} saved={profileSaved} saving={profileSaving} />
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

          <SaveRow onSave={saveSalary} saved={salarySaved} saving={salarySaving} />
        </div>
      </Section>

      <Section title="Income Schedule">
        <IncomeScheduleManager />
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
