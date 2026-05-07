import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, getCategoryById } from '../data/categories';
import { IconClose } from './Icons';

const fmt = (n) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

const CURRENT_MONTH = new Date().toISOString().slice(0, 7);

export default function WhatIfModal({ onClose }) {
  const { transactions, incomeSchedules, budgets } = useApp();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('grocery');

  const totalIncome = useMemo(
    () => transactions
      .filter((t) => t.date.startsWith(CURRENT_MONTH) && t.type === 'income')
      .reduce((s, t) => s + t.amount, 0),
    [transactions],
  );

  const totalExpenses = useMemo(
    () => transactions
      .filter((t) => t.date.startsWith(CURRENT_MONTH) && t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0),
    [transactions],
  );

  const projectedTotal = useMemo(
    () => incomeSchedules.reduce((s, x) => s + x.amount, 0),
    [incomeSchedules],
  );

  const monthEnd = totalIncome + projectedTotal - totalExpenses;
  const sim = parseFloat(amount) || 0;
  const afterPurchase = monthEnd - sim;

  const catSpent = useMemo(
    () => transactions
      .filter((t) => t.date.startsWith(CURRENT_MONTH) && t.type === 'expense' && t.category === category)
      .reduce((s, t) => s + t.amount, 0),
    [transactions, category],
  );

  const catBudget = budgets[category] || 0;
  const catAfter = catSpent + sim;
  const catPct = catBudget > 0 ? Math.min((catAfter / catBudget) * 100, 100) : null;
  const catStatus = catPct !== null ? (catPct >= 100 ? 'danger' : catPct >= 70 ? 'warn' : 'ok') : null;
  const cat = getCategoryById(category);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">What if I spend…</h2>
          <button className="icon-btn" onClick={onClose}>
            <IconClose size={20} />
          </button>
        </div>

        <div className="modal-form">
          <div className="form-field">
            <label className="form-label">Amount</label>
            <div className="input-prefix-wrap">
              <span className="input-prefix">€</span>
              <input
                className="form-input input-with-prefix"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Category</label>
            <select
              className="form-input form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
              ))}
            </select>
          </div>

          <div className="whatif-impact">
            <div className="whatif-row">
              <span className="whatif-label">Month-end now</span>
              <span className={`whatif-value ${monthEnd >= 0 ? 'text-green' : 'text-red'}`}>
                {fmt(monthEnd)}
              </span>
            </div>
            <div className="whatif-divider" />
            <div className="whatif-row">
              <span className="whatif-label">After this purchase</span>
              <span className={`whatif-value whatif-value--lg ${afterPurchase >= 0 ? 'text-green' : 'text-red'}`}>
                {fmt(afterPurchase)}
              </span>
            </div>
            {sim > 0 && (
              <div className="whatif-row whatif-row--diff">
                <span className="whatif-label text-muted">Impact</span>
                <span className="whatif-value text-red">−{fmt(sim)}</span>
              </div>
            )}
          </div>

          {catBudget > 0 && sim > 0 && (
            <div className="whatif-budget">
              <div className="whatif-budget-header">
                <span className="whatif-budget-cat">
                  <span>{cat.emoji}</span>
                  <span>{cat.label} budget</span>
                </span>
                <span className={catAfter > catBudget ? 'text-red' : ''}>
                  {fmt(catAfter)}
                  <span className="text-muted"> / {fmt(catBudget)}</span>
                </span>
              </div>
              <div className="progress-track">
                <div className={`progress-fill progress-fill--${catStatus}`} style={{ width: `${catPct}%` }} />
              </div>
              {catAfter > catBudget && (
                <p className="whatif-over">Over budget by {fmt(catAfter - catBudget)}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
