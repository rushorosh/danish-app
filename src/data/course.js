import { WORDS } from './vocabulary.js';

export const COURSE = [
  {
    id: 1,
    title: 'Приветствия и знакомство',
    color: '#58CC02',
    shadowColor: '#3D9900',
    sections: [
      { id: 1,  title: 'Первые слова',     icon: '👋', mascot: '🫖' },
      { id: 2,  title: 'Вежливость',       icon: '🙏', mascot: '🌹' },
      { id: 3,  title: 'Знакомство',       icon: '🤝', mascot: '🫖' },
      { id: 4,  title: 'Прощание',         icon: '👋', mascot: '🌙' },
      { id: 5,  title: 'Фразы дня',        icon: '☀️', mascot: '🍵' },
      { id: 6,  title: 'Вопросы',          icon: '❓', mascot: '🌺' },
      { id: 7,  title: 'Ответы',           icon: '💬', mascot: '🎭' },
      { id: 8,  title: 'Эмоции',           icon: '😊', mascot: '🌸' },
      { id: 9,  title: 'Повторение 1',     icon: '🔄', mascot: '🫖' },
      { id: 10, title: 'Тест модуля',      icon: '⭐', mascot: '🏆' },
    ],
  },
  {
    id: 2,
    title: 'Числа и цвета',
    color: '#1CB0F6',
    shadowColor: '#0D8ABF',
    sections: [
      { id: 1,  title: 'Числа 1-5',        icon: '1️⃣', mascot: '🐐' },
      { id: 2,  title: 'Числа 6-10',       icon: '🔢', mascot: '🏔️' },
      { id: 3,  title: 'Основные цвета',   icon: '🎨', mascot: '🐐' },
      { id: 4,  title: 'Все цвета',        icon: '🌈', mascot: '🦅' },
      { id: 5,  title: 'Сколько?',         icon: '📊', mascot: '🐐' },
      { id: 6,  title: 'Описание',         icon: '✏️', mascot: '🏔️' },
      { id: 7,  title: 'Размеры',          icon: '📏', mascot: '🐐' },
      { id: 8,  title: 'Число + цвет',     icon: '🔢', mascot: '🌈' },
      { id: 9,  title: 'Повторение 2',     icon: '🔄', mascot: '🐐' },
      { id: 10, title: 'Тест модуля',      icon: '⭐', mascot: '🏆' },
    ],
  },
  {
    id: 3,
    title: 'Еда и напитки',
    color: '#FF9600',
    shadowColor: '#CC7800',
    sections: [
      { id: 1,  title: 'Напитки',          icon: '☕', mascot: '🍵' },
      { id: 2,  title: 'Фрукты',           icon: '🍎', mascot: '🍑' },
      { id: 3,  title: 'Овощи',            icon: '🍅', mascot: '🍅' },
      { id: 4,  title: 'Мясо и сыр',       icon: '🥩', mascot: '🍆' },
      { id: 5,  title: 'Вкус',             icon: '😋', mascot: '🍑' },
      { id: 6,  title: 'В кафе',           icon: '☕', mascot: '🫖' },
      { id: 7,  title: 'Заказ еды',        icon: '📋', mascot: '🍅' },
      { id: 8,  title: 'Покупки',          icon: '🛒', mascot: '🍆' },
      { id: 9,  title: 'Повторение 3',     icon: '🔄', mascot: '🍑' },
      { id: 10, title: 'Тест модуля',      icon: '⭐', mascot: '🏆' },
    ],
  },
  {
    id: 4,
    title: 'Семья и дом',
    color: '#FF4B4B',
    shadowColor: '#CC0000',
    sections: [
      { id: 1,  title: 'Родители',         icon: '👨‍👩‍👧', mascot: '🦚' },
      { id: 2,  title: 'Дети',             icon: '👶',    mascot: '🐣' },
      { id: 3,  title: 'Родственники',     icon: '👨‍👩‍👧‍👦', mascot: '🦚' },
      { id: 4,  title: 'Комнаты дома',     icon: '🏠',    mascot: '🏠' },
      { id: 5,  title: 'Двор и сад',       icon: '🌿',    mascot: '🌿' },
      { id: 6,  title: 'Животные дома',    icon: '🐱',    mascot: '🐱' },
      { id: 7,  title: 'Дикие животные',   icon: '🐯',    mascot: '🦅' },
      { id: 8,  title: 'Описание семьи',   icon: '💕',    mascot: '🦚' },
      { id: 9,  title: 'Повторение 4',     icon: '🔄',    mascot: '🦚' },
      { id: 10, title: 'Тест модуля',      icon: '⭐',    mascot: '🏆' },
    ],
  },
  {
    id: 5,
    title: 'Город и глаголы',
    color: '#CE82FF',
    shadowColor: '#9B5FCC',
    sections: [
      { id: 1,  title: 'Места города',     icon: '🏙️', mascot: '🐬' },
      { id: 2,  title: 'Транспорт',        icon: '🚌', mascot: '🚌' },
      { id: 3,  title: 'Действия',         icon: '🚶', mascot: '🐬' },
      { id: 4,  title: 'Глаголы',          icon: '⚡', mascot: '🌊' },
      { id: 5,  title: 'Направления',      icon: '🗺️', mascot: '🐬' },
      { id: 6,  title: 'Время',            icon: '⏰', mascot: '⏰' },
      { id: 7,  title: 'Работа и учёба',   icon: '💼', mascot: '🦅' },
      { id: 8,  title: 'Природа',          icon: '🌿', mascot: '🌊' },
      { id: 9,  title: 'Повторение 5',     icon: '🔄', mascot: '🐬' },
      { id: 10, title: 'Тест модуля',      icon: '⭐', mascot: '🏆' },
    ],
  },
];

