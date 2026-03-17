import React from 'react';
import './TabBar.css';

const TAB_ICONS = {
  translate: '🌐',
  learn: '📚',
  games: '🎮',
  rating: '🏆',
};

export default function TabBar({ tabs, labels, activeTab, onTabChange }) {
  return (
    <nav className="tabbar">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`tabbar__item${activeTab === tab ? ' tabbar__item--active' : ''}`}
          onClick={() => onTabChange(tab)}
        >
          <span className="tabbar__icon">{TAB_ICONS[tab]}</span>
          <span className="tabbar__label">{labels[tab]}</span>
        </button>
      ))}
    </nav>
  );
}
