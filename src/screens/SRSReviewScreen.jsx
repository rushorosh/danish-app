import React, { useState, useMemo, useCallback } from 'react';
import { getDueWords, recordReview } from '../data/srs.js';
import { WORDS } from '../data/vocabulary.js';
import { speakAzerbaijani } from '../utils/tts.js';
import './SRSReviewScreen.css';

export default function SRSReviewScreen({ onComplete, onBack }) {
  const dueWords = useMemo(() => {
    const due = getDueWords();
    return due.map(entry => {
      // Use stored ru/transcription first, fallback to WORDS lookup
      if (entry.ru) return { az: entry.az, ru: entry.ru, transcription: entry.transcription || '' };
      const full = WORDS.find(w => w.az.toLowerCase() === entry.az.toLowerCase());
      return full || null;
    }).filter(Boolean);
  }, []);

  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState('question');
  const [selected, setSelected] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [showTip, setShowTip] = useState(false);

  const word = dueWords[idx];
  const total = dueWords.length;

  const options = useMemo(() => {
    if (!word) return [];
    const distractors = WORDS
      .filter(w => w.az.toLowerCase() !== word.az.toLowerCase() && w.ru && w.ru !== '?')
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return [...distractors, word].sort(() => Math.random() - 0.5);
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = useCallback((opt) => {
    if (phase !== 'question') return;
    setSelected(opt);
    const correct = opt.az.toLowerCase() === word.az.toLowerCase();
    recordReview(word.az, correct);
    if (correct) setCorrectCount(c => c + 1);
    setPhase(correct ? 'correct' : 'wrong');
  }, [phase, word]);

  const handleNext = useCallback(() => {
    if (idx + 1 >= total) {
      onComplete(correctCount);
    } else {
      setIdx(i => i + 1);
      setPhase('question');
      setSelected(null);
      setShowTip(false);
    }
  }, [idx, total, onComplete, correctCount]);

  if (!word || total === 0) {
    return (
      <div className="srs-screen">
        <div className="srs-done">
          <div className="srs-done__emoji">🎉</div>
          <div className="srs-done__title">Повторение завершено!</div>
          <div className="srs-done__sub">Нечего повторять сегодня</div>
          <button className="srs-done__btn" onClick={onBack}>Назад</button>
        </div>
      </div>
    );
  }

  return (
    <div className="srs-screen">
      {/* Top bar */}
      <div className="srs-topbar">
        <button className="srs-topbar__close" onClick={onBack}>✕</button>
        <div className="srs-topbar__progress-track">
          <div
            className="srs-topbar__progress-fill"
            style={{ width: `${(idx / total) * 100}%` }}
          />
        </div>
        <div className="srs-topbar__count">{idx + 1}/{total}</div>
      </div>

      <div className="srs-task-label">Выберите перевод</div>

      {/* Word card */}
      <div className="srs-word-card">
        <div className="srs-word-card__az-wrap">
          <span
            className="srs-word-card__az"
            onClick={() => setShowTip(v => !v)}
          >
            {word.az}
          </span>
          {showTip && (
            <div className="srs-word-tip">{word.ru}</div>
          )}
        </div>
        {word.transcription && (
          <div className="srs-word-card__trans">{word.transcription}</div>
        )}
        <button
          className="srs-word-card__audio"
          onClick={() => speakAzerbaijani(word.az)}
        >🔊</button>
      </div>

      {/* Options */}
      <div className="srs-options">
        {options.map((opt, i) => {
          let cls = 'srs-option';
          if (phase !== 'question') {
            if (opt.az.toLowerCase() === word.az.toLowerCase()) cls += ' srs-option--correct';
            else if (selected?.az === opt.az) cls += ' srs-option--wrong';
          } else if (selected?.az === opt.az) {
            cls += ' srs-option--selected';
          }
          return (
            <button key={i} className={cls} onClick={() => handleSelect(opt)}>
              {opt.ru}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {phase !== 'question' && (
        <div className={`srs-feedback srs-feedback--${phase}`}>
          <div className="srs-feedback__row">
            <span>{phase === 'correct' ? '✅ Верно!' : `❌ Правильно: ${word.ru}`}</span>
            <button className="srs-feedback__next" onClick={handleNext}>ДАЛЕЕ →</button>
          </div>
        </div>
      )}
    </div>
  );
}
