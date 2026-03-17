import React, { useState, useCallback } from 'react';
import { getLeaderboard } from '../data/leaderboard.js';
import './RatingScreen.css';

export default function RatingScreen({ userScore, userName }) {
  const [board, setBoard] = useState(() => getLeaderboard());

  const handleRefresh = useCallback(() => {
    setBoard(getLeaderboard());
  }, []);

  const myPosition = board.findIndex(u => u.id === 'me');

  const top3 = board.slice(0, 3);
  const rest = board.slice(3);

  const podiumOrder = [1, 0, 2]; // silver, gold, bronze visual order

  const medalColors = {
    0: { bg: '#FFF7E0', border: '#F5D060', text: '#92400E', label: '🥇' },
    1: { bg: '#F3F4F6', border: '#D1D5DB', text: '#374151', label: '🥈' },
    2: { bg: '#FFF4EE', border: '#FDBA74', text: '#7C2D12', label: '🥉' },
  };

  const rankLabel = (idx) => {
    if (idx === 0) return '🥇';
    if (idx === 1) return '🥈';
    if (idx === 2) return '🥉';
    return `#${idx + 1}`;
  };

  return (
    <div className="rating-screen">
      <div className="rating-screen__header">
        <div className="rating-screen__header-left">
          <span className="rating-screen__header-icon">🏆</span>
          <div>
            <div className="rating-screen__header-title">Рейтинг</div>
            <div className="rating-screen__header-sub">Эта неделя</div>
          </div>
        </div>
        <button className="rating-screen__refresh-btn" onClick={handleRefresh}>
          <span>🔄</span>
          <span>Обновить</span>
        </button>
      </div>

      {/* Current user position */}
      {myPosition >= 0 && (
        <div className="rating-screen__my-position">
          <span className="rating-screen__my-pos-label">Ваша позиция:</span>
          <span className="rating-screen__my-pos-rank">#{myPosition + 1}</span>
          <span className="rating-screen__my-pos-score">⭐ {userScore}</span>
        </div>
      )}

      {/* Podium */}
      {top3.length >= 2 && (
        <div className="rating-podium">
          {podiumOrder.map((originalIdx) => {
            if (!top3[originalIdx]) return null;
            const user = top3[originalIdx];
            const rank = originalIdx;
            const isGold = rank === 0;
            const medal = medalColors[rank];
            return (
              <div
                key={user.id}
                className={`rating-podium__item rating-podium__item--${rank === 0 ? 'gold' : rank === 1 ? 'silver' : 'bronze'}`}
              >
                <div className="rating-podium__avatar">{user.avatar}</div>
                <div className="rating-podium__name">{user.name.split(' ')[0]}</div>
                <div className="rating-podium__score">⭐ {user.score.toLocaleString()}</div>
                <div
                  className="rating-podium__block"
                  style={{
                    height: isGold ? 80 : rank === 1 ? 60 : 48,
                    background: medal.bg,
                    border: `2px solid ${medal.border}`,
                  }}
                >
                  <span className="rating-podium__medal">{medal.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <div className="rating-list">
        {board.map((user, idx) => {
          const isMe = user.id === 'me';
          return (
            <div key={user.id} className={`rating-row${isMe ? ' rating-row--me' : ''}`}>
              <div className={`rating-row__rank${idx < 3 ? ' rating-row__rank--medal' : ''}`}>
                {rankLabel(idx)}
              </div>
              <div className="rating-row__avatar">{user.avatar}</div>
              <div className="rating-row__info">
                <div className="rating-row__name">
                  {user.name}
                  {isMe && <span className="rating-row__you-badge">Вы</span>}
                </div>
              </div>
              <div className="rating-row__score">
                <span className="rating-row__score-star">⭐</span>
                <span className="rating-row__score-num">{user.score.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rating-screen__footer">
        <span>🔄</span>
        <span>Обновляется в реальном времени</span>
      </div>
    </div>
  );
}
