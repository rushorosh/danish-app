// Tracks which vocabulary words the user has "introduced" (seen in introduce lessons)
// Stored in localStorage as a Set of word strings (az)

const KEY = 'az_known_words';

export function getKnownWords() {
  try {
    const raw = localStorage.getItem(KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function addKnownWord(az) {
  const known = getKnownWords();
  known.add(az.toLowerCase());
  localStorage.setItem(KEY, JSON.stringify([...known]));
}

export function addKnownWords(azArray) {
  const known = getKnownWords();
  azArray.forEach(w => known.add(w.toLowerCase()));
  localStorage.setItem(KEY, JSON.stringify([...known]));
}

export function isWordKnown(az) {
  return getKnownWords().has(az.toLowerCase());
}

export function getKnownCount() {
  return getKnownWords().size;
}

// Sync known words to Supabase (for cross-device support)
export function serializeKnownWords() {
  return [...getKnownWords()].join(',');
}
