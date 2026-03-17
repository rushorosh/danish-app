const KEY_DATE = 'az_streak_date';
const KEY_COUNT = 'az_streak_count';

function today() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export function getStreak() {
  return parseInt(localStorage.getItem(KEY_COUNT) || '0');
}

export function recordActivity() {
  const t = today();
  const last = localStorage.getItem(KEY_DATE);
  const count = parseInt(localStorage.getItem(KEY_COUNT) || '0');

  if (last === t) return count; // already recorded today

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const newCount = last === yesterday ? count + 1 : 1;

  localStorage.setItem(KEY_DATE, t);
  localStorage.setItem(KEY_COUNT, String(newCount));
  return newCount;
}
