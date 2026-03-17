import React, { useState, useCallback, useEffect } from 'react';
import { WORDS } from '../data/vocabulary.js';
import { speakAzerbaijani } from '../utils/tts.js';
import './ListeningGame.css';

const TOTAL = 8;

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function pickGameWords() {
  return shuffle(WORDS).slice(0, TOTAL);
}

function buildOptions(correct, allWords) {
  const wrong = shuffle(allWords.filter(w => w.az !== correct.az)).slice(0, 3);
  return shuffle([correct, ...wrong]);
}

function playAz(text) {
  speakAzerbaijani(text, 0.8);
}

export default function ListeningGame({ onBack, onScoreUpdate }) {
  const [gameWords] = useState(() => pickGameWords());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [phase, setPhase] = useState('question'); // 'question' | 'correct' | 'wrong'
  const [finished, setFinished] = useState(false);
  const [playing, setPlaying] = useState(false);

  const currentWord = gameWords[currentIndex];
  const options = React.useMemo(
    () => buildOptions(currentWord, WORDS),
    [currentIndex] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Auto-play audio when word changes
  useEffect(() => {
    const timer = setTimeout(() => {
      handlePlay();
    }, 400);
    return () => clearTimeout(timer);
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePlay = useCallback(() => {
    if (playing) return;
    setPlaying(true);
    playAz(currentWord.az);
    setTimeout(() => setPlaying(false), 3500);
  }, [currentWord, playing]);

  const handleSelect = useCallback((opt) => {
    if (phase !== 'question') return;
    setSelected(opt);
    const correct = opt.az === currentWord.az;
    setPhase(correct ? 'correct' : 'wrong');
    if (correct) setScore(s => s + 2);
  }, [phase, currentWord]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= TOTAL) {
      setFinished(true);
      onScoreUpdate?.(score + (phase === 'correct' ? 0 : 0));
    } else {
      setCurrentIndex(i => i + 1);
      setSelected(null);
      setPhase('question');
      setPlaying(false);
    }
  }, [currentIndex, score, phase, onScoreUpdate]);

  if (finished) {
    const pct = Math.round((score / (TOTAL * 2)) * 100);
    return (
      <div className="listening-screen">
        <div className="listening-result">
          <div className="listening-result__emoji">
            {pct >= 70 ? '🎧' : pct >= 40 ? '👏' : '💪'}
          </div>
          <div className="listening-result__title">
            {pct >= 70 ? 'Отлично!' : pct >= 40 ? 'Хорошо!' : 'Тренируйся!'}
          </div>
          <div className="listening-result__subtitle">Аудирование завершено</div>
          <div className="listening-result__score-ring">
            <div className="listening-result__score-num">{score}</div>
            <div className="listening-result__score-label">очков</div>
          </div>
          <div className="listening-result__earned">
            <span>⭐</span>
            <span>+{score} очков заработано</span>
          </div>
          <div className="listening-result__stats">
            <div className="listening-result__stat">
              <div className="listening-result__stat-val">{score / 2}</div>
              <div className="listening-result__stat-lbl">Верно</div>
            </div>
            <div className="listening-result__stat-divider" />
            <div className="listening-result__stat">
              <div className="listening-result__stat-val">{TOTAL - score / 2}</div>
              <div className="listening-result__stat-lbl">Ошибок</div>
            </div>
            <div className="listening-result__stat-divider" />
            <div className="listening-result__stat">
              <div className="listening-result__stat-val">{pct}%</div>
              <div className="listening-result__stat-lbl">Точность</div>
            </div>
          </div>
          <button className="listening-result__btn" onClick={() => { onScoreUpdate?.(score); onBack(); }}>
            В меню
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="listening-screen">
      {/* Top bar */}
      <div className="listening-topbar">
        <button className="listening-topbar__close" onClick={onBack}>✕</button>
        <div className="listening-topbar__center">
          <div className="listening-progress-bar">
            <div
              className="listening-progress-fill"
              style={{ width: `${(currentIndex / TOTAL) * 100}%` }}
            />
          </div>
          <span className="listening-progress-text">{currentIndex + 1}/{TOTAL}</span>
        </div>
        <div className="listening-score-badge">⭐ {score}</div>
      </div>

      <div className="listening-content">
        {/* Task label */}
        <div className="listening-task-label">Что означает это слово?</div>

        {/* Audio card */}
        <div className={`listening-audio-card${phase === 'correct' ? ' listening-audio-card--correct' : phase === 'wrong' ? ' listening-audio-card--wrong' : ''}`}>
          <button
            className={`listening-play-btn${playing ? ' listening-play-btn--playing' : ''}`}
            onClick={handlePlay}
            disabled={playing}
          >
            <span className="listening-play-btn__icon">{playing ? '🔈' : '🔊'}</span>
            <span className="listening-play-btn__label">
              {playing ? 'Воспроизводится...' : 'Прослушать слово'}
            </span>
          </button>

          {/* Show word after answer */}
          {phase !== 'question' && (
            <div className="listening-word-reveal">
              <div className="listening-word-reveal__az">{currentWord.az}</div>
              <div className="listening-word-reveal__transcription">{currentWord.transcription}</div>
            </div>
          )}
        </div>

        {/* Options */}
        <div className="listening-options">
          {options.map((opt, i) => {
            let cls = 'listening-option';
            if (phase !== 'question') {
              if (opt.az === currentWord.az) cls += ' listening-option--correct';
              else if (selected?.az === opt.az) cls += ' listening-option--wrong';
            } else if (selected?.az === opt.az) {
              cls += ' listening-option--selected';
            }
            return (
              <button
                key={i}
                className={cls}
                onClick={() => handleSelect(opt)}
                disabled={phase !== 'question'}
              >
                {opt.ru}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {phase !== 'question' && (
          <div className={`listening-feedback listening-feedback--${phase}`}>
            <span className="listening-feedback__icon">{phase === 'correct' ? '✅' : '❌'}</span>
            <span className="listening-feedback__text">
              {phase === 'correct' ? 'Верно! +2 очка' : `Правильно: ${currentWord.ru}`}
            </span>
          </div>
        )}

        {/* Continue */}
        {phase !== 'question' && (
          <button className="listening-continue" onClick={handleNext}>
            {currentIndex + 1 >= TOTAL ? 'Посмотреть результат' : 'Продолжить →'}
          </button>
        )}

        <div className="listening-tip">
          <span>💡</span>
          <span>Прослушай слово и выбери правильный перевод</span>
        </div>
      </div>
    </div>
  );
}
