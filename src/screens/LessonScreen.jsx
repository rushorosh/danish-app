import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { generateLessons } from '../data/course.js';
import './LessonScreen.css';

const TOTAL_LIVES = 5;

function playAz(text) {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=az&client=tw-ob&ttsspeed=0.8`;
  const audio = new Audio(url);
  audio.play().catch(() => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'tr-TR';
    u.rate = 0.8;
    window.speechSynthesis?.cancel();
    window.speechSynthesis?.speak(u);
  });
}

export default function LessonScreen({ moduleId, sectionId, mod, sec, onComplete, onClose }) {
  const lessons = useMemo(() => generateLessons(moduleId, sectionId), [moduleId, sectionId]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [lives, setLives] = useState(TOTAL_LIVES);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState('question'); // 'question' | 'correct' | 'wrong'

  // Choice state
  const [selectedOption, setSelectedOption] = useState(null);

  // Tiles state
  const [placedTiles, setPlacedTiles] = useState([]);
  const [availableTiles, setAvailableTiles] = useState([]);

  const lesson = lessons[currentIdx];
  const total = lessons.length;

  // Build tiles for tile-type lesson
  const allTiles = useMemo(() => {
    if (!lesson || lesson.type !== 'tiles') return [];
    const correctWords = lesson.word.ru.split(' ');
    const distractorWords = (lesson.distractors || [])
      .flatMap(d => d.ru.split(' '))
      .slice(0, 3);
    const all = [...correctWords, ...distractorWords].slice(0, 6);
    return [...all]
      .sort(() => Math.random() - 0.5)
      .map((w, i) => ({ id: i, word: w }));
  }, [currentIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset state when lesson changes
  useEffect(() => {
    setSelectedOption(null);
    setPhase('question');
    if (lesson?.type === 'tiles') {
      setAvailableTiles(allTiles);
      setPlacedTiles([]);
    }
  }, [currentIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build shuffled options for choice type (stable per lesson index)
  const choiceOptions = useMemo(() => {
    if (!lesson || lesson.type !== 'choice') return [];
    const correct = lesson.word;
    const distractors = (lesson.distractors || []).slice(0, 2);
    return [...distractors, correct].sort(() => Math.random() - 0.5);
  }, [currentIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const canCheck =
    lesson?.type === 'choice' ? !!selectedOption : placedTiles.length > 0;

  const handleCheck = useCallback(() => {
    if (!lesson) return;
    let correct = false;
    if (lesson.type === 'choice') {
      correct =
        selectedOption?.az === lesson.word.az ||
        selectedOption?.ru === lesson.word.ru;
    } else {
      const answer = placedTiles
        .map(t => t.word)
        .join(' ')
        .toLowerCase()
        .trim();
      const expected = lesson.word.ru.toLowerCase().trim();
      correct =
        answer === expected ||
        expected.includes(answer) ||
        answer.includes(expected);
    }
    if (correct) {
      setScore(s => s + 1);
      setPhase('correct');
    } else {
      setLives(l => Math.max(0, l - 1));
      setPhase('wrong');
    }
  }, [lesson, selectedOption, placedTiles]);

  const handleNext = useCallback(() => {
    if (currentIdx + 1 >= total || lives <= 0) {
      const passed = score / total >= 0.5 && lives > 0;
      onComplete(passed, score * 2);
    } else {
      setCurrentIdx(i => i + 1);
    }
  }, [currentIdx, total, lives, score, onComplete]);

  const handleTileTap = useCallback(
    (tile, fromPlaced) => {
      if (phase !== 'question') return;
      if (fromPlaced) {
        setPlacedTiles(p => p.filter(t => t.id !== tile.id));
        setAvailableTiles(a => [...a, tile]);
      } else {
        setAvailableTiles(a => a.filter(t => t.id !== tile.id));
        setPlacedTiles(p => [...p, tile]);
      }
    },
    [phase]
  );

  if (!lesson) return null;

  return (
    <div className="lesson-screen">
      {/* Top bar */}
      <div className="lesson-topbar">
        <button className="lesson-topbar__close" onClick={onClose}>✕</button>
        <div className="lesson-topbar__progress">
          <div className="lesson-progress-track">
            <div
              className="lesson-progress-fill"
              style={{
                width: `${(currentIdx / total) * 100}%`,
                background: mod.color,
              }}
            />
          </div>
        </div>
        <div className="lesson-topbar__lives">
          <span className="lesson-topbar__lives-icon">⚡</span>
          <span
            className="lesson-topbar__lives-count"
            style={{ color: lives <= 2 ? '#FF4B4B' : '#FF9600' }}
          >
            {lives}
          </span>
        </div>
      </div>

      {/* Task label */}
      <div className="lesson-task-label">
        {lesson.type === 'choice'
          ? 'Выберите правильный перевод'
          : 'Переведите слово'}
      </div>

      {/* Character + word bubble */}
      <div className="lesson-character-area">
        <div className="lesson-character">
          <span className="lesson-character__emoji">{sec?.mascot || '🦫'}</span>
        </div>
        <div className="lesson-bubble">
          <div className="lesson-bubble__word-row">
            <span className="lesson-bubble__word">{lesson.word.az}</span>
            <button
              className="lesson-audio-btn"
              onClick={() => playAz(lesson.word.az)}
              aria-label="Прослушать"
            >🔊</button>
          </div>
          <div className="lesson-bubble__trans">{lesson.word.transcription}</div>
        </div>
      </div>

      {/* Answer area */}
      <div className="lesson-answer-area">
        {lesson.type === 'choice' ? (
          <div className="lesson-options">
            {choiceOptions.map((opt, i) => {
              let cls = 'lesson-option';
              if (phase !== 'question') {
                if (opt.az === lesson.word.az) cls += ' lesson-option--correct';
                else if (selectedOption?.az === opt.az) cls += ' lesson-option--wrong';
              } else if (selectedOption?.az === opt.az) {
                cls += ' lesson-option--selected';
              }
              return (
                <button
                  key={i}
                  className={cls}
                  onClick={() => phase === 'question' && setSelectedOption(opt)}
                >
                  {opt.ru}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="lesson-tiles-area">
            {/* Placed tiles zone */}
            <div
              className={`lesson-placed-zone${
                phase === 'correct'
                  ? ' lesson-placed-zone--correct'
                  : phase === 'wrong'
                  ? ' lesson-placed-zone--wrong'
                  : ''
              }`}
            >
              {placedTiles.length === 0 && phase === 'question' && (
                <span className="lesson-placed-zone__hint">
                  Нажмите на слова ниже
                </span>
              )}
              {placedTiles.map(tile => (
                <button
                  key={tile.id}
                  className="lesson-tile lesson-tile--placed"
                  onClick={() => handleTileTap(tile, true)}
                >
                  {tile.word}
                </button>
              ))}
            </div>
            <div className="lesson-tiles-divider" />
            {/* Available tiles */}
            <div className="lesson-available-tiles">
              {availableTiles.map(tile => (
                <button
                  key={tile.id}
                  className="lesson-tile"
                  onClick={() => handleTileTap(tile, false)}
                >
                  {tile.word}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom area */}
      <div className="lesson-bottom">
        {phase === 'question' ? (
          <button
            className={`lesson-check-btn${canCheck ? ' lesson-check-btn--ready' : ''}`}
            onClick={handleCheck}
            disabled={!canCheck}
            style={canCheck ? { '--btn-shadow': mod.shadowColor } : {}}
          >
            ПРОВЕРИТЬ
          </button>
        ) : (
          <div className={`lesson-feedback-panel lesson-feedback-panel--${phase}`}>
            <div className="lesson-feedback-panel__header">
              <span className="lesson-feedback-panel__icon">
                {phase === 'correct' ? '✅' : '❌'}
              </span>
              <span className="lesson-feedback-panel__title">
                {phase === 'correct' ? 'Здорово!' : 'Неверно'}
              </span>
            </div>
            {phase === 'wrong' && (
              <div className="lesson-feedback-panel__answer">
                Правильный ответ: <strong>{lesson.word.ru}</strong>
              </div>
            )}
            <button
              className="lesson-feedback-panel__btn lesson-feedback-panel__btn--next"
              onClick={handleNext}
            >
              ДАЛЕЕ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
