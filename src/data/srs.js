// Simple Leitner SRS (Spaced Repetition System)
// Boxes: 1=1day, 2=3days, 3=7days, 4=14days, 5=30days
// Words move up on correct answer, reset to box 1 on wrong

const KEY = 'az_srs';
const BOX_INTERVALS = [0, 1, 3, 7, 14, 30]; // days per box (index = box number)

function loadSRS() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
  catch { return {}; }
}
function saveSRS(data) { localStorage.setItem(KEY, JSON.stringify(data)); }

/** Add a word to SRS when first introduced */
export function addWordToSRS(azWord, meta = {}) {
  const data = loadSRS();
  const key = azWord.toLowerCase();
  if (!data[key]) {
    data[key] = { box: 1, nextReview: Date.now(), reviews: 0, streak: 0, ru: meta.ru || '', transcription: meta.transcription || '' };
    saveSRS(data);
  } else if (meta.ru && !data[key].ru) {
    data[key].ru = meta.ru;
    data[key].transcription = meta.transcription || '';
    saveSRS(data);
  }
}

/** Add multiple words at once. Each item can be a string or { az, ru, transcription } */
export function addWordsToSRS(words) {
  const data = loadSRS();
  const now = Date.now();
  let changed = false;
  for (const w of words) {
    const az = typeof w === 'string' ? w : w.az;
    const key = az.toLowerCase();
    if (!data[key]) {
      data[key] = { box: 1, nextReview: now, reviews: 0, streak: 0, ru: w.ru || '', transcription: w.transcription || '' };
      changed = true;
    } else if (w.ru && !data[key].ru) {
      data[key].ru = w.ru;
      data[key].transcription = w.transcription || '';
      changed = true;
    }
  }
  if (changed) saveSRS(data);
}

/** Record the result of a review */
export function recordReview(azWord, correct) {
  const data = loadSRS();
  const key = azWord.toLowerCase();
  const entry = data[key] || { box: 1, nextReview: Date.now(), reviews: 0, streak: 0 };

  entry.reviews += 1;
  if (correct) {
    entry.streak = (entry.streak || 0) + 1;
    entry.box = Math.min(5, entry.box + 1);
  } else {
    entry.streak = 0;
    entry.box = 1;
  }
  const daysUntilNext = BOX_INTERVALS[entry.box];
  entry.nextReview = Date.now() + daysUntilNext * 24 * 60 * 60 * 1000;
  data[key] = entry;
  saveSRS(data);
}

/** Get all words due for review today (nextReview <= now) */
export function getDueWords() {
  const data = loadSRS();
  const now = Date.now();
  return Object.entries(data)
    .filter(([, v]) => v.nextReview <= now)
    .map(([az, v]) => ({ az, ...v }))
    .sort((a, b) => a.nextReview - b.nextReview);
}

/** Get SRS entry for a word */
export function getSRSEntry(azWord) {
  const data = loadSRS();
  return data[azWord.toLowerCase()] || null;
}

/** Get all SRS words with their data */
export function getAllSRSWords() {
  return loadSRS();
}

/** Count due today */
export function getDueCount() {
  return getDueWords().length;
}

/** Count total words in SRS */
export function getTotalSRSCount() {
  return Object.keys(loadSRS()).length;
}
