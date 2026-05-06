import { createContext, useContext, useState } from 'react';
import {
  initialTransactions,
  initialBudgets,
  initialUser,
  initialSettings,
} from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isOnboarded, setIsOnboarded] = useState(true);
  const [user, setUser] = useState(initialUser);
  const [settings, setSettings] = useState(initialSettings);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [budgets, setBudgets] = useState(initialBudgets);
  const [showAddModal, setShowAddModal] = useState(false);

  const completeOnboarding = (data) => {
    setSettings((prev) => ({ ...prev, ...data }));
    setIsOnboarded(true);
  };

  const login = ({ email, password }) => {
    setUser({ ...initialUser, email });
    return true;
  };

  const register = ({ name, email }) => {
    setUser({ name, email });
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const addTransaction = (tx) => {
    const newTx = {
      ...tx,
      id: `t${Date.now()}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const updateBudget = (category, limit) => {
    setBudgets((prev) => ({ ...prev, [category]: limit }));
  };

  const updateSettings = (data) => {
    if (data.name || data.email) {
      setUser((prev) => ({ ...prev, ...data }));
    }
    if (data.estimatedSalary !== undefined || data.hourlyRate !== undefined || data.hoursPerWeek !== undefined) {
      setSettings((prev) => ({ ...prev, ...data }));
    }
  };

  return (
    <AppContext.Provider
      value={{
        isOnboarded,
        user,
        settings,
        transactions,
        budgets,
        showAddModal,
        completeOnboarding,
        login,
        register,
        logout,
        addTransaction,
        deleteTransaction,
        updateBudget,
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
