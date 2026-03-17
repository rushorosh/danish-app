import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../data/settings.js';
import { useT } from '../data/LanguageContext.jsx';
import { getReferralCount, updateUserProfile } from '../data/api.js';
import './SettingsScreen.css';

const BOT_USERNAME = import.meta.env.VITE_BOT_USERNAME || '';

const LANGUAGES = [
  { code: 'ru', label: 'Русский',    flag: '🇷🇺' },
  { code: 'az', label: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'en', label: 'English',    flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch',    flag: '🇩🇪' },
  { code: 'es', label: 'Español',    flag: '🇪🇸' },
  { code: 'fr', label: 'Français',   flag: '🇫🇷' },
  { code: 'zh', label: '中文',        flag: '🇨🇳' },
];

export default function SettingsScreen({ telegramId, onSettingsChange }) {
  const t = useT('settings');
  const [settings, setSettings] = useState(getSettings);
  const [displayName, setDisplayName] = useState(() => getSettings().displayName);
  const [phone, setPhone] = useState(() => getSettings().phone);
  const [email, setEmail] = useState(() => getSettings().email);
  const [savedMsg, setSavedMsg] = useState(false);
  const [copied, setCopied] = useState(false);
  const [referralCount, setReferralCount] = useState(0);

  const referralLink = BOT_USERNAME && telegramId
    ? `https://t.me/${BOT_USERNAME}?start=ref_${telegramId}`
    : null;

  useEffect(() => {
    if (telegramId) {
      getReferralCount(telegramId).then(count => setReferralCount(count));
    }
  }, [telegramId]);

  const update = (patch) => {
    const next = saveSettings(patch);
    setSettings(next);
    onSettingsChange?.(next);
  };

  const handleFillFromTG = () => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    // TG 7.0+ — native contact request dialog
    if (typeof tg.requestContact === 'function') {
      tg.requestContact((ok, contact) => {
        if (ok && contact) {
          if (contact.phone_number) setPhone(contact.phone_number);
          const name = [contact.first_name, contact.last_name].filter(Boolean).join(' ');
          if (name) setDisplayName(name);
        }
      });
      return;
    }

    // Fallback: fill from initDataUnsafe (no phone available this way)
    const u = tg.initDataUnsafe?.user;
    if (u) {
      const name = [u.first_name, u.last_name].filter(Boolean).join(' ');
      if (name) setDisplayName(name);
    }
  };

  const handleSave = async () => {
    saveSettings({ displayName, phone, email });
    if (telegramId) await updateUserProfile(telegramId, { phone, email, displayName });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const handleCopy = () => {
    if (!referralLink) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(referralLink).catch(() => fallbackCopy(referralLink));
    } else {
      fallbackCopy(referralLink);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fallbackCopy = (text) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  return (
    <div className="settings-screen">
      <div className="settings-screen__header">
        <span className="settings-screen__header-icon">⚙️</span>
        <span className="settings-screen__header-title">{t('title')}</span>
      </div>

      {/* Voice */}
      <div className="settings-card">
        <div className="settings-card__title">{t('voice_title')}</div>
        <div className="settings-voice-grid">
          {[
            { key: 'female', label: t('voice_female') },
            { key: 'male',   label: t('voice_male') },
          ].map(v => (
            <button
              key={v.key}
              className={`settings-voice-btn${settings.voice === v.key ? ' settings-voice-btn--active' : ''}`}
              onClick={() => update({ voice: v.key })}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Personal data */}
      <div className="settings-card">
        <div className="settings-card__title-row">
          <div className="settings-card__title">{t('personal_title')}</div>
          <button className="settings-tg-btn" onClick={handleFillFromTG}>
            <span>✈️</span>
            <span>{t('fill_tg')}</span>
          </button>
        </div>
        <div className="settings-field">
          <label className="settings-field__label">{t('name')}</label>
          <input className="settings-field__input" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder={t('name')} />
        </div>
        <div className="settings-field">
          <label className="settings-field__label">{t('phone')}</label>
          <input className="settings-field__input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7..." type="tel" />
        </div>
        <div className="settings-field">
          <label className="settings-field__label">{t('email')}</label>
          <input className="settings-field__input" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" type="email" />
        </div>
        <button className={`settings-save-btn${savedMsg ? ' settings-save-btn--saved' : ''}`} onClick={handleSave}>
          {savedMsg ? t('saved') : t('save')}
        </button>
      </div>

      {/* Referral */}
      <div className="settings-card">
        <div className="settings-card__title">{t('referral_title')}</div>
        <div className="settings-referral__desc">{t('referral_desc')}</div>
        <div className="settings-referral__stats">
          <div className="settings-referral__stat">
            <div className="settings-referral__stat-val">{referralCount}</div>
            <div className="settings-referral__stat-lbl">{t('referral_invited')}</div>
          </div>
          <div className="settings-referral__divider" />
          <div className="settings-referral__stat">
            <div className="settings-referral__stat-val">⭐ {referralCount * 50}</div>
            <div className="settings-referral__stat-lbl">{t('referral_bonus')}</div>
          </div>
        </div>
        {referralLink ? (
          <div className="settings-referral__link-wrap">
            <div className="settings-referral__link-label">{t('referral_link')}</div>
            <div className="settings-referral__link-row">
              <div className="settings-referral__link-text">{referralLink}</div>
              <button
                className={`settings-referral__copy-btn${copied ? ' settings-referral__copy-btn--copied' : ''}`}
                onClick={handleCopy}
              >
                {copied ? t('copied') : t('copy')}
              </button>
            </div>
          </div>
        ) : (
          <div className="settings-referral__no-link">
            Добавьте VITE_BOT_USERNAME в Vercel для активации
          </div>
        )}
      </div>

      {/* Language */}
      <div className="settings-card">
        <div className="settings-card__title">{t('lang_title')}</div>
        <div className="settings-lang-grid">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              className={`settings-lang-btn${settings.language === lang.code ? ' settings-lang-btn--active' : ''}`}
              onClick={() => update({ language: lang.code })}
            >
              <span className="settings-lang-btn__flag">{lang.flag}</span>
              <span className="settings-lang-btn__label">{lang.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Support */}
      <a href="https://t.me/rushorosh" target="_blank" rel="noreferrer" className="settings-support-btn">
        <span>💬</span>
        <span>{t('support')}</span>
      </a>
    </div>
  );
}
