// Level thresholds: threshold(n) = 25 * n * (n-1)
// Level 1: 0, Level 2: 50, Level 3: 150, Level 4: 300, Level 5: 500, Level 6: 750...

const LEVEL_NAMES = [
  '',           // 0 — unused
  'Новичок',   // 1
  'Ученик',    // 2
  'Студент',   // 3
  'Знаток',    // 4
  'Мастер',    // 5
  'Эксперт',   // 6
  'Профессор', // 7
  'Академик',  // 8
  'Гений',     // 9
  'Легенда',   // 10+
];

export function getLevelThreshold(level) {
  return 25 * level * (level - 1);
}

export function getLevel(score) {
  let n = Math.floor((1 + Math.sqrt(1 + 4 * Math.max(0, score) / 25)) / 2);
  while (n > 1 && getLevelThreshold(n) > score) n--;
  return Math.max(1, n);
}

export function getLevelName(level) {
  if (level >= LEVEL_NAMES.length) return LEVEL_NAMES[LEVEL_NAMES.length - 1];
  return LEVEL_NAMES[level] || 'Легенда';
}

export function getLevelProgress(score) {
  const level = getLevel(score);
  const currentThreshold = getLevelThreshold(level);
  const nextThreshold = getLevelThreshold(level + 1);
  const range = nextThreshold - currentThreshold;
  const progress = range > 0 ? (score - currentThreshold) / range : 1;
  return {
    level,
    name: getLevelName(level),
    progress: Math.min(1, Math.max(0, progress)),
    current: score - currentThreshold,
    needed: range,
  };
}
