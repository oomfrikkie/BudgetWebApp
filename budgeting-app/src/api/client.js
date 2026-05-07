const BASE_URL = 'http://localhost:3000';

function getToken() {
  return localStorage.getItem('access_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({ message: res.statusText }));

  if (!res.ok) {
    const err = new Error(data.message || 'Request failed');
    err.status = res.status;
    throw err;
  }

  return data;
}

// Shape the API transaction into what the UI expects
export function normalizeTransaction(tx) {
  return {
    ...tx,
    category: tx.categoryId,         // UI uses tx.category as a string id
    amount: Number(tx.amount),
  };
}

export function normalizeBudgets(list) {
  return list.reduce((acc, b) => {
    acc[b.categoryId] = Number(b.amount);
    return acc;
  }, {});
}

export function normalizeUser(u) {
  return {
    ...u,
    estimatedSalary: Number(u.estimatedSalary),
    hourlyRate: Number(u.hourlyRate),
    hoursPerWeek: Number(u.hoursPerWeek),
  };
}

export const api = {
  auth: {
    register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request('/auth/me'),
  },

  transactions: {
    list: (userId) => request(`/transactions?userId=${userId}`),
    create: (data) => request('/transactions', { method: 'POST', body: JSON.stringify(data) }),
    remove: (id) => request(`/transactions/${id}`, { method: 'DELETE' }),
  },

  budgets: {
    list: (userId) => request(`/budgets?userId=${userId}`),
    upsert: (data) => request('/budgets/upsert', { method: 'POST', body: JSON.stringify(data) }),
  },

  users: {
    update: (id, data) => request(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },

  categories: {
    list: () => request('/categories'),
  },

  incomeSchedules: {
    list: (userId) => request(`/income-schedules?userId=${userId}`),
    create: (data) => request('/income-schedules', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/income-schedules/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id) => request(`/income-schedules/${id}`, { method: 'DELETE' }),
  },
};
