import React, { useState, useCallback, useRef } from 'react';
import { useT } from '../data/LanguageContext.jsx';
import { speakAzerbaijani, speakText } from '../utils/tts.js';
import './TranslateScreen.css';

export default function TranslateScreen() {
  const t = useT('translate');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const [direction, setDirection] = useState('ru-az');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const debounceRef = useRef(null);
  const recognitionRef = useRef(null);

  const fromLang = direction === 'ru-az' ? 'ru' : 'az';
  const toLang   = direction === 'ru-az' ? 'az' : 'ru';
  const fromLabel = direction === 'ru-az' ? 'Русский' : 'Азербайджанский';
  const toLabel   = direction === 'ru-az' ? 'Азербайджанский' : 'Русский';
  const hasSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const translate = useCallback(async (text) => {
    if (!text.trim()) { setResult(''); setError(''); return; }
    setLoading(true);
    setError('');
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('network');
      const data = await res.json();
      const translated = data[0]?.map(item => item[0]).filter(Boolean).join('') || '';
      if (translated) { setResult(translated); return; }
      throw new Error('empty');
    } catch {
      try {
        const url2 = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`;
        const res2 = await fetch(url2);
        const data2 = await res2.json();
        if (data2.responseStatus === 200 && data2.responseData.translatedText) {
          setResult(data2.responseData.translatedText);
        } else throw new Error('fail');
      } catch {
        setError(t('error'));
        setResult('');
      }
    } finally {
      setLoading(false);
    }
  }, [fromLang, toLang, t]);

  const startVoice = useCallback(() => {
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    if (!hasSpeechRecognition) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = fromLang === 'ru' ? 'ru-RU' : 'az-AZ';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (e) => {
      let interim = '', final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      if (interim) setInputText(interim);
      if (final) {
        setInputText(final);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => translate(final), 300);
      }
    };
    recognitionRef.current = recognition;
    recognition.start();
  }, [listening, fromLang, translate]);

  const handleSpeakResult = () => {
    if (!result) return;
    if (toLang === 'az') speakAzerbaijani(result);
    else speakText(result, 'ru');
  };

  const handleInput = (e) => {
    const val = e.target.value;
    setInputText(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => translate(val), 800);
  };

  const handleSwap = () => {
    setDirection(d => d === 'ru-az' ? 'az-ru' : 'ru-az');
    setResult(''); setInputText(''); setError('');
  };

  const handleTranslateBtn = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    translate(inputText);
  };

  const handleClear = () => { setInputText(''); setResult(''); setError(''); };

  return (
    <div className="translate-screen">
      <div className="translate-screen__header">
        <span className="translate-screen__header-icon">🌐</span>
        <span className="translate-screen__header-title">{t('title')}</span>
      </div>

      <div className="translate-screen__card">
        {/* Direction row */}
        <div className="translate-screen__direction">
          <div className="translate-screen__lang-label">
            <span className="translate-screen__lang-dot translate-screen__lang-dot--from" />
            {fromLabel}
          </div>
          <button className="translate-screen__swap-btn" onClick={handleSwap}>
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
            placeholder={direction === 'ru-az' ? t('placeholder_ru') : t('placeholder_az')}
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
          {loading ? <span className="translate-screen__spinner" /> : <><span>{t('btn')}</span><span className="translate-screen__btn-arrow">→</span></>}
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
              <span className="translate-screen__result-hint">{t('translating')}</span>
            </div>
          ) : error ? (
            <div className="translate-screen__error">
              <span className="translate-screen__error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          ) : result ? (
            <div className="translate-screen__result-row">
              <div className="translate-screen__result-text">{result}</div>
              <button className="translate-screen__speak-btn" onClick={handleSpeakResult} title="Прослушать">
                🔊
              </button>
            </div>
          ) : (
            <div className="translate-screen__placeholder">{t('result_ph')}</div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="translate-screen__tips">
        <div className="translate-screen__tip">
          <span className="translate-screen__tip-icon">💡</span>
          <span>Попробуй: <strong>{t('tip1_txt')}</strong></span>
        </div>
        <div className="translate-screen__tip">
          <span className="translate-screen__tip-icon">🔤</span>
          <span>{t('tip2')}</span>
        </div>
      </div>
    </div>
  );
}
