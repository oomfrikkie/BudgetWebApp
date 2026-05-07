import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/categories';
import { IconWallet, IconCheck, IconPlus, IconTrash } from '../components/Icons';

const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export default function Onboarding() {
  const { register, authError } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Step 1 — Salary
  const [mode, setMode] = useState('monthly');
  const [monthly, setMonthly] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState('40');
  const [salaryError, setSalaryError] = useState('');

  // Step 2 — Extra income schedules
  const [schedules, setSchedules] = useState([]);
  const [schedLabel, setSchedLabel] = useState('');
  const [schedAmount, setSchedAmount] = useState('');
  const [schedDay, setSchedDay] = useState('');
  const [schedError, setSchedError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Step 3 — Budgets
  const [budgetInputs, setBudgetInputs] = useState(
    Object.fromEntries(CATEGORIES.map((c) => [c.id, ''])),
  );

  const calculated =
    mode === 'hourly'
      ? (parseFloat(hourlyRate) || 0) * (parseFloat(hoursPerWeek) || 0) * 4.33
      : null;

  const finalSalary = mode === 'monthly' ? parseFloat(monthly) : calculated;

  const handleSalaryNext = () => {
    if (!finalSalary || finalSalary <= 0) {
      setSalaryError('Please enter a valid salary');
      return;
    }
    setSalaryError('');
    setStep(2);
  };

  const addSchedule = () => {
    const amt = parseFloat(schedAmount);
    const d = parseInt(schedDay, 10);
    if (!schedLabel.trim()) { setSchedError('Label is required'); return; }
    if (!amt || amt <= 0) { setSchedError('Enter a valid amount'); return; }
    if (!d || d < 1 || d > 31) { setSchedError('Day must be 1–31'); return; }
    setSchedules((prev) => [...prev, { label: schedLabel.trim(), amount: amt, dayOfMonth: d }]);
    setSchedLabel(''); setSchedAmount(''); setSchedDay('');
    setSchedError('');
  };

  const removeSchedule = (idx) => setSchedules((prev) => prev.filter((_, i) => i !== idx));

  const onSchedKey = (e) => { if (e.key === 'Enter') addSchedule(); };

  const handleFinish = async () => {
    const salary = {
      estimatedSalary: Math.round(finalSalary || 0),
      ...(mode === 'hourly' && {
        hourlyRate: parseFloat(hourlyRate),
        hoursPerWeek: parseFloat(hoursPerWeek),
      }),
    };
    const budgets = Object.fromEntries(
      Object.entries(budgetInputs)
        .filter(([, v]) => parseFloat(v) > 0)
        .map(([k, v]) => [k, parseFloat(v)]),
    );
    setSubmitting(true);
    const ok = await register({ salary, schedules, budgets });
    setSubmitting(false);
    if (ok) navigate('/dashboard');
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        <div className="step-dots">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`step-dot ${i === step ? 'step-dot--active' : i < step ? 'step-dot--done' : ''}`}
            />
          ))}
        </div>

        {/* Step 0 — Welcome */}
        {step === 0 && (
          <div className="onboarding-step">
            <div className="onboarding-icon">
              <IconWallet size={32} />
            </div>
            <h1 className="onboarding-title">Welcome to Vault</h1>
            <p className="onboarding-sub">
              Take control of your finances. Track income, manage expenses, and hit your budget goals.
            </p>
            <ul className="feature-list">
              <li><IconCheck size={16} /><span>Track income &amp; expenses</span></li>
              <li><IconCheck size={16} /><span>Set budgets per category</span></li>
              <li><IconCheck size={16} /><span>See where your money goes</span></li>
            </ul>
            <button className="btn btn-primary btn-full" onClick={() => setStep(1)}>
              Get started
            </button>
          </div>
        )}

        {/* Step 1 — Salary */}
        {step === 1 && (
          <div className="onboarding-step">
            <h2 className="onboarding-title">Set your salary</h2>
            <p className="onboarding-sub">
              Your estimated monthly salary helps us track how your actual income compares.
            </p>

            <div className="mode-toggle">
              <button
                className={`mode-btn ${mode === 'monthly' ? 'mode-btn--active' : ''}`}
                onClick={() => { setMode('monthly'); setSalaryError(''); }}
              >Monthly</button>
              <button
                className={`mode-btn ${mode === 'hourly' ? 'mode-btn--active' : ''}`}
                onClick={() => { setMode('hourly'); setSalaryError(''); }}
              >Hourly rate</button>
            </div>

            {mode === 'monthly' ? (
              <div className="form-field">
                <label className="form-label">Estimated monthly salary</label>
                <div className="input-prefix-wrap">
                  <span className="input-prefix">€</span>
                  <input
                    className={`form-input input-with-prefix ${salaryError ? 'input-error' : ''}`}
                    type="number"
                    min="1"
                    placeholder="2800"
                    value={monthly}
                    onChange={(e) => { setMonthly(e.target.value); setSalaryError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSalaryNext()}
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
                        placeholder="17.50"
                        value={hourlyRate}
                        onChange={(e) => { setHourlyRate(e.target.value); setSalaryError(''); }}
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
                      placeholder="40"
                      value={hoursPerWeek}
                      onChange={(e) => { setHoursPerWeek(e.target.value); setSalaryError(''); }}
                    />
                  </div>
                </div>
                {calculated > 0 && (
                  <div className="calc-preview">
                    <span className="calc-label">Estimated monthly</span>
                    <span className="calc-value">€{Math.round(calculated).toLocaleString()}</span>
                  </div>
                )}
              </>
            )}

            {salaryError && <p className="field-error">{salaryError}</p>}
            <button className="btn btn-primary btn-full" onClick={handleSalaryNext} style={{ marginTop: 8 }}>
              Continue
            </button>
          </div>
        )}

        {/* Step 2 — Extra income */}
        {step === 2 && (
          <div className="onboarding-step">
            <h2 className="onboarding-title">Any extra income?</h2>
            <p className="onboarding-sub">
              Add recurring sources like a grant or freelance work. We'll use these to show what you have available day-by-day vs. at month-end.
            </p>

            {schedules.length > 0 && (
              <div className="schedule-list">
                {schedules.map((s, i) => (
                  <div key={i} className="schedule-row">
                    <span className="schedule-dot" />
                    <span className="schedule-label">{s.label}</span>
                    <span className="schedule-day text-muted">on the {ordinal(s.dayOfMonth)}</span>
                    <span className="schedule-amount">€{s.amount.toLocaleString()}</span>
                    <button
                      className="icon-btn icon-btn--danger"
                      onClick={() => removeSchedule(i)}
                      aria-label="Remove"
                    >
                      <IconTrash size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="schedule-add-form">
              <div className="form-field">
                <label className="form-label">Label</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. Grant, Freelance"
                  value={schedLabel}
                  onChange={(e) => { setSchedLabel(e.target.value); setSchedError(''); }}
                  onKeyDown={onSchedKey}
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
                      value={schedAmount}
                      onChange={(e) => { setSchedAmount(e.target.value); setSchedError(''); }}
                      onKeyDown={onSchedKey}
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
                    value={schedDay}
                    onChange={(e) => { setSchedDay(e.target.value); setSchedError(''); }}
                    onKeyDown={onSchedKey}
                  />
                </div>
              </div>
              {schedError && <p className="field-error">{schedError}</p>}
              <button className="btn btn-primary btn-sm" onClick={addSchedule}>
                <IconPlus size={14} /> Add income source
              </button>
            </div>

            <div className="onboarding-actions">
              <button className="btn btn-primary btn-full" onClick={() => setStep(3)}>
                {schedules.length > 0 ? 'Continue' : 'Skip'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Budgets */}
        {step === 3 && (
          <div className="onboarding-step">
            <h2 className="onboarding-title">Set your budgets</h2>
            <p className="onboarding-sub">
              Set a monthly limit for each spending category. Leave blank to skip any.
            </p>

            <div className="onboarding-budget-list">
              {CATEGORIES.map((cat) => (
                <div key={cat.id} className="onboarding-budget-row">
                  <span className="onboarding-budget-cat">
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </span>
                  <div className="input-prefix-wrap" style={{ width: 130 }}>
                    <span className="input-prefix">€</span>
                    <input
                      className="form-input input-with-prefix"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={budgetInputs[cat.id]}
                      onChange={(e) =>
                        setBudgetInputs((prev) => ({ ...prev, [cat.id]: e.target.value }))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="onboarding-actions">
              <button className="btn btn-primary btn-full" onClick={() => setStep(4)}>
                Continue
              </button>
              <button className="onboarding-skip" onClick={() => setStep(4)}>
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — All set */}
        {step === 4 && (
          <div className="onboarding-step">
            <div className="onboarding-icon onboarding-icon--success">
              <IconCheck size={32} />
            </div>
            <h2 className="onboarding-title">You're all set</h2>
            <p className="onboarding-sub">Here's a summary of what we've set up for you.</p>

            <div className="onboarding-summary">
              <div className="summary-row">
                <span className="summary-label">Monthly income estimate</span>
                <span className="summary-value">€{Math.round(finalSalary || 0).toLocaleString()}</span>
              </div>
              {schedules.length > 0 && (
                <div className="summary-row">
                  <span className="summary-label">Extra income sources</span>
                  <span className="summary-value">{schedules.length}</span>
                </div>
              )}
              {Object.values(budgetInputs).some((v) => parseFloat(v) > 0) && (
                <div className="summary-row">
                  <span className="summary-label">Budget categories set</span>
                  <span className="summary-value">
                    {Object.values(budgetInputs).filter((v) => parseFloat(v) > 0).length}
                  </span>
                </div>
              )}
            </div>

            <p className="onboarding-sub" style={{ fontSize: '0.8rem' }}>
              You can always update these in Settings.
            </p>
            {authError && <p className="field-error" style={{ textAlign: 'center' }}>{authError}</p>}
            <button className="btn btn-primary btn-full" onClick={handleFinish} disabled={submitting} style={{ marginTop: 8 }}>
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
