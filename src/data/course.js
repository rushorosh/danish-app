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
const TOPIC_MAP = {
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

export function generateLessons(moduleId, sectionId) {
  const topic = TOPIC_MAP[String(moduleId)] || 'greetings';
  const topicWords = WORDS.filter(w => w.topic === topic);

  // Progressive difficulty: sectionId 1-5
  let levels;
  if (sectionId === 1)      levels = [1];
  else if (sectionId === 2) levels = [1, 2];
  else if (sectionId === 3) levels = [2, 3];
  else if (sectionId === 4) levels = [3, 4];
  else                      levels = [1, 2, 3, 4]; // section 5 = full review

  const pool = topicWords.filter(w => levels.includes(w.level));
  const fallback = topicWords.length > 0 ? topicWords : WORDS.slice(0, 8);
  const source = pool.length >= 3 ? pool : fallback;

  // Rotate words per section to ensure variety
  const offset = ((sectionId - 1) * 5) % source.length;
  const rotated = [...source.slice(offset), ...source.slice(0, offset)];
  const words = rotated.slice(0, 5);

  // Ensure minimum 3 words
  while (words.length < 3) words.push(...source.slice(0, 3));

  return LESSON_PATTERN.map((type, i) => {
    const word = words[i % words.length];
    const distractors = WORDS
      .filter(w => w.az !== word.az && w.ru !== word.ru)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return { id: i + 1, type, word, distractors };
  });
}
