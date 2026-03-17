import { WORDS } from './vocabulary.js';

export const COURSE = [
  {
    id: 1, title: 'Фонетика и приветствия', cefr: 'A0–A1',
    color: '#58CC02', shadowColor: '#3D9900',
    sections: [
      { id: 1, title: 'Алфавит и звуки',     icon: '🔤', mascot: '🫖' },
      { id: 2, title: 'Базовые приветствия',  icon: '👋', mascot: '🧔🏻' },
      { id: 3, title: 'Вежливость',           icon: '🙏', mascot: '🌹' },
      { id: 4, title: 'Знакомство',           icon: '🤝', mascot: '🫖' },
      { id: 5, title: 'Первый диалог',        icon: '💬', mascot: '🌺' },
    ],
  },
  {
    id: 2, title: 'Числа и цвета', cefr: 'A1',
    color: '#1CB0F6', shadowColor: '#0D8ABF',
    sections: [
      { id: 1, title: 'Числа 1–10',          icon: '🔢', mascot: '🐐' },
      { id: 2, title: 'Числа 11–100',         icon: '📊', mascot: '🏔️' },
      { id: 3, title: 'Основные цвета',       icon: '🎨', mascot: '🐐' },
      { id: 4, title: 'Все цвета',            icon: '🌈', mascot: '🦅' },
      { id: 5, title: 'Числа и цвета вместе', icon: '✨', mascot: '🏔️' },
    ],
  },
  {
    id: 3, title: 'Повседневная жизнь', cefr: 'A1–A2',
    color: '#FF9600', shadowColor: '#CC7800',
    sections: [
      { id: 1, title: 'Дни недели',           icon: '📅', mascot: '☀️' },
      { id: 2, title: 'Время суток',          icon: '⏰', mascot: '🌙' },
      { id: 3, title: 'Месяцы и сезоны',      icon: '🌸', mascot: '🍂' },
      { id: 4, title: 'Распорядок дня',       icon: '🌅', mascot: '🍵' },
      { id: 5, title: 'Мой день',             icon: '📖', mascot: '📚' },
    ],
  },
  {
    id: 4, title: 'Семья и дом', cefr: 'A1–A2',
    color: '#FF4B4B', shadowColor: '#CC0000',
    sections: [
      { id: 1, title: 'Близкая семья',        icon: '👨‍👩‍👧', mascot: '🦚' },
      { id: 2, title: 'Расширенная семья',    icon: '👨‍👩‍👧‍👦', mascot: '🐣' },
      { id: 3, title: 'Дом и комнаты',        icon: '🏠', mascot: '🏠' },
      { id: 4, title: 'Домашние животные',    icon: '🐱', mascot: '🐱' },
      { id: 5, title: 'Моя семья — диалог',   icon: '💕', mascot: '🦚' },
    ],
  },
  {
    id: 5, title: 'В городе', cefr: 'A2',
    color: '#CE82FF', shadowColor: '#9B5FCC',
    sections: [
      { id: 1, title: 'Места города',         icon: '🏙️', mascot: '🐬' },
      { id: 2, title: 'Транспорт',            icon: '🚌', mascot: '🚌' },
      { id: 3, title: 'Направления',          icon: '🗺️', mascot: '🐬' },
      { id: 4, title: 'Покупки',              icon: '🛒', mascot: '🌊' },
      { id: 5, title: 'В кафе и ресторане',   icon: '☕', mascot: '🐬' },
    ],
  },
  {
    id: 6, title: 'Глаголы и времена', cefr: 'A2',
    color: '#FF6B35', shadowColor: '#CC4A10',
    sections: [
      { id: 1, title: 'Основные глаголы',     icon: '⚡', mascot: '🏃🏻' },
      { id: 2, title: 'Настоящее время',       icon: '▶️', mascot: '👩🏻‍🏫' },
      { id: 3, title: 'Прошедшее время',       icon: '⏪', mascot: '📜' },
      { id: 4, title: 'Будущее время',         icon: '⏩', mascot: '🚀' },
      { id: 5, title: 'Глагольные фразы',      icon: '💭', mascot: '🌿' },
    ],
  },
  {
    id: 7, title: 'Общение и диалог', cefr: 'A2–B1',
    color: '#30D158', shadowColor: '#1A8F35',
    sections: [
      { id: 1, title: 'Вопросительные слова',  icon: '❓', mascot: '🦉' },
      { id: 2, title: 'Мнения и реакции',      icon: '💬', mascot: '🧑🏻' },
      { id: 3, title: 'Эмоции и чувства',      icon: '😊', mascot: '🌸' },
      { id: 4, title: 'Согласие / несогласие', icon: '🤝', mascot: '🌊' },
      { id: 5, title: 'Диалог-сценка',         icon: '🎭', mascot: '🦋' },
    ],
  },
  {
    id: 8, title: 'Работа и образование', cefr: 'B1',
    color: '#5856D6', shadowColor: '#3634A3',
    sections: [
      { id: 1, title: 'Профессии',             icon: '💼', mascot: '👩🏻‍💼' },
      { id: 2, title: 'На работе',             icon: '🏢', mascot: '🧑🏻‍💻' },
      { id: 3, title: 'Образование',           icon: '🎓', mascot: '📚' },
      { id: 4, title: 'Карьера',               icon: '📈', mascot: '🏆' },
      { id: 5, title: 'Деловое общение',       icon: '🤝', mascot: '🌍' },
    ],
  },
];

