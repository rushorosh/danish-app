import React from 'react';
import { useT } from '../data/LanguageContext.jsx';
import './TabBar.css';

const TAB_ICONS = {
  translate: '🌐',
  learn: '📚',
  vocab: '📖',
  games: '🎮',
  rating: '🏆',
  settings: '⚙️',
};

export default function TabBar({ tabs, activeTab, onTabChange }) {
  const t = useT('tabs');
  return (
    <nav className="tabbar">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`tabbar__item${activeTab === tab ? ' tabbar__item--active' : ''}`}
          onClick={() => onTabChange(tab)}
        >
          <span className="tabbar__icon">{TAB_ICONS[tab]}</span>
          <span className="tabbar__label">{t(tab)}</span>
        </button>
      ))}
    </nav>
  );
}
