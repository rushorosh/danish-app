import React, { useState } from 'react';
import { getLevelProgress } from '../data/levels.js';
import { getStreak } from '../data/streak.js';
import './ProgressHeader.css';

export default function ProgressHeader({ score, onScoreClick }) {
  const lp = getLevelProgress(score);
  const [streak] = useState(() => getStreak());

  return (
    <header className="prog-header">
      <div className="prog-header__top">
        <div className="prog-header__logo">
          <span className="prog-header__flag">🇦🇿</span>
          <span className="prog-header__brand">Danish!</span>
        </div>
        <div className="prog-header__right">
          {streak > 0 && (
            <div className="prog-header__streak">
              <span>🔥</span>
              <span className="prog-header__streak-count">{streak}</span>
            </div>
          )}
          <button className="prog-header__score" onClick={onScoreClick} aria-label="Рейтинг">
            <span className="prog-header__star">⭐</span>
            <span className="prog-header__score-value">{score}</span>
          </button>
        </div>
      </div>

      <div className="prog-header__level-row">
        <span className="prog-header__level-badge">Ур. {lp.level}</span>
        <div className="prog-header__xp-track">
          <div
            className="prog-header__xp-fill"
            style={{ width: `${Math.round(lp.progress * 100)}%` }}
          />
        </div>
        <span className="prog-header__level-name">{lp.name}</span>
      </div>
    </header>
  );
}