// Topic mapping per module
const TOPIC_MAP = {
  '1': 'greetings',
  '2': 'numbers',
  '3': 'food',
  '4': 'family',
  '5': 'places',
};

export function generateLessons(moduleId, sectionId) {
  const topic = TOPIC_MAP[String(moduleId)] || 'greetings';
  const topicWords = WORDS.filter(w => w.topic === topic);

  // Progressive level unlocking based on sectionId
  // sections 1-2  → level 1 only
  // sections 3-4  → levels 1-2
  // sections 5-7  → levels 2-3
  // sections 8-10 → levels 3-4 (max complexity)
  let minLevel, maxLevel;
  if (sectionId <= 2) {
    minLevel = 1; maxLevel = 1;
  } else if (sectionId <= 4) {
    minLevel = 1; maxLevel = 2;
  } else if (sectionId <= 7) {
    minLevel = 2; maxLevel = 3;
  } else {
    minLevel = 3; maxLevel = 4;
  }

  // Sections 9-10: include review words from all lower levels
  const reviewMode = sectionId >= 9;
  const pool = reviewMode
    ? topicWords.filter(w => w.level >= 1 && w.level <= maxLevel)
    : topicWords.filter(w => w.level >= minLevel && w.level <= maxLevel);

  // Rotate through available words using sectionId as offset
  const offset = ((sectionId - 1) * 4) % Math.max(pool.length, 1);
  const rotated = [
    ...pool.slice(offset),
    ...pool.slice(0, offset),
  ];
  const sectionWords = rotated.slice(0, 6);

  // Ensure we always have at least 2 words
  const words = sectionWords.length >= 2
    ? sectionWords
    : [...pool, ...WORDS.filter(w => w.az !== pool[0]?.az)].slice(0, 4);

  // Generate 6 lessons alternating choice / tiles
  const types = ['choice', 'tiles', 'choice', 'tiles', 'choice', 'tiles'];

  return types.map((type, i) => {
    const word = words[i % words.length];
    const distractors = WORDS
      .filter(w => w.az !== word.az && w.ru !== word.ru)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return { id: i + 1, type, word, distractors };
  });
}
