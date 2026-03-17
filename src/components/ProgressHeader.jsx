import React from 'react';
import './ProgressHeader.css';

export default function ProgressHeader({ score }) {
  return (
    <header className="prog-header">
      <div className="prog-header__logo">
        <span className="prog-header__flag">🇦🇿</span>
        <span className="prog-header__brand">Danish!</span>
      </div>
      <div className="prog-header__score">
        <span className="prog-header__star">⭐</span>
        <span className="prog-header__score-value">{score}</span>
        <span className="prog-header__score-label">очков</span>
      </div>
    </header>
  );
}
