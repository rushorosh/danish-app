import React, { useState, useMemo } from 'react';
import { getKnownWords } from '../data/wordProgress.js';
import { getDueCount, getSRSEntry } from '../data/srs.js';
import { WORDS } from '../data/vocabulary.js';
import './VocabScreen.css';

const TOPIC_LABELS = {
  greetings: 'Приветствия',
  numbers: 'Числа и цвета',
  daily: 'Время и быт',
  family: 'Семья и дом',
  places: 'Город',
  verbs: 'Глаголы',
  communication: 'Общение',
  work: 'Работа',
  food: 'Еда',
  nature: 'Природа',
  adjectives: 'Тело и прилаг.',
  culture: 'Культура',
};

export default function VocabScreen({ onStartReview }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const knownSet = useMemo(() => getKnownWords(), []);
  const dueCount = useMemo(() => getDueCount(), []);

  // All known words with full data
  const knownWords = useMemo(() => {
    return WORDS.filter(w => knownSet.has(w.az.toLowerCase()));
  }, [knownSet]);

  const topics = useMemo(() => {
    const counts = {};
    for (const w of knownWords) {
      counts[w.topic] = (counts[w.topic] || 0) + 1;
    }
    return counts;
  }, [knownWords]);

  const filtered = useMemo(() => {
    let list = filter === 'all' ? knownWords : knownWords.filter(w => w.topic === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(w =>
        w.az.toLowerCase().includes(q) ||
        w.ru.toLowerCase().includes(q) ||
        (w.transcription || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [knownWords, filter, search]);

  return (
    <div className="vocab-screen">
      {/* Header */}
      <div className="vocab-header">
        <div className="vocab-header__title">Мой словарь</div>
        <div className="vocab-header__count">{knownWords.length} слов</div>
      </div>

      {/* SRS review button */}
      {dueCount > 0 ? (
        <button className="vocab-review-btn" onClick={onStartReview}>
          <span className="vocab-review-btn__icon">🔁</span>
          <div className="vocab-review-btn__text">
            <div className="vocab-review-btn__title">Повторить сегодня</div>
            <div className="vocab-review-btn__sub">{dueCount} {dueCount === 1 ? 'слово' : dueCount < 5 ? 'слова' : 'слов'} ждут повторения</div>
          </div>
          <span className="vocab-review-btn__arrow">→</span>
        </button>
      ) : (
        <div className="vocab-review-done">
          ✅ Повторение на сегодня выполнено
        </div>
      )}

      {/* Search */}
      <div className="vocab-search-wrap">
        <span className="vocab-search-icon">🔍</span>
        <input
          className="vocab-search"
          placeholder="Поиск по словам..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className="vocab-search-clear" onClick={() => setSearch('')}>✕</button>
        )}
      </div>

      {/* Topic filter chips */}
      <div className="vocab-filters">
        <button
          className={`vocab-filter-chip${filter === 'all' ? ' vocab-filter-chip--active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Все ({knownWords.length})
        </button>
        {Object.entries(topics).map(([topic, count]) => (
          <button
            key={topic}
            className={`vocab-filter-chip${filter === topic ? ' vocab-filter-chip--active' : ''}`}
            onClick={() => setFilter(topic)}
          >
            {TOPIC_LABELS[topic] || topic} ({count})
          </button>
        ))}
      </div>

      {/* Word list */}
      <div className="vocab-list">
        {filtered.length === 0 ? (
          <div className="vocab-empty">
            {knownWords.length === 0
              ? 'Пройди первые уроки, чтобы слова появились здесь'
              : 'Ничего не найдено'}
          </div>
        ) : (
          filtered.map((word, i) => {
            const srs = getSRSEntry(word.az);
            const isDue = srs && srs.nextReview <= Date.now();
            return (
              <div key={i} className={`vocab-word${isDue ? ' vocab-word--due' : ''}`}>
                <div className="vocab-word__left">
                  <div className="vocab-word__az">{word.az}</div>
                  {word.transcription && (
                    <div className="vocab-word__trans">{word.transcription}</div>
                  )}
                </div>
                <div className="vocab-word__right">
                  <div className="vocab-word__ru">{word.ru}</div>
                  {srs && (
                    <div className="vocab-word__srs">
                      {'▓'.repeat(srs.box)}{'░'.repeat(5 - srs.box)}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
