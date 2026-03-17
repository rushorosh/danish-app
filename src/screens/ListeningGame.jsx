import React, { useState, useCallback, useRef } from 'react';
import { WORDS } from '../data/vocabulary.js';
import './ListeningGame.css';

const TOTAL = 8;

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function pickGameWords() {
  return shuffle(WORDS).slice(0, TOTAL);
}

const hasSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
const hasSpeechSynthesis = !!window.speechSynthesis;

export default function ListeningGame({ onBack, onScoreUpdate }) {
  const [gameWords] = useState(() => pickGameWords());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [listening, setListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [finished, setFinished] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(false);
  const recognitionRef = useRef(null);

  const currentWord = gameWords[currentIndex];

  const speakWord = useCallback(() => {
    if (playingAudio) return;
    setPlayingAudio(true);
    // Google TTS — лучшее качество для азербайджанского
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(currentWord.az)}&tl=az&client=tw-ob&ttsspeed=0.7`;
    const audio = new Audio(url);
    audio.onended = () => setPlayingAudio(false);
    audio.onerror = () => {
      // Fallback: Web Speech API с турецким (ближайший язык)
      setPlayingAudio(false);
      if (window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(currentWord.az);
        u.lang = 'tr-TR';
        u.rate = 0.75;
        u.onend = () => setPlayingAudio(false);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
        setPlayingAudio(true);
      }
    };
    audio.play().catch(() => {
      setPlayingAudio(false);
    });
  }, [currentWord, playingAudio]);

  const checkAnswer = useCallback((spoken) => {
    const norm = (s) => s.toLowerCase().trim()
      .replace(/[.,!?]/g, '');
    const spokenNorm = norm(spoken);
    const correctNorm = norm(currentWord.az);
    const correct = spokenNorm.includes(correctNorm) || correctNorm.includes(spokenNorm) || spokenNorm === correctNorm;
    setSpokenText(spoken);
    setIsCorrect(correct);
    setShowResult(true);
    if (correct) setScore(s => s + 2);
  }, [currentWord]);

  const startListening = useCallback(() => {
    if (!hasSpeechRecognition) {
      setShowManual(true);
      return;
    }
    if (listening) return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'az-AZ';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = (e) => {
      setListening(false);
      // On error, offer manual fallback
      setShowManual(true);
    };
    recognition.onresult = (e) => {
      // Try all alternatives
      let best = '';
      for (let i = 0; i < e.results[0].length; i++) {
        const candidate = e.results[0][i].transcript.toLowerCase().trim();
        const correctNorm = currentWord.az.toLowerCase().trim();
        if (candidate.includes(correctNorm) || correctNorm.includes(candidate)) {
          best = candidate;
          break;
        }
        if (!best) best = candidate;
      }
      checkAnswer(best);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [listening, checkAnswer, currentWord]);

  const handleManualCheck = () => {
    if (!manualInput.trim()) return;
    checkAnswer(manualInput.trim());
    setManualInput('');
    setShowManual(false);
  };

  const handleSkip = () => {
    setSpokenText('');
    setIsCorrect(false);
    setShowResult(true);
  };

  const handleContinue = () => {
    if (currentIndex + 1 >= TOTAL) {
      setFinished(true);
      onScoreUpdate && onScoreUpdate(score);
    } else {
      setCurrentIndex(i => i + 1);
      setIsCorrect(null);
      setShowResult(false);
      setSpokenText('');
      setManualInput('');
      setShowManual(false);
      setPlayingAudio(false);
    }
  };

  const handleDone = () => {
    onScoreUpdate && onScoreUpdate(score);
    onBack();
  };

  if (finished) {
    const pct = Math.round((score / (TOTAL * 2)) * 100);
    return (
      <div className="listening-screen">
        <div className="listening-result">
          <div className="listening-result__emoji">
            {pct >= 70 ? '🎤' : pct >= 40 ? '👏' : '💪'}
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
          <button className="listening-result__btn" onClick={handleDone}>В меню</button>
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
        {/* Word card */}
        <div className={`listening-card${showResult ? (isCorrect ? ' listening-card--correct' : ' listening-card--wrong') : ''}`}>
          <div className="listening-card__label">Азербайджанское слово</div>
          <div className="listening-card__word">{currentWord.az}</div>
          <div className="listening-card__transcription">{currentWord.transcription}</div>
          <div className="listening-card__translation">{currentWord.ru}</div>
        </div>

        {/* Action buttons */}
        {!showResult && (
          <div className="listening-actions">
            <button
              className={`listening-btn listening-btn--speak${playingAudio ? ' listening-btn--playing' : ''}`}
              onClick={speakWord}
              disabled={playingAudio}
            >
              <span className="listening-btn__icon">{playingAudio ? '🔈' : '🔊'}</span>
              <span>{playingAudio ? 'Воспроизводится...' : 'Прослушать'}</span>
            </button>

            <button
              className={`listening-btn listening-btn--mic${listening ? ' listening-btn--listening' : ''}`}
              onClick={startListening}
              disabled={listening || showResult}
            >
              <span className="listening-btn__icon">{listening ? '⏸' : '🎙️'}</span>
              <span>{listening ? 'Слушаю...' : 'Произнести'}</span>
            </button>

            {!hasSpeechRecognition && (
              <div className="listening-no-sr">
                <span>⚠️</span>
                <span>Распознавание речи не поддерживается в этом браузере</span>
              </div>
            )}

            {showManual && (
              <div className="listening-manual">
                <div className="listening-manual__label">Введите слово вручную:</div>
                <div className="listening-manual__row">
                  <input
                    className="listening-manual__input"
                    type="text"
                    placeholder="Введите азербайджанское слово..."
                    value={manualInput}
                    onChange={e => setManualInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleManualCheck(); }}
                    autoFocus
                  />
                  <button className="listening-manual__btn" onClick={handleManualCheck} disabled={!manualInput.trim()}>
                    OK
                  </button>
                </div>
              </div>
            )}

            <button className="listening-skip" onClick={handleSkip}>
              Пропустить
            </button>
          </div>
        )}

        {/* Result feedback */}
        {showResult && (
          <div className={`listening-feedback${isCorrect ? ' listening-feedback--correct' : ' listening-feedback--wrong'}`}>
            <div className="listening-feedback__icon">{isCorrect ? '✅' : '❌'}</div>
            <div className="listening-feedback__content">
              <div className="listening-feedback__title">
                {isCorrect ? 'Отличное произношение! +2 очка' : 'Не совсем верно'}
              </div>
              {spokenText && (
                <div className="listening-feedback__spoken">
                  Вы сказали: <em>«{spokenText}»</em>
                </div>
              )}
              {!isCorrect && (
                <div className="listening-feedback__correct">
                  Правильно: <strong>{currentWord.az}</strong>
                </div>
              )}
            </div>
          </div>
        )}

        {showResult && (
          <button className="listening-continue" onClick={handleContinue}>
            {currentIndex + 1 >= TOTAL ? 'Посмотреть результат' : 'Продолжить'}
          </button>
        )}

        {/* Tip */}
        <div className="listening-tip">
          <span>💡</span>
          <span>Сначала прослушай слово, затем попробуй его произнести</span>
        </div>
      </div>
    </div>
  );
}
