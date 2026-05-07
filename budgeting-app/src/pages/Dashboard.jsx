import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, getCategoryById } from '../data/categories';
import { IconArrowUp, IconArrowDown, IconPlus } from '../components/Icons';
import WhatIfModal from '../components/WhatIfModal';

const fmt = (n) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

const fmtSigned = (n) => `${n >= 0 ? '+' : ''}${fmt(n)}`;

function getMonthKey(dateStr) { return dateStr.slice(0, 7); }

function getLastNMonths(n) {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const monthLabel = (key) => MONTH_NAMES[parseInt(key.split('-')[1], 10) - 1];

const ordinal = (n) => {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const currentMonthDisplay = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

export default function Dashboard() {
  const { transactions, budgets, settings, incomeSchedules, openAddModal } = useApp();
  const [showWhatIf, setShowWhatIf] = useState(false);

  const CURRENT_MONTH = new Date().toISOString().slice(0, 7);
  const todayDay = new Date().getDate();

  const currentMonthTxs = useMemo(
    () => transactions.filter((t) => getMonthKey(t.date) === CURRENT_MONTH),
    [transactions, CURRENT_MONTH],
  );

  const totalIncome = useMemo(
    () => currentMonthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [currentMonthTxs],
  );

  const totalExpenses = useMemo(
    () => currentMonthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [currentMonthTxs],
  );

  // ── Income schedule breakdown ───────────────────────────────
  const receivedSchedules = useMemo(
    () => incomeSchedules.filter((s) => s.dayOfMonth <= todayDay),
    [incomeSchedules, todayDay],
  );
  const upcomingSchedules = useMemo(
    () => incomeSchedules.filter((s) => s.dayOfMonth > todayDay),
    [incomeSchedules, todayDay],
  );
  const projectedTotal = incomeSchedules.reduce((s, x) => s + x.amount, 0);
  const projectedRemaining = totalIncome + projectedTotal - totalExpenses;

  // ── Budget progress ─────────────────────────────────────────
  const spentByCategory = useMemo(() => {
    const map = {};
    currentMonthTxs.filter((t) => t.type === 'expense')
      .forEach((t) => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return map;
  }, [currentMonthTxs]);

  // ── Monthly bar chart ───────────────────────────────────────
  const last6Months = getLastNMonths(6);
  const monthlySpend = useMemo(() => last6Months.map((key) => ({
    key,
    total: transactions
      .filter((t) => getMonthKey(t.date) === key && t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0),
  })), [transactions, last6Months]);
  const maxSpend = Math.max(...monthlySpend.map((m) => m.total), 1);

  // ── Recent ──────────────────────────────────────────────────
  const recentTxs = useMemo(
    () => [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [transactions],
  );

  return (
    <>
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">{currentMonthDisplay}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowWhatIf(true)}>
            What if?
          </button>
          <button className="btn btn-primary btn-sm" onClick={openAddModal}>
            <IconPlus size={16} /> Add
          </button>
        </div>
      </div>

      {/* ── Income breakdown card ─────────────────────────────── */}
      {incomeSchedules.length > 0 && (
        <div className="card income-breakdown">
          <h2 className="card-title">Income this month</h2>
          <div className="income-breakdown-body">

            {/* Left col — schedule rows */}
            <div className="income-schedule-rows">
              {receivedSchedules.map((s) => (
                <div key={s.id} className="income-row income-row--received">
                  <span className="income-row-dot income-row-dot--received" />
                  <span className="income-row-label">{s.label}</span>
                  <span className="income-row-day text-muted">{ordinal(s.dayOfMonth)}</span>
                  <span className="income-row-amount">{fmt(s.amount)}</span>
                </div>
              ))}
              {upcomingSchedules.map((s) => (
                <div key={s.id} className="income-row income-row--upcoming">
                  <span className="income-row-dot income-row-dot--upcoming" />
                  <span className="income-row-label">{s.label}</span>
                  <span className="income-row-day text-muted">due {ordinal(s.dayOfMonth)}</span>
                  <span className="income-row-amount text-muted">{fmt(s.amount)}</span>
                </div>
              ))}
              <div className="income-divider" />
              <div className="income-row income-row--total">
                <span className="income-row-label">Month total</span>
                <span className="income-row-amount">{fmt(projectedTotal)}</span>
              </div>
            </div>

            {/* Right col — month-end remaining */}
            <div className="income-remaining-cols">
              <div className="remaining-card">
                <span className="remaining-label">Month-end</span>
                <span className={`remaining-value ${projectedRemaining >= 0 ? 'remaining-value--pos' : 'remaining-value--neg'}`}>
                  {fmt(projectedRemaining)}
                </span>
                <span className="remaining-hint">
                  {upcomingSchedules.length > 0
                    ? `+${fmt(upcomingSchedules.reduce((s, x) => s + x.amount, 0))} still incoming`
                    : 'all income received'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Summary cards ─────────────────────────────────────── */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Actual income</span>
          <span className="stat-value">{fmt(totalIncome)}</span>
          <span className="stat-hint">
            {totalIncome >= settings.estimatedSalary
              ? `${fmt(totalIncome - settings.estimatedSalary)} above estimate`
              : `${fmt(settings.estimatedSalary - totalIncome)} below estimate`}
          </span>
        </div>

        <div className="stat-card stat-card--highlight">
          <span className="stat-label">Remaining balance</span>
          <span className={`stat-value ${totalIncome - totalExpenses >= 0 ? '' : 'stat-value--expense'}`}>
            {fmt(totalIncome - totalExpenses)}
          </span>
          <span className="stat-hint">{fmt(totalExpenses)} spent this month</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Scheduled income</span>
          <span className="stat-value">{fmt(projectedTotal || settings.estimatedSalary)}</span>
          <span className="stat-hint">
            {incomeSchedules.length > 0
              ? `${receivedSchedules.length} of ${incomeSchedules.length} sources received`
              : 'no schedules set'}
          </span>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Monthly bar chart */}
        <div className="card">
          <h2 className="card-title">Monthly spending</h2>
          <div className="bar-chart">
            {monthlySpend.map(({ key, total }) => {
              const pct = (total / maxSpend) * 100;
              const isCurrent = key === CURRENT_MONTH;
              return (
                <div key={key} className="bar-col">
                  <span className="bar-value">{total > 0 ? fmt(total) : '–'}</span>
                  <div className="bar-track">
                    <div
                      className={`bar-fill ${isCurrent ? 'bar-fill--current' : ''}`}
                      style={{ height: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                  <span className={`bar-label ${isCurrent ? 'bar-label--current' : ''}`}>
                    {monthLabel(key)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Budget progress */}
        <div className="card">
          <h2 className="card-title">Budget progress</h2>
          <div className="budget-list">
            {CATEGORIES.map((cat) => {
              const spent = spentByCategory[cat.id] || 0;
              const limit = budgets[cat.id] || 0;
              if (!limit) return null;
              const pct = Math.min((spent / limit) * 100, 100);
              const status = pct >= 90 ? 'danger' : pct >= 70 ? 'warn' : 'ok';
              return (
                <div key={cat.id} className="budget-row">
                  <div className="budget-row-header">
                    <span className="budget-cat">
                      <span className="cat-emoji">{cat.emoji}</span>
                      {cat.label}
                    </span>
                    <span className="budget-amounts">
                      <span className={`budget-spent ${status === 'danger' ? 'text-red' : ''}`}>{fmt(spent)}</span>
                      <span className="budget-sep">/</span>
                      <span className="budget-limit">{fmt(limit)}</span>
                    </span>
                  </div>
                  <div className="progress-track">
                    <div className={`progress-fill progress-fill--${status}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card" style={{ marginTop: 0 }}>
        <div className="card-header">
          <h2 className="card-title">Recent transactions</h2>
        </div>
        <div className="tx-list">
          {recentTxs.map((tx) => {
            const cat = tx.type === 'expense' ? getCategoryById(tx.category) : null;
            return (
              <div key={tx.id} className="tx-row">
                <div className="tx-icon" style={tx.type === 'expense' ? { background: 'var(--red-dim)', color: 'var(--red)' } : { background: 'var(--green-dim)', color: 'var(--green)' }}>
                  {cat ? cat.emoji : '↑'}
                </div>
                <div className="tx-info">
                  <span className="tx-desc">{tx.description}</span>
                  <span className="tx-meta">
                    {cat && <span className="cat-tag" style={{ '--cat-color': cat.color }}>{cat.label}</span>}
                    <span className="tx-date">
                      {new Date(tx.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </span>
                </div>
                <span className={`tx-amount ${tx.type === 'income' ? 'tx-amount--income' : 'tx-amount--expense'}`}>
                  {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>

    {showWhatIf && <WhatIfModal onClose={() => setShowWhatIf(false)} />}
    </>
  );
}
