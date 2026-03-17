import React, { useState, useCallback, useEffect } from 'react';
import { fetchLeaderboard, fetchLeaderboardPeriod } from '../data/api.js';
import { MOCK_USERS } from '../data/leaderboard.js';
import './RatingScreen.css';

const AVATARS = ['🦊','🐺','🦋','🦁','🐸','🦅','🐬','🦉','🐝','🏆','🦌','🐻','🦜','🐯','🦈'];
function pickAvatar(id) {
  return AVATARS[Math.abs(Number(id) || 0) % AVATARS.length];
}
function displayName(u) {
  if (u.first_name || u.last_name) return [u.first_name, u.last_name].filter(Boolean).join(' ');
  if (u.username) return u.username;
  return 'Пользователь';
}

const PERIODS = [
  { key: 'all', label: 'Всё время' },
  { key: 'week', label: 'Неделя' },
  { key: 'day', label: 'День' },
];

export default function RatingScreen({ userScore, userName, telegramId, userAvatar }) {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');

  const load = useCallback(async (p = period) => {
    setLoading(true);
    const data = p === 'all' ? await fetchLeaderboard() : await fetchLeaderboardPeriod(p);
    if (data && data.length > 0) {
      const mapped = data.map(u => ({
        id: String(u.telegram_id),
        name: displayName(u),
        score: u.score || 0,
        avatar: pickAvatar(u.telegram_id),
        isMe: String(u.telegram_id) === String(telegramId),
      }));
      setBoard(mapped);
    } else {
      // Fallback to mock data + current user
      const mock = MOCK_USERS.map(u => ({ ...u, isMe: false }));
      if (userName && userScore > 0) {
        const existing = mock.findIndex(u => u.id === 'me');
        const me = { id: 'me', name: userName, score: userScore, avatar: userAvatar || '⭐', isMe: true };
        if (existing >= 0) mock[existing] = me;
        else mock.push(me);
        mock.sort((a, b) => b.score - a.score);
      }
      setBoard(mock);
    }
    setLoading(false);
  }, [telegramId, userName, userScore, userAvatar]);

  useEffect(() => { load(period); }, [period]); // eslint-disable-line react-hooks/exhaustive-deps

  const myPosition = board ? board.findIndex(u => u.isMe) : -1;
  const top3 = board ? board.slice(0, 3) : [];
  const rest = board ? board.slice(3) : [];
  const podiumOrder = [1, 0, 2];

  const medalColors = {
    0: { bg: '#FFF7E0', border: '#F5D060', label: '🥇' },
    1: { bg: '#F3F4F6', border: '#D1D5DB', label: '🥈' },
    2: { bg: '#FFF4EE', border: '#FDBA74', label: '🥉' },
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
            <div className="rating-screen__header-sub">Топ учеников</div>
          </div>
        </div>
        <button className="rating-screen__refresh-btn" onClick={() => load(period)} disabled={loading}>
          <span>{loading ? '⏳' : '🔄'}</span>
          <span>{loading ? 'Загрузка...' : 'Обновить'}</span>
        </button>
      </div>

      {/* Period tabs */}
      <div className="rating-tabs">
        {PERIODS.map(p => (
          <button
            key={p.key}
            className={`rating-tab${period === p.key ? ' rating-tab--active' : ''}`}
            onClick={() => setPeriod(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* My position */}
      {myPosition >= 0 && (
        <div className="rating-screen__my-position">
          <span className="rating-screen__my-pos-label">Ваша позиция:</span>
          <span className="rating-screen__my-pos-rank">#{myPosition + 1}</span>
          <span className="rating-screen__my-pos-score">⭐ {userScore}</span>
        </div>
      )}

      {loading && (
        <div className="rating-loading">⏳ Загружаем рейтинг...</div>
      )}

      {!loading && board && (
        <>
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
            {board.map((user, idx) => (
              <div key={user.id} className={`rating-row${user.isMe ? ' rating-row--me' : ''}`}>
                <div className={`rating-row__rank${idx < 3 ? ' rating-row__rank--medal' : ''}`}>
                  {rankLabel(idx)}
                </div>
                <div className="rating-row__avatar">{user.avatar}</div>
                <div className="rating-row__info">
                  <div className="rating-row__name">
                    {user.name}
                    {user.isMe && <span className="rating-row__you-badge">Вы</span>}
                  </div>
                </div>
                <div className="rating-row__score">
                  <span className="rating-row__score-star">⭐</span>
                  <span className="rating-row__score-num">{user.score.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="rating-screen__footer">
        <span>🔄</span>
        <span>Обновляется в реальном времени</span>
      </div>
    </div>
  );
}
