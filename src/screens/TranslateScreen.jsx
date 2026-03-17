import React, { useState, useCallback, useRef } from 'react';
import './TranslateScreen.css';

export default function TranslateScreen() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const [direction, setDirection] = useState('ru-az'); // 'ru-az' | 'az-ru'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const debounceRef = useRef(null);
  const recognitionRef = useRef(null);

  const fromLang = direction === 'ru-az' ? 'ru' : 'az';
  const hasSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const startVoice = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    if (!hasSpeechRecognition) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = fromLang === 'ru' ? 'ru-RU' : 'az-AZ';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (e) => {
      const spoken = e.results[0][0].transcript;
      setInputText(spoken);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => translate(spoken), 300);
    };
    recognitionRef.current = recognition;
    recognition.start();
  }, [listening, fromLang]); // eslint-disable-line react-hooks/exhaustive-deps

  const toLang = direction === 'ru-az' ? 'az' : 'ru';
  const fromLabel = direction === 'ru-az' ? 'Русский' : 'Азербайджанский';
  const toLabel = direction === 'ru-az' ? 'Азербайджанский' : 'Русский';

  const translate = useCallback(async (text) => {
    if (!text.trim()) {
      setResult('');
      setError('');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Google Translate unofficial API — лучшее качество для az↔ru
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Ошибка сети');
      const data = await res.json();
      // Ответ: [[["перевод","оригинал",...],...],...]
      const translated = data[0]?.map(item => item[0]).filter(Boolean).join('') || '';
      if (translated) {
        setResult(translated);
      } else {
        throw new Error('Пустой ответ от переводчика');
      }
    } catch (e) {
      // Fallback: MyMemory
      try {
        const url2 = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`;
        const res2 = await fetch(url2);
        const data2 = await res2.json();
        if (data2.responseStatus === 200 && data2.responseData.translatedText) {
          setResult(data2.responseData.translatedText);
        } else {
          throw new Error('Ошибка перевода');
        }
      } catch {
        setError('Не удалось выполнить перевод. Проверь интернет-соединение.');
        setResult('');
      }
    } finally {
      setLoading(false);
    }
  }, [fromLang, toLang]);

  const handleInput = (e) => {
    const val = e.target.value;
    setInputText(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      translate(val);
    }, 800);
  };

  const handleSwap = () => {
    setDirection(d => d === 'ru-az' ? 'az-ru' : 'ru-az');
    setResult('');
    setInputText('');
    setError('');
  };

  const handleTranslateBtn = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    translate(inputText);
  };

  const handleClear = () => {
    setInputText('');
    setResult('');
    setError('');
  };

  return (
    <div className="translate-screen">
      <div className="translate-screen__header">
        <span className="translate-screen__header-icon">🌐</span>
        <span className="translate-screen__header-title">Переводчик</span>
      </div>

      <div className="translate-screen__card">
        {/* Direction row */}
        <div className="translate-screen__direction">
          <div className="translate-screen__lang-label">
            <span className="translate-screen__lang-dot translate-screen__lang-dot--from" />
            {fromLabel}
          </div>
          <button className="translate-screen__swap-btn" onClick={handleSwap} title="Поменять направление">
            <span className="translate-screen__swap-icon">⇄</span>
          </button>
          <div className="translate-screen__lang-label translate-screen__lang-label--to">
            <span className="translate-screen__lang-dot translate-screen__lang-dot--to" />
            {toLabel}
          </div>
        </div>

        {/* Input area */}
        <div className="translate-screen__input-wrap">
          <textarea
            className="translate-screen__input"
            placeholder={direction === 'ru-az' ? 'Введите текст на русском...' : 'Azerbaycan dilini daxil edin...'}
            value={inputText}
            onChange={handleInput}
            rows={4}
            maxLength={500}
          />
          <div className="translate-screen__input-actions">
            {hasSpeechRecognition && (
              <button
                className={`translate-screen__mic-btn${listening ? ' translate-screen__mic-btn--active' : ''}`}
                onClick={startVoice}
                title={listening ? 'Остановить' : 'Голосовой ввод'}
              >
                {listening ? '⏹' : '🎙️'}
              </button>
            )}
            {inputText.length > 0 && (
              <button className="translate-screen__clear-btn" onClick={handleClear}>✕</button>
            )}
          </div>
          <div className="translate-screen__char-count">{inputText.length}/500</div>
        </div>

        {/* Translate button */}
        <button
          className="translate-screen__translate-btn"
          onClick={handleTranslateBtn}
          disabled={loading || !inputText.trim()}
        >
          {loading ? (
            <span className="translate-screen__spinner" />
          ) : (
            <>
              <span>Перевести</span>
              <span className="translate-screen__btn-arrow">→</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="translate-screen__divider">
          <span className="translate-screen__divider-label">{toLabel}</span>
        </div>

        {/* Result area */}
        <div className={`translate-screen__result${loading ? ' translate-screen__result--loading' : ''}${result ? ' translate-screen__result--has-content' : ''}`}>
          {loading ? (
            <div className="translate-screen__result-spinner">
              <span className="translate-screen__spinner translate-screen__spinner--lg" />
              <span className="translate-screen__result-hint">Переводим...</span>
            </div>
          ) : error ? (
            <div className="translate-screen__error">
              <span className="translate-screen__error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          ) : result ? (
            <div className="translate-screen__result-text">{result}</div>
          ) : (
            <div className="translate-screen__placeholder">Перевод появится здесь...</div>
          )}
        </div>
      </div>

      {/* Tips card */}
      <div className="translate-screen__tips">
        <div className="translate-screen__tip">
          <span className="translate-screen__tip-icon">💡</span>
          <span>Попробуй: <strong>«Salam»</strong> → Привет</span>
        </div>
        <div className="translate-screen__tip">
          <span className="translate-screen__tip-icon">🔤</span>
          <span>Переводи фразы и целые предложения</span>
        </div>
      </div>

      <div className="translate-screen__powered">
        Powered by MyMemory Translation API
      </div>
    </div>
  );
}
