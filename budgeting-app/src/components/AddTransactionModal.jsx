import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/categories';
import { IconClose, IconArrowUp, IconArrowDown } from './Icons';

const today = new Date().toISOString().split('T')[0];

export default function AddTransactionModal({ editTx, onClose }) {
  const { closeAddModal, addTransaction, updateTransaction, currencySymbol } = useApp();
  const close = onClose || closeAddModal;
  const isEdit = !!editTx;

  const [type, setType] = useState(editTx?.type || 'expense');
  const [amount, setAmount] = useState(editTx ? String(editTx.amount) : '');
  const [description, setDescription] = useState(editTx?.description || '');
  const [category, setCategory] = useState(editTx?.category || 'grocery');
  const [date, setDate] = useState(editTx?.date || today);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)
      e.amount = 'Enter a valid amount';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const desc = description.trim() || (type === 'income' ? 'Income' : 'Expense');

    setSubmitting(true);
    try {
      if (isEdit) {
        await updateTransaction(editTx.id, {
          type,
          amount: parseFloat(amount),
          description: desc,
          category: type === 'expense' ? category : undefined,
          date: date || today,
        });
      } else {
        await addTransaction({
          type,
          amount: parseFloat(amount),
          description: desc,
          category: type === 'expense' ? category : undefined,
          date: date || today,
        });
      }
      close();
    } catch {
      setErrors({ submit: 'Failed to save transaction. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Transaction' : 'New Transaction'}</h2>
          <button className="icon-btn" onClick={close}>
            <IconClose size={20} />
          </button>
        </div>

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
          <div className="form-field">
            <label className="form-label">Amount</label>
            <div className="input-prefix-wrap">
              <span className="input-prefix">{currencySymbol}</span>
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

          <div className="form-field">
            <label className="form-label">Description <span style={{ color: 'var(--text-2)', fontWeight: 400 }}>(optional)</span></label>
            <input
              className="form-input"
              type="text"
              placeholder={type === 'income' ? 'Income' : 'Expense'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

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

          <div className="form-field">
            <label className="form-label">Date</label>
            <input
              className="form-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {errors.submit && <p className="field-error">{errors.submit}</p>}

          <button
            type="submit"
            className={`btn btn-primary btn-full ${type === 'income' ? 'btn-income' : 'btn-expense'}`}
            disabled={submitting}
          >
            {submitting ? 'Saving…' : isEdit ? 'Save Changes' : `Add ${type === 'income' ? 'Income' : 'Expense'}`}
          </button>
        </form>
      </div>
    </div>
  );
}
