import { createContext, useContext, useEffect, useState } from 'react';
import { api, normalizeTransaction, normalizeBudgets, normalizeUser } from '../api/client';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [incomeSchedules, setIncomeSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  // All onboarding data — set just before navigating to /auth
  // Shape: { salary: {estimatedSalary, hourlyRate?, hoursPerWeek?}, schedules: [...], budgets: {...} }
  const [pendingOnboarding, setPendingOnboarding] = useState(null);
  const [pendingCredentials, setPendingCredentials] = useState(null);

  const settings = {
    estimatedSalary: user?.estimatedSalary || 0,
    hourlyRate: user?.hourlyRate || 0,
    hoursPerWeek: user?.hoursPerWeek || 0,
  };

  // ── Bootstrap ────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('access_token');
    if (!stored) { setLoading(false); return; }

    setToken(stored);
    api.auth.me()
      .then((u) => {
        const norm = normalizeUser(u);
        setUser(norm);
        return loadUserData(norm.id);
      })
      .catch(() => {
        localStorage.removeItem('access_token');
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function loadUserData(userId) {
    const [txs, budgetList, schedules] = await Promise.all([
      api.transactions.list(userId),
      api.budgets.list(userId),
      api.incomeSchedules.list(userId),
    ]);
    setTransactions(txs.map(normalizeTransaction));
    setBudgets(normalizeBudgets(budgetList));
    setIncomeSchedules(schedules.map(s => ({ ...s, amount: Number(s.amount) })));
  }

  // ── Auth ─────────────────────────────────────────────────────
  const login = async ({ email, password }) => {
    setAuthError('');
    try {
      const result = await api.auth.login({ email, password });
      localStorage.setItem('access_token', result.access_token);
      setToken(result.access_token);
      const norm = normalizeUser(result.user);
      setUser(norm);
      await loadUserData(norm.id);
      return true;
    } catch (err) {
      setAuthError(err.message || 'Login failed');
      return false;
    }
  };

  const beginRegistration = ({ name, email, password }) => {
    setPendingCredentials({ name, email, password });
  };

  const register = async (onboardingData) => {
    const { name, email, password } = pendingCredentials || {};
    const data = onboardingData || {};
    setAuthError('');
    try {
      const result = await api.auth.register({
        name,
        email,
        password,
        ...(data.salary || {}),
      });
      localStorage.setItem('access_token', result.access_token);
      setToken(result.access_token);
      const norm = normalizeUser(result.user);
      setUser(norm);

      const userId = norm.id;

      const pendingSchedules = data.schedules || [];
      const pendingBudgets = Object.entries(data.budgets || {}).filter(([, v]) => Number(v) > 0);

      if (pendingSchedules.length > 0 || pendingBudgets.length > 0) {
        await Promise.all([
          ...pendingSchedules.map(s =>
            api.incomeSchedules.create({ userId, label: s.label, amount: s.amount, dayOfMonth: s.dayOfMonth }),
          ),
          ...pendingBudgets.map(([categoryId, amount]) =>
            api.budgets.upsert({ userId, categoryId, amount: Number(amount) }),
          ),
        ]);
      }

      setPendingCredentials(null);
      await loadUserData(userId);
      return true;
    } catch (err) {
      setAuthError(err.message || 'Registration failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
    setTransactions([]);
    setBudgets({});
    setIncomeSchedules([]);
  };

  // ── Onboarding ───────────────────────────────────────────────
  // Called at the end of onboarding with all collected data
  const completeOnboarding = ({ salary, schedules = [], budgets: budgetMap = {} }) => {
    setPendingOnboarding({ salary, schedules, budgets: budgetMap });
  };

  // ── Transactions ─────────────────────────────────────────────
  const addTransaction = async ({ type, amount, description, category, date }) => {
    const tx = await api.transactions.create({
      userId: user.id,
      type,
      categoryId: category || null,
      amount,
      description,
      date,
    });
    setTransactions((prev) => [normalizeTransaction(tx), ...prev]);
  };

  const updateTransaction = async (id, { type, amount, description, category, date }) => {
    const tx = await api.transactions.update(id, {
      type,
      categoryId: category || null,
      amount,
      description,
      date,
    });
    setTransactions((prev) => prev.map((t) => t.id === id ? normalizeTransaction(tx) : t));
  };

  const deleteTransaction = async (id) => {
    await api.transactions.remove(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // ── Budgets ──────────────────────────────────────────────────
  const updateBudget = async (categoryId, amount) => {
    await api.budgets.upsert({ userId: user.id, categoryId, amount });
    setBudgets((prev) => ({ ...prev, [categoryId]: amount }));
  };

  // ── Income Schedules ─────────────────────────────────────────
  const addIncomeSchedule = async ({ label, amount, dayOfMonth }) => {
    const s = await api.incomeSchedules.create({ userId: user.id, label, amount, dayOfMonth });
    setIncomeSchedules((prev) =>
      [...prev, { ...s, amount: Number(s.amount) }].sort((a, b) => a.dayOfMonth - b.dayOfMonth),
    );
  };

  const removeIncomeSchedule = async (id) => {
    await api.incomeSchedules.remove(id);
    setIncomeSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const updateIncomeSchedule = async (id, data) => {
    const s = await api.incomeSchedules.update(id, data);
    setIncomeSchedules((prev) =>
      prev.map((x) => (x.id === id ? { ...s, amount: Number(s.amount) } : x))
        .sort((a, b) => a.dayOfMonth - b.dayOfMonth),
    );
  };

  // ── Settings / Profile ───────────────────────────────────────
  const updateSettings = async (data) => {
    const updated = await api.users.update(user.id, data);
    setUser(normalizeUser(updated));
  };

  return (
    <AppContext.Provider
      value={{
        token,
        loading,
        user,
        settings,
        transactions,
        budgets,
        authError,
        showAddModal,
        completeOnboarding,
        beginRegistration,
        login,
        register,
        logout,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        updateBudget,
        incomeSchedules,
        addIncomeSchedule,
        removeIncomeSchedule,
        updateIncomeSchedule,
        updateSettings,
        openAddModal: () => setShowAddModal(true),
        closeAddModal: () => setShowAddModal(false),
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
