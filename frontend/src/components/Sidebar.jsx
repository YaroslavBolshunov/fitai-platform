import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Dumbbell,
  Home,
  MessageSquarePlus,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
  Cpu,
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { to: '/', label: 'Главная', icon: Home, end: true },
  { to: '/chat', label: 'ИИ-Тренер', icon: MessageSquarePlus },
  { to: '/workouts', label: 'База упражнений', icon: BookOpen },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-top">
        <Link to="/" className="sidebar-brand" title="FitAI">
          <div className="sidebar-logo-icon">
            <Dumbbell size={18} strokeWidth={2.4} />
          </div>
          <span className="sidebar-logo-text">FitAI</span>
        </Link>

        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setCollapsed((prev) => !prev)}
          title={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
            >
              <Icon size={18} className="sidebar-link-icon" />
              <span className="sidebar-link-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div
          className="sidebar-status"
          title="Локальный RAG • Mock API (готов к LLM)"
        >
          <span className="sidebar-status-dot" />
          <div className="sidebar-status-info">
            <span className="sidebar-status-title">Локальный RAG</span>
            <span className="sidebar-status-sub">FastAPI + ChromaDB • LM Studio</span>
          </div>
          <Cpu size={16} className="sidebar-status-icon" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;