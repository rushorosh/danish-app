import React from 'react';
import './ProgressHeader.css';

export default function ProgressHeader({ score, onScoreClick }) {
  return (
    <header className="prog-header">
      <div className="prog-header__logo">
        <span className="prog-header__flag">🇦🇿</span>
        <span className="prog-header__brand">Danish!</span>
      </div>
      <button className="prog-header__score" onClick={onScoreClick} aria-label="Рейтинг">
        <span className="prog-header__star">⭐</span>
        <span className="prog-header__score-value">{score}</span>
        <span className="prog-header__score-label">очков</span>
      </button>
    </header>
  );
}
