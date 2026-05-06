import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { IconWallet, IconCheck } from '../components/Icons';

export default function Onboarding() {
  const { completeOnboarding } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState('monthly'); // 'monthly' | 'hourly'
  const [monthly, setMonthly] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState('40');
  const [error, setError] = useState('');

  const calculated = mode === 'hourly'
    ? (parseFloat(hourlyRate) || 0) * (parseFloat(hoursPerWeek) || 0) * 4.33
    : null;

  const finalSalary = mode === 'monthly'
    ? parseFloat(monthly)
    : calculated;

  const handleNext = () => {
    if (step === 0) { setStep(1); return; }
    if (step === 1) {
      if (!finalSalary || finalSalary <= 0) {
        setError('Please enter a valid salary');
        return;
      }
      setError('');
      setStep(2);
    }
  };

  const handleFinish = () => {
    completeOnboarding({
      estimatedSalary: Math.round(finalSalary),
      hourlyRate: mode === 'hourly' ? parseFloat(hourlyRate) : undefined,
      hoursPerWeek: mode === 'hourly' ? parseFloat(hoursPerWeek) : undefined,
    });
    navigate('/auth');
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        {/* Step dots */}
        <div className="step-dots">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`step-dot ${i === step ? 'step-dot--active' : i < step ? 'step-dot--done' : ''}`} />
          ))}
        </div>

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
            <button className="btn btn-primary btn-full" onClick={handleNext}>
              Get started
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="onboarding-step">
            <h2 className="onboarding-title">Set your salary</h2>
            <p className="onboarding-sub">
              Your estimated monthly salary helps us track how your actual income compares.
            </p>

            {/* Mode toggle */}
            <div className="mode-toggle">
              <button
                className={`mode-btn ${mode === 'monthly' ? 'mode-btn--active' : ''}`}
                onClick={() => { setMode('monthly'); setError(''); }}
              >
                Monthly
              </button>
              <button
                className={`mode-btn ${mode === 'hourly' ? 'mode-btn--active' : ''}`}
                onClick={() => { setMode('hourly'); setError(''); }}
              >
                Hourly rate
              </button>
            </div>

            {mode === 'monthly' ? (
              <div className="form-field">
                <label className="form-label">Estimated monthly salary</label>
                <div className="input-prefix-wrap">
                  <span className="input-prefix">€</span>
                  <input
                    className={`form-input input-with-prefix ${error ? 'input-error' : ''}`}
                    type="number"
                    min="1"
                    placeholder="2800"
                    value={monthly}
                    onChange={(e) => { setMonthly(e.target.value); setError(''); }}
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
                        onChange={(e) => { setHourlyRate(e.target.value); setError(''); }}
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
                      onChange={(e) => { setHoursPerWeek(e.target.value); setError(''); }}
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

            {error && <p className="field-error">{error}</p>}

            <button className="btn btn-primary btn-full" onClick={handleNext} style={{ marginTop: 8 }}>
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding-step">
            <div className="onboarding-icon onboarding-icon--success">
              <IconCheck size={32} />
            </div>
            <h2 className="onboarding-title">You're all set</h2>
            <p className="onboarding-sub">Your estimated monthly salary is set to</p>
            <div className="salary-display">€{Math.round(finalSalary || 0).toLocaleString()}</div>
            <p className="onboarding-sub" style={{ fontSize: '0.8rem', marginTop: 8 }}>
              You can always update this in Settings.
            </p>
            <button className="btn btn-primary btn-full" onClick={handleFinish} style={{ marginTop: 24 }}>
              Create account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
