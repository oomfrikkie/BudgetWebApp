import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/categories';
import { IconEdit, IconCheck, IconClose } from '../components/Icons';

function getMonthKey(dateStr) {
  return dateStr.slice(0, 7);
}

const currentMonthDisplay = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

function EditableLimit({ limit, onSave, fmt }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(limit));

  const save = () => {
    const n = parseFloat(val);
    if (n > 0) onSave(n);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="limit-edit">
        <span className="input-prefix" style={{ fontSize: '0.85rem' }}>€</span>
        <input
          className="limit-input"
          type="number"
          min="1"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          autoFocus
          onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
        />
        <button className="icon-btn icon-btn--sm" onClick={save}><IconCheck size={14} /></button>
        <button className="icon-btn icon-btn--sm" onClick={() => setEditing(false)}><IconClose size={14} /></button>
      </div>
    );
  }

  return (
    <button className="limit-btn" onClick={() => { setVal(String(limit)); setEditing(true); }}>
      {fmt(limit)}
      <IconEdit size={13} />
    </button>
  );
}

export default function Budgets() {
  const { transactions, budgets, updateBudget, fmt } = useApp();
  const CURRENT_MONTH = new Date().toISOString().slice(0, 7);

  const spentByCategory = useMemo(() => {
    const map = {};
    transactions
      .filter((t) => t.type === 'expense' && getMonthKey(t.date) === CURRENT_MONTH)
      .forEach((t) => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return map;
  }, [transactions, CURRENT_MONTH]);

  const totalBudget = CATEGORIES.reduce((s, c) => s + (budgets[c.id] || 0), 0);
  const totalSpent = Object.values(spentByCategory).reduce((s, v) => s + v, 0);
  const overallPct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="page-sub">{currentMonthDisplay} · click a limit to edit</p>
        </div>
      </div>

      <div className="card budget-overview">
        <div className="budget-overview-row">
          <div>
            <span className="stat-label">Total spent</span>
            <span className="stat-value">{fmt(totalSpent)}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="stat-label">Total budget</span>
            <span className="stat-value">{fmt(totalBudget)}</span>
          </div>
        </div>
        <div className="progress-track progress-track--lg">
          <div
            className={`progress-fill progress-fill--${overallPct >= 90 ? 'danger' : overallPct >= 70 ? 'warn' : 'ok'}`}
            style={{ width: `${overallPct}%`, transition: 'width 0.5s ease' }}
          />
        </div>
        <span className="stat-hint" style={{ marginTop: 4, display: 'block' }}>
          {fmt(totalBudget - totalSpent)} remaining overall
        </span>
      </div>

      <div className="budgets-grid">
        {CATEGORIES.map((cat) => {
          const spent = spentByCategory[cat.id] || 0;
          const limit = budgets[cat.id] || 0;
          const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
          const status = pct >= 90 ? 'danger' : pct >= 70 ? 'warn' : 'ok';

          return (
            <div key={cat.id} className="budget-card">
              <div className="budget-card-top">
                <div className="budget-cat-icon" style={{ background: cat.color + '22', color: cat.color }}>
                  {cat.emoji}
                </div>
                <div className="budget-card-info">
                  <span className="budget-card-name">{cat.label}</span>
                  <div className="budget-card-amounts">
                    <span className={`budget-card-spent ${status === 'danger' ? 'text-red' : ''}`}>
                      {fmt(spent)}
                    </span>
                    <span className="text-muted"> / </span>
                    <EditableLimit limit={limit} onSave={(v) => updateBudget(cat.id, v)} fmt={fmt} />
                  </div>
                </div>
              </div>
              <div className="progress-track" style={{ marginTop: 12 }}>
                <div
                  className={`progress-fill progress-fill--${status}`}
                  style={{ width: `${pct}%`, transition: 'width 0.5s ease' }}
                />
              </div>
              <div className="budget-card-footer">
                <span className={`pct-badge pct-badge--${status}`}>{Math.round(pct)}%</span>
                <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                  {limit > 0 ? `${fmt(limit - spent)} left` : 'No limit set'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
