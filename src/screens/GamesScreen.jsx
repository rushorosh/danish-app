import React from 'react';
import './GamesScreen.css';

export default function GamesScreen({ userScore, onOpenFlashcards, onOpenListening }) {
  return (
    <div className="games-screen">
      <div className="games-screen__header">
        <div className="games-screen__header-left">
          <span className="games-screen__header-icon">🎮</span>
          <span className="games-screen__header-title">Игры</span>
        </div>
        <div className="games-screen__score-badge">
          <span>⭐</span>
          <span>{userScore}</span>
        </div>
      </div>

      <div className="games-screen__subtitle">
        Зарабатывай очки, играя в игры
      </div>

      <div className="games-screen__cards">
        {/* Flashcards */}
        <div className="games-screen__card games-screen__card--purple">
          <div className="games-screen__card-top">
            <div className="games-screen__card-icon-wrap">
              <span className="games-screen__card-icon">🃏</span>
            </div>
            <div className="games-screen__card-badge">+1 очко за ответ</div>
          </div>
          <div className="games-screen__card-body">
            <div className="games-screen__card-title">Карточки</div>
            <div className="games-screen__card-desc">
              Угадай перевод слова. Выбери правильный ответ из четырёх вариантов.
            </div>
          </div>
          <div className="games-screen__card-footer">
            <div className="games-screen__card-meta">
              <span className="games-screen__card-meta-item">📝 10 слов</span>
              <span className="games-screen__card-meta-item">⏱ ~3 мин</span>
            </div>
            <button className="games-screen__play-btn games-screen__play-btn--purple" onClick={onOpenFlashcards}>
              Играть
            </button>
          </div>
        </div>

        {/* Listening */}
        <div className="games-screen__card games-screen__card--pink">
          <div className="games-screen__card-top">
            <div className="games-screen__card-icon-wrap games-screen__card-icon-wrap--pink">
              <span className="games-screen__card-icon">🎙️</span>
            </div>
            <div className="games-screen__card-badge games-screen__card-badge--pink">+2 очка за ответ</div>
          </div>
          <div className="games-screen__card-body">
            <div className="games-screen__card-title">Аудирование</div>
            <div className="games-screen__card-desc">
              Прослушай слово и произнеси его вслух. Тренируй произношение азербайджанского языка.
            </div>
          </div>
          <div className="games-screen__card-footer">
            <div className="games-screen__card-meta">
              <span className="games-screen__card-meta-item">🔊 8 слов</span>
              <span className="games-screen__card-meta-item">⏱ ~5 мин</span>
            </div>
            <button className="games-screen__play-btn games-screen__play-btn--pink" onClick={onOpenListening}>
              Играть
            </button>
          </div>
        </div>
      </div>

      {/* Score summary */}
      <div className="games-screen__score-summary">
        <div className="games-screen__score-icon">🏆</div>
        <div className="games-screen__score-info">
          <div className="games-screen__score-label">Ваш счёт</div>
          <div className="games-screen__score-number">{userScore} очков</div>
        </div>
      </div>

      {/* Tip */}
      <div className="games-screen__tip">
        <span className="games-screen__tip-icon">💡</span>
        <span className="games-screen__tip-text">
          Играй каждый день, чтобы подняться выше в рейтинге!
        </span>
      </div>
    </div>
  );
}
