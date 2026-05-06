import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  IconDashboard,
  IconTransactions,
  IconBudgets,
  IconSettings,
  IconPlus,
} from './Icons';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', Icon: IconDashboard },
  { path: '/transactions', label: 'Transactions', Icon: IconTransactions },
  { path: '/budgets', label: 'Budgets', Icon: IconBudgets },
  { path: '/settings', label: 'Settings', Icon: IconSettings },
];

export default function Layout({ children }) {
  const { user, openAddModal } = useApp();
  const location = useLocation();

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AJ';

  return (
    <div className="layout">
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <IconBudgets size={18} />
          </div>
          <span className="logo-text">Vault</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ path, label, Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item--active' : ''}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="sidebar-add-btn" onClick={openAddModal}>
          <IconPlus size={18} />
          <span>Add Transaction</span>
        </button>

        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-email">{user?.email || ''}</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav">
        {navItems.map(({ path, label, Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `bottom-nav-item ${isActive ? 'bottom-nav-item--active' : ''}`
            }
          >
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Mobile FAB */}
      <button className="fab" onClick={openAddModal} aria-label="Add transaction">
        <IconPlus size={24} />
      </button>
    </div>
  );
}
