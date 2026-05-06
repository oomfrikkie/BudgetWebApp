import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/mockData';
import { IconClose, IconArrowUp, IconArrowDown } from './Icons';

const today = new Date().toISOString().split('T')[0];

export default function AddTransactionModal() {
  const { closeAddModal, addTransaction } = useApp();
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('grocery');
  const [date, setDate] = useState(today);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)
      e.amount = 'Enter a valid amount';
    if (!description.trim()) e.description = 'Description is required';
    if (type === 'income' && !date) e.date = 'Date is required for income';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    addTransaction({
      type,
      amount: parseFloat(amount),
      description: description.trim(),
      category: type === 'expense' ? category : undefined,
      date: date || today,
    });
    closeAddModal();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeAddModal()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">New Transaction</h2>
          <button className="icon-btn" onClick={closeAddModal}>
            <IconClose size={20} />
          </button>
        </div>

        {/* Type toggle */}
        <div className="type-toggle">
          <button
            type="button"
            className={`type-btn ${type === 'income' ? 'type-btn--income' : ''}`}
            onClick={() => setType('income')}
          >
            <IconArrowUp size={16} />
            Income
          </button>
          <button
            type="button"
            className={`type-btn ${type === 'expense' ? 'type-btn--expense' : ''}`}
            onClick={() => setType('expense')}
          >
            <IconArrowDown size={16} />
            Expense
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Amount */}
          <div className="form-field">
            <label className="form-label">Amount</label>
            <div className="input-prefix-wrap">
              <span className="input-prefix">€</span>
              <input
                className={`form-input input-with-prefix ${errors.amount ? 'input-error' : ''}`}
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setErrors((p) => ({ ...p, amount: '' })); }}
              />
            </div>
            {errors.amount && <span className="field-error">{errors.amount}</span>}
          </div>

          {/* Description */}
          <div className="form-field">
            <label className="form-label">Description</label>
            <input
              className={`form-input ${errors.description ? 'input-error' : ''}`}
              type="text"
              placeholder="e.g. Monthly rent"
              value={description}
              onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: '' })); }}
            />
            {errors.description && <span className="field-error">{errors.description}</span>}
          </div>

          {/* Category — expense only */}
          {type === 'expense' && (
            <div className="form-field">
              <label className="form-label">Category</label>
              <select
                className="form-input form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date */}
          <div className="form-field">
            <label className="form-label">
              Date{type === 'income' ? ' *' : ' (optional)'}
            </label>
            <input
              className={`form-input ${errors.date ? 'input-error' : ''}`}
              type="date"
              value={date}
              onChange={(e) => { setDate(e.target.value); setErrors((p) => ({ ...p, date: '' })); }}
            />
            {errors.date && <span className="field-error">{errors.date}</span>}
          </div>

          <button
            type="submit"
            className={`btn btn-primary btn-full ${type === 'income' ? 'btn-income' : 'btn-expense'}`}
          >
            Add {type === 'income' ? 'Income' : 'Expense'}
          </button>
        </form>
      </div>
    </div>
  );
}
