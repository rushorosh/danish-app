// Azure Cognitive Services TTS — az-AZ-BanuNeural (female) / az-AZ-BabekNeural (male)
const AZURE_KEY = import.meta.env.VITE_AZURE_TTS_KEY;
const AZURE_REGION = import.meta.env.VITE_AZURE_TTS_REGION || 'eastus';
const VOICE = 'az-AZ-BanuNeural';

// Cache: text → object URL, so same word isn't fetched twice per session
const cache = new Map();
let currentAudio = null;

export async function speakAzerbaijani(text, rate = 1.0) {
  if (!text) return;

  // Stop any currently playing audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  // Use cached URL if available
  if (cache.has(text)) {
    const audio = new Audio(cache.get(text));
    currentAudio = audio;
    audio.play().catch(() => {});
    return;
  }

  // Fallback to Google TTS if no Azure key configured
  if (!AZURE_KEY) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=az&client=tw-ob&ttsspeed=${rate}`;
    const audio = new Audio(url);
    currentAudio = audio;
    audio.play().catch(() => {});
    return;
  }

  try {
    const ssml = `<speak version='1.0' xml:lang='az-AZ'>
      <voice xml:lang='az-AZ' name='${VOICE}'>
        <prosody rate='${rate < 1 ? '-15%' : '+0%'}'>${escapeXml(text)}</prosody>
      </voice>
    </speak>`;

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

    if (!response.ok) throw new Error(`Azure TTS error: ${response.status}`);

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    cache.set(text, url);

    const audio = new Audio(url);
    currentAudio = audio;
    audio.play().catch(() => {});
  } catch (e) {
    // Fallback to Google TTS on Azure error
    console.warn('Azure TTS failed, falling back to Google:', e);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=az&client=tw-ob&ttsspeed=${rate}`;
    const audio = new Audio(url);
    currentAudio = audio;
    audio.play().catch(() => {});
  }
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
