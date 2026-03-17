import React from 'react';
import { useT } from '../data/LanguageContext.jsx';
import './GamesScreen.css';

export default function GamesScreen({ userScore, onOpenFlashcards, onOpenListening }) {
  const t = useT('games');
  return (
    <div className="games-screen">
      <div className="games-screen__header">
        <div className="games-screen__header-left">
          <span className="games-screen__header-icon">🎮</span>
          <span className="games-screen__header-title">{t('title')}</span>
        </div>
        <div className="games-screen__score-badge">
          <span>⭐</span>
          <span>{userScore}</span>
        </div>
      </div>

      <div className="games-screen__subtitle">{t('subtitle')}</div>

      <div className="games-screen__cards">
        {/* Flashcards */}
        <div className="games-screen__card games-screen__card--purple">
          <div className="games-screen__card-top">
            <div className="games-screen__card-icon-wrap">
              <span className="games-screen__card-icon">🃏</span>
            </div>
            <div className="games-screen__card-badge">{t('flashcards_badge')}</div>
          </div>
          <div className="games-screen__card-body">
            <div className="games-screen__card-title">{t('flashcards')}</div>
            <div className="games-screen__card-desc">{t('flashcards_desc')}</div>
          </div>
          <div className="games-screen__card-footer">
            <div className="games-screen__card-meta">
              <span className="games-screen__card-meta-item">📝 10</span>
              <span className="games-screen__card-meta-item">⏱ ~3 мин</span>
            </div>
            <button className="games-screen__play-btn games-screen__play-btn--purple" onClick={onOpenFlashcards}>
              {t('play')}
            </button>
          </div>
        </div>

        {/* Listening */}
        <div className="games-screen__card games-screen__card--pink">
          <div className="games-screen__card-top">
            <div className="games-screen__card-icon-wrap games-screen__card-icon-wrap--pink">
              <span className="games-screen__card-icon">🎧</span>
            </div>
            <div className="games-screen__card-badge games-screen__card-badge--pink">{t('listening_badge')}</div>
          </div>
          <div className="games-screen__card-body">
            <div className="games-screen__card-title">{t('listening')}</div>
            <div className="games-screen__card-desc">{t('listening_desc')}</div>
          </div>
          <div className="games-screen__card-footer">
            <div className="games-screen__card-meta">
              <span className="games-screen__card-meta-item">🔊 8</span>
              <span className="games-screen__card-meta-item">⏱ ~5 мин</span>
            </div>
            <button className="games-screen__play-btn games-screen__play-btn--pink" onClick={onOpenListening}>
              {t('play')}
            </button>
          </div>
        </div>
      </div>

      {/* Score summary */}
      <div className="games-screen__score-summary">
        <div className="games-screen__score-icon">🏆</div>
        <div className="games-screen__score-info">
          <div className="games-screen__score-label">{t('your_score')}</div>
          <div className="games-screen__score-number">{userScore} {t('points')}</div>
        </div>
      </div>

      {/* Tip */}
      <div className="games-screen__tip">
        <span className="games-screen__tip-icon">💡</span>
        <span className="games-screen__tip-text">{t('tip')}</span>
      </div>
    </div>
  );
}
