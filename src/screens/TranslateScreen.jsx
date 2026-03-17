import React, { useState, useCallback, useRef } from 'react';
import { useT } from '../data/LanguageContext.jsx';
import { speakAzerbaijani, speakText } from '../utils/tts.js';
import './TranslateScreen.css';

const LANGS = [
  { code: 'ru', name: 'Русский',     flag: '🇷🇺', speech: 'ru-RU' },
  { code: 'az', name: 'Azərbaycan', flag: '🇦🇿', speech: 'az-AZ' },
  { code: 'en', name: 'English',     flag: '🇬🇧', speech: 'en-US' },
  { code: 'de', name: 'Deutsch',     flag: '🇩🇪', speech: 'de-DE' },
  { code: 'es', name: 'Español',     flag: '🇪🇸', speech: 'es-ES' },
  { code: 'fr', name: 'Français',    flag: '🇫🇷', speech: 'fr-FR' },
  { code: 'zh', name: '中文',         flag: '🇨🇳', speech: 'zh-CN' },
];

function getLang(code) { return LANGS.find(l => l.code === code) || LANGS[0]; }

export default function TranslateScreen() {
  const t = useT('translate');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const [fromCode, setFromCode] = useState('ru');
  const [toCode, setToCode] = useState('az');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const debounceRef = useRef(null);
  const recognitionRef = useRef(null);

  const hasSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const translate = useCallback(async (text, from, to) => {
    if (!text.trim()) { setResult(''); setError(''); return; }
    setLoading(true);
    setError('');
    // Map zh → zh-CN for Google Translate
    const slCode = from === 'zh' ? 'zh-CN' : from;
    const tlCode = to === 'zh' ? 'zh-CN' : to;
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${slCode}&tl=${tlCode}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('network');
      const data = await res.json();
      const translated = data[0]?.map(item => item[0]).filter(Boolean).join('') || '';
      if (translated) { setResult(translated); setLoading(false); return; }
      throw new Error('empty');
    } catch {
      try {
        const url2 = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${slCode}|${tlCode}`;
        const res2 = await fetch(url2);
        const data2 = await res2.json();
        if (data2.responseStatus === 200 && data2.responseData.translatedText) {
          setResult(data2.responseData.translatedText);
        } else throw new Error('fail');
      } catch {
        setError(t('error'));
        setResult('');
      }
    }
    setLoading(false);
  }, [t]);

  const startVoice = useCallback(() => {
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    if (!hasSpeechRecognition) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = getLang(fromCode).speech;
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
        debounceRef.current = setTimeout(() => translate(final, fromCode, toCode), 300);
      }
    };
    recognitionRef.current = recognition;
    recognition.start();
  }, [listening, fromCode, toCode, translate]);

  const handleSpeakResult = () => {
    if (!result) return;
    if (toCode === 'az') speakAzerbaijani(result);
    else speakText(result, toCode);
  };

  const handleFromChange = (e) => {
    const code = e.target.value;
    setFromCode(code);
    // If same as toCode, swap toCode to a different language
    if (code === toCode) {
      setToCode(fromCode);
    }
    setResult(''); setInputText(''); setError('');
  };

  const handleToChange = (e) => {
    const code = e.target.value;
    setToCode(code);
    if (code === fromCode) setFromCode(toCode);
    setResult(''); setError('');
  };

  const handleSwap = () => {
    setFromCode(toCode);
    setToCode(fromCode);
    setInputText(result);
    setResult('');
    setError('');
    if (result) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => translate(result, toCode, fromCode), 400);
    }
  };

  const handleInput = (e) => {
    const val = e.target.value;
    setInputText(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => translate(val, fromCode, toCode), 800);
  };

  const handleTranslateBtn = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    translate(inputText, fromCode, toCode);
  };

  const handleClear = () => { setInputText(''); setResult(''); setError(''); };

  const fromLang = getLang(fromCode);
  const toLang = getLang(toCode);

  return (
    <div className="translate-screen">
      <div className="translate-screen__header">
        <span className="translate-screen__header-icon">🌐</span>
        <span className="translate-screen__header-title">{t('title')}</span>
      </div>

      <div className="translate-screen__card">
        {/* Language selector row */}
        <div className="translate-screen__direction">
          <div className="translate-screen__lang-select-wrap">
            <span className="translate-screen__lang-flag">{fromLang.flag}</span>
            <select
              className="translate-screen__lang-select"
              value={fromCode}
              onChange={handleFromChange}
            >
              {LANGS.map(l => (
                <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
              ))}
            </select>
          </div>

          <button className="translate-screen__swap-btn" onClick={handleSwap}>
            <span className="translate-screen__swap-icon">⇄</span>
          </button>

          <div className="translate-screen__lang-select-wrap translate-screen__lang-select-wrap--right">
            <span className="translate-screen__lang-flag">{toLang.flag}</span>
            <select
              className="translate-screen__lang-select"
              value={toCode}
              onChange={handleToChange}
            >
              {LANGS.map(l => (
                <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Input area */}
        <div className="translate-screen__input-wrap">
          <textarea
            className="translate-screen__input"
            placeholder={`${fromLang.flag} ${fromLang.name}...`}
            value={inputText}
            onChange={handleInput}
            rows={4}
            maxLength={500}
          />
          <div className="translate-screen__input-actions">
            {hasSpeechRecognition && fromCode !== 'az' && (
              <button
                className={`translate-screen__mic-btn${listening ? ' translate-screen__mic-btn--active' : ''}`}
                onClick={startVoice}
                title={listening ? 'Остановить' : `Диктовать на ${fromLang.name}`}
              >
                {listening ? '⏹' : '🎙️'}
              </button>
            )}
            {fromCode === 'az' && (
              <span className="translate-screen__mic-unsupported" title="Диктовка на азербайджанском не поддерживается браузером">🎙️✕</span>
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
          {loading
            ? <span className="translate-screen__spinner" />
            : <><span>{t('btn')}</span><span className="translate-screen__btn-arrow">→</span></>
          }
        </button>

        {/* Divider */}
        <div className="translate-screen__divider">
          <span className="translate-screen__divider-label">{toLang.flag} {toLang.name}</span>
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
              <button className="translate-screen__speak-btn" onClick={handleSpeakResult}>🔊</button>
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
