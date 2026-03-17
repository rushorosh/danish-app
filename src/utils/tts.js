import { getSettings } from '../data/settings.js';

const AZURE_KEY = import.meta.env.VITE_AZURE_TTS_KEY;
const AZURE_REGION = import.meta.env.VITE_AZURE_TTS_REGION || 'eastus';

const VOICES = {
  female: 'az-AZ-BanuNeural',
  male: 'az-AZ-BabekNeural',
};

// Cache: voiceKey+text → object URL
const cache = new Map();
let currentAudio = null;

export async function speakAzerbaijani(text, rate = 1.0) {
  if (!text) return;
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }

  const voice = VOICES[getSettings().voice] || VOICES.female;
  const cacheKey = `${voice}:${text}`;

  if (cache.has(cacheKey)) {
    const audio = new Audio(cache.get(cacheKey));
    currentAudio = audio;
    audio.play().catch(() => {});
    return;
  }

  if (!AZURE_KEY) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=az&client=tw-ob&ttsspeed=${rate}`;
    const audio = new Audio(url);
    currentAudio = audio;
    audio.play().catch(() => {});
    return;
  }

  try {
    const ssml = `<speak version='1.0' xml:lang='az-AZ'><voice xml:lang='az-AZ' name='${voice}'><prosody rate='${rate < 1 ? '-15%' : '+0%'}'>${escapeXml(text)}</prosody></voice></speak>`;
    const response = await fetch(
      `https://${AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_KEY,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3',
        },
        body: ssml,
      }
    );
    if (!response.ok) throw new Error(`Azure TTS ${response.status}`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    cache.set(cacheKey, url);
    const audio = new Audio(url);
    currentAudio = audio;
    audio.play().catch(() => {});
  } catch (e) {
    console.warn('Azure TTS failed, fallback:', e);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=az&client=tw-ob&ttsspeed=${rate}`;
    const audio = new Audio(url);
    currentAudio = audio;
    audio.play().catch(() => {});
  }
}

// Speak any language via Web Speech API (for Russian result in translator)
export function speakText(text, lang) {
  if (!text) return;
  if (lang === 'az') { speakAzerbaijani(text); return; }
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const langMap = { ru: 'ru-RU', en: 'en-US', de: 'de-DE', es: 'es-ES', fr: 'fr-FR', zh: 'zh-CN' };
  u.lang = langMap[lang] || 'ru-RU';
  window.speechSynthesis.speak(u);
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
