import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { generateLessons, generateLessonsFromDB, TOPIC_MAP } from '../data/course.js';
import { speakAzerbaijani } from '../utils/tts.js';
import { recordActivity } from '../data/streak.js';
import { addKnownWords } from '../data/wordProgress.js';
import { fetchVocabulary, fetchSentencesByTopic } from '../data/api.js';
import './LessonScreen.css';

const TOTAL_LIVES = 5;

function playAz(text) { speakAzerbaijani(text, 0.85); }

export default function LessonScreen({ moduleId, sectionId, mod, sec, onComplete, onClose }) {
  const [lessons, setLessons] = useState(() => generateLessons(moduleId, sectionId));
  const [currentIdx, setCurrentIdx] = useState(0);

  // Load from Supabase DB if available, replace static lessons
  useEffect(() => {
    const topic = TOPIC_MAP[String(moduleId)];
    if (!topic) return;
    Promise.all([
      fetchVocabulary(topic, sectionId <= 2 ? 2 : 4),
      fetchSentencesByTopic(topic, sectionId >= 4 ? 5 : 3),
    ]).then(([dbWords, dbSentences]) => {
      if (dbWords && dbWords.length >= 3) {
        setLessons(generateLessonsFromDB(moduleId, sectionId, dbWords, dbSentences, dbWords));
      }
    }).catch(() => {});
  }, [moduleId, sectionId]); // eslint-disable-line react-hooks/exhaustive-deps
  const [lives, setLives] = useState(TOTAL_LIVES);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState('question'); // 'question' | 'correct' | 'wrong'
  const [selectedOption, setSelectedOption] = useState(null);
  const [placedTiles, setPlacedTiles] = useState([]);
  const [availableTiles, setAvailableTiles] = useState([]);

  const lesson = lessons[currentIdx];
  const total = lessons.length;

  const allTiles = useMemo(() => {
    if (!lesson || lesson.type !== 'tiles') return [];
    const correctWords = lesson.word.ru.split(' ');
    const distractorWords = (lesson.distractors || [])
      .flatMap(d => d.ru.split(' '))
      .slice(0, 3);
    return [...correctWords, ...distractorWords]
      .slice(0, 6)
      .sort(() => Math.random() - 0.5)
      .map((w, i) => ({ id: i, word: w }));
  }, [currentIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset state on lesson change + auto-play for introduce
  useEffect(() => {
    setSelectedOption(null);
    setPhase('question');
    if (lesson?.type === 'tiles') {
      setAvailableTiles(allTiles);
      setPlacedTiles([]);
    }
    if (lesson?.type === 'introduce') {
      setTimeout(() => playAz(lesson.word.az), 500);
    }
  }, [currentIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const choiceOptions = useMemo(() => {
    if (!lesson || lesson.type !== 'choice') return [];
    const correct = lesson.word;
    const distractors = (lesson.distractors || []).slice(0, 2);
    return [...distractors, correct].sort(() => Math.random() - 0.5);
  }, [currentIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const canCheck = (lesson?.type === 'choice' || lesson?.type === 'sentence')
    ? !!selectedOption
    : lesson?.type === 'tiles'
    ? placedTiles.length > 0
    : false;

  const handleNext = useCallback(() => {
    // Record introduced words to known vocabulary
    if (lesson?.type === 'introduce') {
      addKnownWords([lesson.word.az]);
    }
    if (currentIdx + 1 >= total || lives <= 0) {
      recordActivity();
      // Record all introduce words from this session
      const introduceWords = lessons
        .filter(l => l.type === 'introduce')
        .map(l => l.word.az);
      if (introduceWords.length) addKnownWords(introduceWords);
      const testable = Math.max(total - lessons.filter(l => l.type === 'introduce').length, 1);
      const passed = score / testable >= 0.5 && lives > 0;
      onComplete(passed, score * 2);
    } else {
      setCurrentIdx(i => i + 1);
    }
  }, [currentIdx, total, lives, score, lessons, lesson, onComplete]);

  const handleCheck = useCallback(() => {
    if (!lesson) return;
    let correct = false;
    if (lesson.type === 'choice' || lesson.type === 'sentence') {
      correct = selectedOption?.az === lesson.word.az || selectedOption?.ru === lesson.word.ru;
    } else if (lesson.type === 'tiles') {
      const answer = placedTiles.map(t => t.word).join(' ').toLowerCase().trim();
      const expected = lesson.word.ru.toLowerCase().trim();
      correct = answer === expected || expected.includes(answer) || answer.includes(expected);
    }
    if (correct) {
      setScore(s => s + 1);
      setPhase('correct');
    } else {
      setLives(l => Math.max(0, l - 1));
      setPhase('wrong');
    }
  }, [lesson, selectedOption, placedTiles]);

  const handleTileTap = useCallback((tile, fromPlaced) => {
    if (phase !== 'question') return;
    if (fromPlaced) {
      setPlacedTiles(p => p.filter(t => t.id !== tile.id));
      setAvailableTiles(a => [...a, tile]);
    } else {
      setAvailableTiles(a => a.filter(t => t.id !== tile.id));
      setPlacedTiles(p => [...p, tile]);
    }
  }, [phase]);

  if (!lesson) return null;

  const isIntroduce = lesson.type === 'introduce';

  return (
    <div className="lesson-screen">
      {/* Top bar */}
      <div className="lesson-topbar">
        <button className="lesson-topbar__close" onClick={onClose}>✕</button>
        <div className="lesson-topbar__progress">
          <div className="lesson-progress-track">
            <div
              className="lesson-progress-fill"
              style={{ width: `${(currentIdx / total) * 100}%`, background: mod.color }}
            />
          </div>
        </div>
        <div className="lesson-topbar__lives">
          <span className="lesson-topbar__lives-icon">⚡</span>
          <span className="lesson-topbar__lives-count" style={{ color: lives <= 2 ? '#FF4B4B' : '#FF9600' }}>
            {lives}
          </span>
        </div>
      </div>

      {/* INTRODUCE type: full card layout */}
      {isIntroduce ? (
        <>
          <div className="lesson-introduce-label">Новое слово</div>
          <div className="lesson-introduce-card" style={{ borderColor: mod.color }}>
            <div className="lesson-introduce-mascot">{sec?.mascot || '🦫'}</div>
            <div className="lesson-introduce-az">{lesson.word.az}</div>
            <div className="lesson-introduce-trans">{lesson.word.transcription}</div>
            <div className="lesson-introduce-ru">{lesson.word.ru}</div>
            <button
              className="lesson-introduce-audio"
              onClick={() => playAz(lesson.word.az)}
            >
              🔊 Послушать
            </button>
          </div>
          <div className="lesson-bottom">
            <button
              className="lesson-check-btn lesson-check-btn--ready lesson-check-btn--introduce"
              style={{ '--btn-shadow': mod.shadowColor, background: mod.color }}
              onClick={handleNext}
            >
              Понятно! →
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Task label */}
          <div className="lesson-task-label">
            {lesson.type === 'sentence'
              ? 'Переведите предложение'
              : lesson.type === 'choice'
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
                <button className="lesson-audio-btn" onClick={() => playAz(lesson.word.az)} aria-label="Прослушать">🔊</button>
              </div>
              <div className="lesson-bubble__trans">{lesson.word.transcription}</div>
            </div>
          </div>

          {/* Answer area */}
          <div className="lesson-answer-area">
            {(lesson.type === 'choice' || lesson.type === 'sentence') ? (
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
                    <button key={i} className={cls} onClick={() => phase === 'question' && setSelectedOption(opt)}>
                      {opt.ru}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="lesson-tiles-area">
                <div className={`lesson-placed-zone${phase === 'correct' ? ' lesson-placed-zone--correct' : phase === 'wrong' ? ' lesson-placed-zone--wrong' : ''}`}>
                  {placedTiles.length === 0 && phase === 'question' && (
                    <span className="lesson-placed-zone__hint">Нажмите на слова ниже</span>
                  )}
                  {placedTiles.map(tile => (
                    <button key={tile.id} className="lesson-tile lesson-tile--placed" onClick={() => handleTileTap(tile, true)}>
                      {tile.word}
                    </button>
                  ))}
                </div>
                <div className="lesson-tiles-divider" />
                <div className="lesson-available-tiles">
                  {availableTiles.map(tile => (
                    <button key={tile.id} className="lesson-tile" onClick={() => handleTileTap(tile, false)}>
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
                  <span className="lesson-feedback-panel__icon">{phase === 'correct' ? '✅' : '❌'}</span>
                  <span className="lesson-feedback-panel__title">{phase === 'correct' ? 'Здорово!' : 'Неверно'}</span>
                </div>
                {phase === 'wrong' && (
                  <div className="lesson-feedback-panel__answer">
                    Правильный ответ: <strong>{lesson.word.ru}</strong>
                  </div>
                )}
                <button className="lesson-feedback-panel__btn lesson-feedback-panel__btn--next" onClick={handleNext}>
                  ДАЛЕЕ
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
