import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, getCategoryById } from '../data/categories';
import { IconTrash, IconArrowUp, IconArrowDown, IconPlus } from '../components/Icons';

const fmt = (n) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

export default function Transactions() {
  const { transactions, deleteTransaction, openAddModal } = useApp();
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filtered = useMemo(() => {
    return [...transactions]
      .filter((t) => typeFilter === 'all' || t.type === typeFilter)
      .filter((t) => categoryFilter === 'all' || t.category === categoryFilter)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, typeFilter, categoryFilter]);

  const totalIncome = useMemo(
    () => filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [filtered]
  );
  const totalExpense = useMemo(
    () => filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [filtered]
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-sub">{filtered.length} entries</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openAddModal}>
          <IconPlus size={16} />
          Add
        </button>
      </div>

      <div className="filters-bar">
        <div className="filter-group">
          <span className="filter-label">Type</span>
          <div className="filter-pills">
            {['all', 'income', 'expense'].map((v) => (
              <button
                key={v}
                className={`filter-pill ${typeFilter === v ? 'filter-pill--active' : ''}`}
                onClick={() => setTypeFilter(v)}
              >
                {v === 'all' ? 'All' : v === 'income' ? 'Income' : 'Expense'}
              </button>
            ))}
          </div>
        </div>

        {typeFilter !== 'income' && (
          <div className="filter-group">
            <span className="filter-label">Category</span>
            <div className="filter-pills">
              <button
                className={`filter-pill ${categoryFilter === 'all' ? 'filter-pill--active' : ''}`}
                onClick={() => setCategoryFilter('all')}
              >
                All
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  className={`filter-pill ${categoryFilter === c.id ? 'filter-pill--active' : ''}`}
                  onClick={() => setCategoryFilter(c.id)}
                >
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="tx-summary">
        {typeFilter !== 'expense' && (
          <div className="tx-summary-item tx-summary-item--income">
            <IconArrowUp size={14} />
            <span>{fmt(totalIncome)}</span>
          </div>
        )}
        {typeFilter !== 'income' && (
          <div className="tx-summary-item tx-summary-item--expense">
            <IconArrowDown size={14} />
            <span>{fmt(totalExpense)}</span>
          </div>
        )}
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>No transactions match your filters.</p>
          </div>
        ) : (
          <div className="tx-list">
            {filtered.map((tx) => {
              const cat = tx.type === 'expense' ? getCategoryById(tx.category) : null;
              return (
                <div key={tx.id} className="tx-row">
                  <div
                    className="tx-icon"
                    style={{
                      background: cat ? cat.color + '22' : 'var(--green-dim)',
                      color: cat ? cat.color : 'var(--green)',
                    }}
                  >
                    {cat ? cat.emoji : '↑'}
                  </div>
                  <div className="tx-info">
                    <span className="tx-desc">{tx.description}</span>
                    <span className="tx-meta">
                      {cat && (
                        <span className="cat-tag" style={{ '--cat-color': cat.color }}>
                          {cat.label}
                        </span>
                      )}
                      <span className="tx-date">
                        {new Date(tx.date + 'T00:00:00').toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </span>
                  </div>
                  <span className={`tx-amount ${tx.type === 'income' ? 'tx-amount--income' : 'tx-amount--expense'}`}>
                    {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                  </span>
                  <button
                    className="icon-btn icon-btn--danger"
                    onClick={() => deleteTransaction(tx.id)}
                    aria-label="Delete"
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
