import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, getCategoryById } from '../data/mockData';
import { IconArrowUp, IconArrowDown, IconPlus } from '../components/Icons';

const fmt = (n) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

const fmtDiff = (n) => {
  const sign = n >= 0 ? '+' : '';
  return `${sign}${fmt(n)}`;
};

function getMonthKey(dateStr) {
  return dateStr.slice(0, 7); // 'YYYY-MM'
}

function getLastNMonths(n) {
  const months = [];
  const now = new Date(2026, 4, 6); // May 2026
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthLabel = (key) => {
  const [, m] = key.split('-');
  return MONTH_NAMES[parseInt(m, 10) - 1];
};

export default function Dashboard() {
  const { transactions, budgets, settings, openAddModal } = useApp();
  const CURRENT_MONTH = '2026-05';

  const currentMonthTxs = useMemo(
    () => transactions.filter((t) => getMonthKey(t.date) === CURRENT_MONTH),
    [transactions]
  );

  const totalIncome = useMemo(
    () => currentMonthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [currentMonthTxs]
  );

  const totalExpenses = useMemo(
    () => currentMonthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [currentMonthTxs]
  );

  const diff = totalIncome - settings.estimatedSalary;

  const spentByCategory = useMemo(() => {
    const map = {};
    currentMonthTxs
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return map;
  }, [currentMonthTxs]);

  const last6Months = getLastNMonths(6);

  const monthlySpend = useMemo(() => {
    return last6Months.map((key) => {
      const total = transactions
        .filter((t) => getMonthKey(t.date) === key && t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0);
      return { key, total };
    });
  }, [transactions, last6Months]);

  const maxSpend = Math.max(...monthlySpend.map((m) => m.total), 1);

  const recentTxs = useMemo(
    () => [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [transactions]
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">May 2026</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openAddModal}>
          <IconPlus size={16} />
          Add
        </button>
      </div>

      {/* Summary cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Estimated salary</span>
          <span className="stat-value">{fmt(settings.estimatedSalary)}</span>
          <span className="stat-hint">monthly baseline</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Actual income</span>
          <span className="stat-value">{fmt(totalIncome)}</span>
          <div className={`diff-badge ${diff >= 0 ? 'diff-badge--pos' : 'diff-badge--neg'}`}>
            {diff >= 0 ? <IconArrowUp size={12} /> : <IconArrowDown size={12} />}
            {fmtDiff(diff)} {diff >= 0 ? 'more' : 'less'} than estimate
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-label">Total spent</span>
          <span className="stat-value stat-value--expense">{fmt(totalExpenses)}</span>
          <span className="stat-hint">{fmt(totalIncome - totalExpenses)} remaining</span>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Monthly overview bar chart */}
        <div className="card">
          <h2 className="card-title">Monthly spending</h2>
          <div className="bar-chart">
            {monthlySpend.map(({ key, total }) => {
              const pct = (total / maxSpend) * 100;
              const isCurrentMonth = key === CURRENT_MONTH;
              return (
                <div key={key} className="bar-col">
                  <span className="bar-value">{total > 0 ? fmt(total) : '–'}</span>
                  <div className="bar-track">
                    <div
                      className={`bar-fill ${isCurrentMonth ? 'bar-fill--current' : ''}`}
                      style={{ height: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                  <span className={`bar-label ${isCurrentMonth ? 'bar-label--current' : ''}`}>
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
                      <span className={`budget-spent ${status === 'danger' ? 'text-red' : ''}`}>
                        {fmt(spent)}
                      </span>
                      <span className="budget-sep">/</span>
                      <span className="budget-limit">{fmt(limit)}</span>
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className={`progress-fill progress-fill--${status}`}
                      style={{ width: `${pct}%` }}
                    />
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
                <div
                  className="tx-icon"
                  style={{ background: cat ? cat.color + '22' : 'var(--green-dim)', color: cat ? cat.color : 'var(--green)' }}
                >
                  {cat ? cat.emoji : '↑'}
                </div>
                <div className="tx-info">
                  <span className="tx-desc">{tx.description}</span>
                  <span className="tx-meta">
                    {cat && <span className="cat-tag" style={{ '--cat-color': cat.color }}>{cat.label}</span>}
                    <span className="tx-date">{new Date(tx.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
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
  );
}
