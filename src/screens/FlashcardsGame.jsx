import React, { useState, useMemo, useCallback } from 'react';
import { WORDS } from '../data/vocabulary.js';
import { speakAzerbaijani } from '../utils/tts.js';
import './FlashcardsGame.css';

const TOTAL = 10;

function playAz(text) {
  speakAzerbaijani(text, 0.85);
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function pickGameWords() {
  return shuffle(WORDS).slice(0, TOTAL);
}

function buildOptions(correct, allWords) {
  const wrong = allWords.filter(w => w.az !== correct.az);
  const shuffledWrong = shuffle(wrong).slice(0, 3);
  return shuffle([correct, ...shuffledWrong]);
}

export default function FlashcardsGame({ onBack, onScoreUpdate }) {
  const [gameWords] = useState(() => pickGameWords());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);

  // direction: randomly az→ru or ru→az
  const [directions] = useState(() =>
    gameWords.map(() => Math.random() > 0.5 ? 'az-ru' : 'ru-az')
  );

  const currentWord = gameWords[currentIndex];
  const direction = directions[currentIndex];

  const options = useMemo(() => {
    if (!currentWord) return [];
    return buildOptions(currentWord, WORDS);
  }, [currentIndex]);

  const displayQuestion = direction === 'az-ru' ? currentWord?.az : currentWord?.ru;
  const displayLabel = direction === 'az-ru' ? 'Азербайджанский' : 'Русский';
  const answerLabel = direction === 'az-ru' ? 'Русский' : 'Азербайджанский';

  const handleAnswer = useCallback((option) => {
    if (showResult) return;
    const correct = direction === 'az-ru'
      ? option.ru === currentWord.ru
      : option.az === currentWord.az;
    const answerKey = direction === 'az-ru' ? option.ru : option.az;
    setSelectedAnswer(answerKey);
    setIsCorrect(correct);
    setShowResult(true);
    if (correct) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
  }, [showResult, direction, currentWord]);

  const handleContinue = useCallback(() => {
    if (currentIndex + 1 >= TOTAL) {
      setFinished(true);
      onScoreUpdate && onScoreUpdate(score + (isCorrect ? 0 : 0));
    } else {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowResult(false);
    }
  }, [currentIndex, score, isCorrect, onScoreUpdate]);

  const handleRestart = () => {
    window.location.reload();
  };

  const handleDone = () => {
    onScoreUpdate && onScoreUpdate(score);
    onBack();
  };

  if (finished) {
    const pct = Math.round((score / TOTAL) * 100);
    return (
      <div className="flashcards-screen">
        <div className="flashcards-result">
          <div className="flashcards-result__emoji">
            {pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}
          </div>
          <div className="flashcards-result__title">
            {pct >= 80 ? 'Великолепно!' : pct >= 50 ? 'Хорошо!' : 'Ещё раз!'}
          </div>
          <div className="flashcards-result__subtitle">Карточки завершены</div>
          <div className="flashcards-result__score-ring">
            <div className="flashcards-result__score-num">{score}</div>
            <div className="flashcards-result__score-denom">/{TOTAL}</div>
          </div>
          <div className="flashcards-result__earned">
            <span>⭐</span>
            <span>+{score} очков заработано</span>
          </div>
          <div className="flashcards-result__stats">
            <div className="flashcards-result__stat">
              <div className="flashcards-result__stat-val">{score}</div>
              <div className="flashcards-result__stat-lbl">Правильно</div>
            </div>
            <div className="flashcards-result__stat-divider" />
            <div className="flashcards-result__stat">
              <div className="flashcards-result__stat-val">{TOTAL - score}</div>
              <div className="flashcards-result__stat-lbl">Ошибок</div>
            </div>
            <div className="flashcards-result__stat-divider" />
            <div className="flashcards-result__stat">
              <div className="flashcards-result__stat-val">{pct}%</div>
              <div className="flashcards-result__stat-lbl">Точность</div>
            </div>
          </div>
          <button className="flashcards-result__btn" onClick={handleDone}>
            В меню
          </button>
          <button className="flashcards-result__btn-secondary" onClick={handleRestart}>
            Сыграть снова
          </button>
        </div>
      </div>
    );
  }

  const correctAnswerKey = direction === 'az-ru' ? currentWord?.ru : currentWord?.az;

  return (
    <div className="flashcards-screen">
      {/* Top bar */}
      <div className="flashcards-topbar">
        <button className="flashcards-topbar__close" onClick={onBack}>✕</button>
        <div className="flashcards-topbar__center">
          <div className="flashcards-progress-bar">
            <div
              className="flashcards-progress-fill"
              style={{ width: `${(currentIndex / TOTAL) * 100}%` }}
            />
          </div>
          <span className="flashcards-progress-text">{currentIndex + 1}/{TOTAL}</span>
        </div>
        <div className="flashcards-topbar__badges">
          {streak >= 2 && (
            <div className="flashcards-streak">🔥 {streak}</div>
          )}
          <div className="flashcards-score-badge">⭐ {score}</div>
        </div>
      </div>

      {/* Card */}
      <div className="flashcards-card-wrap">
        <div className={`flashcards-card${showResult ? (isCorrect ? ' flashcards-card--correct' : ' flashcards-card--wrong') : ''}`}>
          <div className="flashcards-card__label">{displayLabel}</div>
          <div className="flashcards-card__word-row">
            <span className="flashcards-card__word">{displayQuestion}</span>
            {direction === 'az-ru' && (
              <button
                className="flashcards-audio-btn"
                onClick={() => playAz(currentWord.az)}
                aria-label="Прослушать"
              >🔊</button>
            )}
          </div>
          {direction === 'az-ru' && currentWord?.transcription && (
            <div className="flashcards-card__transcription">{currentWord.transcription}</div>
          )}
          <div className="flashcards-card__prompt">Выбери перевод на {answerLabel === 'Русский' ? 'русский' : 'азербайджанский'}:</div>
        </div>

        {/* Options */}
        <div className="flashcards-options">
          {options.map((opt, i) => {
            const optKey = direction === 'az-ru' ? opt.ru : opt.az;
            let cls = 'flashcards-option';
            if (showResult) {
              if (optKey === correctAnswerKey) cls += ' flashcards-option--correct';
              else if (optKey === selectedAnswer) cls += ' flashcards-option--wrong';
            } else if (optKey === selectedAnswer) {
              cls += ' flashcards-option--selected';
            }
            return (
              <button
                key={i}
                className={cls}
                onClick={() => handleAnswer(opt)}
                disabled={showResult}
              >
                <span className="flashcards-option__letter">{String.fromCharCode(65 + i)}</span>
                <span className="flashcards-option__text">{optKey}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {showResult && (
          <div className={`flashcards-feedback${isCorrect ? ' flashcards-feedback--correct' : ' flashcards-feedback--wrong'}`}>
            <span className="flashcards-feedback__icon">{isCorrect ? '✅' : '❌'}</span>
            <div className="flashcards-feedback__content">
              <div className="flashcards-feedback__title">
                {isCorrect ? 'Верно!' : 'Неверно'}
              </div>
              {!isCorrect && (
                <div className="flashcards-feedback__hint">
                  Правильный ответ: <strong>{correctAnswerKey}</strong>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Continue button */}
        {showResult && (
          <button className="flashcards-continue" onClick={handleContinue}>
            {currentIndex + 1 >= TOTAL ? 'Посмотреть результат' : 'Продолжить'}
          </button>
        )}
      </div>
    </div>
  );
}