// Bonus module (unlocked after all 8)
export const BONUS_MODULE = {
  id: 9, title: 'Культура Азербайджана', cefr: 'B1',
  color: '#FFD60A', shadowColor: '#CC9900',
  sections: [
    { id: 1, title: 'Праздники и традиции',  icon: '🎉', mascot: '🎊' },
    { id: 2, title: 'Азербайджанская кухня', icon: '🍽️', mascot: '🥘' },
    { id: 3, title: 'История и география',   icon: '🏛️', mascot: '🗺️' },
    { id: 4, title: 'Народная мудрость',     icon: '📜', mascot: '🦅' },
    { id: 5, title: 'Современный Азербайджан', icon: '🌆', mascot: '🇦🇿' },
  ],
};

// Topic mapping per module
export const TOPIC_MAP = {
  '1': 'greetings',
  '2': 'numbers',
  '3': 'daily',
  '4': 'family',
  '5': 'places',
  '6': 'verbs',
  '7': 'communication',
  '8': 'work',
  '9': 'culture',
};

// 10 lessons per section: 2 introduce + 5 choice + 3 tiles
const LESSON_PATTERN = [
  'introduce', 'introduce',
  'choice', 'choice', 'tiles',
  'choice', 'tiles',
  'choice', 'tiles',
  'choice',
];

// Sentence lesson pattern (sections 4-5 get sentence exercises)
const SENTENCE_PATTERN = [
  'introduce', 'introduce',
  'choice', 'tiles',
  'sentence', 'choice',
  'tiles', 'sentence',
  'choice', 'sentence',
];

/**
 * Generate lessons from a word pool (static fallback).
 * pool: array of word objects { az, ru, transcription, ... }
 * allWords: full word list for distractors
 */
export function buildLessons(pool, allWords, sectionId, withSentences = false) {
  const pattern = withSentences ? SENTENCE_PATTERN : LESSON_PATTERN;
  const offset = ((sectionId - 1) * 5) % Math.max(pool.length, 1);
  const rotated = [...pool.slice(offset), ...pool.slice(0, offset)];
  const words = rotated.slice(0, 5);
  while (words.length < 3) words.push(...pool.slice(0, 3));

  return pattern.map((type, i) => {
    const word = words[i % words.length];
    const distractors = allWords
      .filter(w => w.az !== word.az && w.ru !== word.ru)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return { id: i + 1, type, word, distractors };
  });
}

/**
 * Static lesson generation (used as fallback when DB unavailable).
 */
export function generateLessons(moduleId, sectionId) {
  const topic = TOPIC_MAP[String(moduleId)] || 'greetings';
  const topicWords = WORDS.filter(w => w.topic === topic);

  let levels;
  if (sectionId === 1)      levels = [1];
  else if (sectionId === 2) levels = [1, 2];
  else if (sectionId === 3) levels = [2, 3];
  else if (sectionId === 4) levels = [3, 4];
  else                      levels = [1, 2, 3, 4];

  const pool = topicWords.filter(w => levels.includes(w.level));
  const source = pool.length >= 3 ? pool : topicWords;
  const withSentences = sectionId >= 4;
  return buildLessons(source, WORDS, sectionId, withSentences);
}

/**
 * Dynamic lesson generation from Supabase vocabulary.
 * dbWords: words fetched from Supabase vocabulary table
 * dbSentences: sentences fetched from Supabase sentences table (optional)
 * allDbWords: full vocabulary for distractors
 */
export function generateLessonsFromDB(moduleId, sectionId, dbWords, dbSentences = [], allDbWords = []) {
  let levels;
  if (sectionId === 1)      levels = [1];
  else if (sectionId === 2) levels = [1, 2];
  else if (sectionId === 3) levels = [2, 3];
  else if (sectionId === 4) levels = [3, 4];
  else                      levels = [1, 2, 3, 4];

  const pool = dbWords.filter(w => levels.includes(w.level));
  const source = pool.length >= 3 ? pool : dbWords;
  const distractorPool = allDbWords.length > 10 ? allDbWords : [...WORDS, ...allDbWords];
  const withSentences = sectionId >= 4 && dbSentences.length > 0;

  const offset = ((sectionId - 1) * 5) % Math.max(source.length, 1);
  const rotated = [...source.slice(offset), ...source.slice(0, offset)];
  const words = rotated.slice(0, 5);
  while (words.length < 3) words.push(...source.slice(0, 3));

  const pattern = withSentences ? SENTENCE_PATTERN : LESSON_PATTERN;

  return pattern.map((type, i) => {
    if (type === 'sentence' && dbSentences.length > 0) {
      const sent = dbSentences[i % dbSentences.length];
      const distractors = distractorPool
        .filter(w => w.az !== sent.az)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      return {
        id: i + 1,
        type: 'sentence',
        word: { az: sent.az, ru: sent.ru, transcription: sent.transcription || '' },
        distractors,
        pattern: sent.pattern,
      };
    }
    const word = words[i % words.length];
    const distractors = distractorPool
      .filter(w => w.az !== word.az && w.ru !== word.ru)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return { id: i + 1, type: type === 'sentence' ? 'choice' : type, word, distractors };
  });
}
