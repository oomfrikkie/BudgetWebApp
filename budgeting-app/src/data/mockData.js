export const CATEGORIES = [
  { id: 'grocery', label: 'Grocery', emoji: '🛒', color: '#22c55e' },
  { id: 'insurance', label: 'Insurance', emoji: '🛡️', color: '#f59e0b' },
  { id: 'rent', label: 'Rent', emoji: '🏠', color: '#ef4444' },
  { id: 'transport', label: 'Transport', emoji: '🚌', color: '#3b82f6' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎬', color: '#a855f7' },
  { id: 'subscriptions', label: 'Subscriptions', emoji: '📱', color: '#ec4899' },
  { id: 'other', label: 'Other', emoji: '📦', color: '#6b7280' },
];

export const getCategoryById = (id) => CATEGORIES.find((c) => c.id === id);

export const initialTransactions = [
  // May 2026 (current, partial — 6 days in)
  { id: 't1', type: 'expense', category: 'rent', amount: 850, description: 'Monthly rent', date: '2026-05-01' },
  { id: 't2', type: 'expense', category: 'subscriptions', amount: 45, description: 'Netflix + Spotify', date: '2026-05-01' },
  { id: 't3', type: 'expense', category: 'grocery', amount: 62, description: 'Weekly groceries', date: '2026-05-03' },
  { id: 't4', type: 'income', amount: 2840, description: 'Monthly salary', date: '2026-05-01' },

  // April 2026
  { id: 't5', type: 'income', amount: 2840, description: 'Monthly salary', date: '2026-04-01' },
  { id: 't6', type: 'expense', category: 'rent', amount: 850, description: 'Monthly rent', date: '2026-04-01' },
  { id: 't7', type: 'expense', category: 'subscriptions', amount: 45, description: 'Netflix + Spotify', date: '2026-04-01' },
  { id: 't8', type: 'expense', category: 'grocery', amount: 175, description: 'Groceries', date: '2026-04-08' },
  { id: 't9', type: 'expense', category: 'transport', amount: 88, description: 'Monthly transit pass', date: '2026-04-02' },
  { id: 't10', type: 'expense', category: 'entertainment', amount: 65, description: 'Cinema & dinner', date: '2026-04-14' },
  { id: 't11', type: 'expense', category: 'insurance', amount: 72, description: 'Health insurance', date: '2026-04-05' },
  { id: 't12', type: 'expense', category: 'grocery', amount: 92, description: 'Weekly groceries', date: '2026-04-20' },
  { id: 't13', type: 'expense', category: 'entertainment', amount: 40, description: 'Concert tickets', date: '2026-04-26' },
  { id: 't14', type: 'expense', category: 'other', amount: 35, description: 'Haircut', date: '2026-04-18' },

  // March 2026
  { id: 't15', type: 'income', amount: 2840, description: 'Monthly salary', date: '2026-03-01' },
  { id: 't16', type: 'income', amount: 150, description: 'Freelance project', date: '2026-03-15' },
  { id: 't17', type: 'expense', category: 'rent', amount: 850, description: 'Monthly rent', date: '2026-03-01' },
  { id: 't18', type: 'expense', category: 'subscriptions', amount: 45, description: 'Netflix + Spotify', date: '2026-03-01' },
  { id: 't19', type: 'expense', category: 'grocery', amount: 210, description: 'Groceries', date: '2026-03-10' },
  { id: 't20', type: 'expense', category: 'transport', amount: 88, description: 'Monthly transit pass', date: '2026-03-02' },
  { id: 't21', type: 'expense', category: 'entertainment', amount: 120, description: 'Weekend trip', date: '2026-03-20' },
  { id: 't22', type: 'expense', category: 'insurance', amount: 72, description: 'Health insurance', date: '2026-03-05' },
  { id: 't23', type: 'expense', category: 'other', amount: 55, description: 'Books & supplies', date: '2026-03-22' },

  // February 2026
  { id: 't24', type: 'income', amount: 2840, description: 'Monthly salary', date: '2026-02-01' },
  { id: 't25', type: 'expense', category: 'rent', amount: 850, description: 'Monthly rent', date: '2026-02-01' },
  { id: 't26', type: 'expense', category: 'subscriptions', amount: 45, description: 'Netflix + Spotify', date: '2026-02-01' },
  { id: 't27', type: 'expense', category: 'grocery', amount: 162, description: 'Groceries', date: '2026-02-12' },
  { id: 't28', type: 'expense', category: 'transport', amount: 88, description: 'Monthly transit pass', date: '2026-02-02' },
  { id: 't29', type: 'expense', category: 'entertainment', amount: 80, description: "Valentine's dinner", date: '2026-02-14' },
  { id: 't30', type: 'expense', category: 'insurance', amount: 72, description: 'Health insurance', date: '2026-02-05' },

  // January 2026
  { id: 't31', type: 'income', amount: 2840, description: 'Monthly salary', date: '2026-01-01' },
  { id: 't32', type: 'income', amount: 200, description: 'Holiday bonus', date: '2026-01-05' },
  { id: 't33', type: 'expense', category: 'rent', amount: 850, description: 'Monthly rent', date: '2026-01-01' },
  { id: 't34', type: 'expense', category: 'subscriptions', amount: 45, description: 'Netflix + Spotify', date: '2026-01-01' },
  { id: 't35', type: 'expense', category: 'grocery', amount: 195, description: 'Groceries', date: '2026-01-10' },
  { id: 't36', type: 'expense', category: 'transport', amount: 88, description: 'Monthly transit pass', date: '2026-01-02' },
  { id: 't37', type: 'expense', category: 'entertainment', amount: 95, description: 'New Year celebration', date: '2026-01-01' },
  { id: 't38', type: 'expense', category: 'insurance', amount: 72, description: 'Health insurance', date: '2026-01-05' },
  { id: 't39', type: 'expense', category: 'other', amount: 120, description: 'New year clothes', date: '2026-01-08' },

  // December 2025
  { id: 't40', type: 'income', amount: 2840, description: 'Monthly salary', date: '2025-12-01' },
  { id: 't41', type: 'expense', category: 'rent', amount: 850, description: 'Monthly rent', date: '2025-12-01' },
  { id: 't42', type: 'expense', category: 'subscriptions', amount: 45, description: 'Netflix + Spotify', date: '2025-12-01' },
  { id: 't43', type: 'expense', category: 'grocery', amount: 240, description: 'Holiday groceries', date: '2025-12-15' },
  { id: 't44', type: 'expense', category: 'entertainment', amount: 180, description: 'Christmas gifts', date: '2025-12-20' },
  { id: 't45', type: 'expense', category: 'transport', amount: 88, description: 'Monthly transit pass', date: '2025-12-02' },
  { id: 't46', type: 'expense', category: 'insurance', amount: 72, description: 'Health insurance', date: '2025-12-05' },
];

export const initialBudgets = {
  grocery: 300,
  insurance: 100,
  rent: 900,
  transport: 150,
  entertainment: 200,
  subscriptions: 60,
  other: 150,
};

export const initialUser = {
  name: 'Alex Johnson',
  email: 'alex@example.com',
};

export const initialSettings = {
  estimatedSalary: 2800,
  hourlyRate: 17.5,
  hoursPerWeek: 40,
};
