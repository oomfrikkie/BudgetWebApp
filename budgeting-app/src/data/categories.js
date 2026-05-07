export const CATEGORIES = [
  { id: 'grocery',       label: 'Grocery',       emoji: '🛒', color: '#22c55e' },
  { id: 'insurance',     label: 'Insurance',     emoji: '🛡️', color: '#f59e0b' },
  { id: 'rent',          label: 'Rent',          emoji: '🏠', color: '#ef4444' },
  { id: 'transport',     label: 'Transport',     emoji: '🚌', color: '#3b82f6' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎬', color: '#a855f7' },
  { id: 'subscriptions', label: 'Subscriptions', emoji: '📱', color: '#ec4899' },
  { id: 'other',         label: 'Other',         emoji: '📦', color: '#6b7280' },
];

export const getCategoryById = (id) => CATEGORIES.find((c) => c.id === id);
