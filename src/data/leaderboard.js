export const MOCK_USERS = [
  { id: 'u1', name: 'Айгюн К.', score: 4820, avatar: '🦊' },
  { id: 'u2', name: 'Рустам М.', score: 3950, avatar: '🐺' },
  { id: 'u3', name: 'Нилуфар А.', score: 3210, avatar: '🦋' },
  { id: 'u4', name: 'Камал Э.', score: 2780, avatar: '🦁' },
  { id: 'u5', name: 'Лейла С.', score: 2340, avatar: '🐸' },
  { id: 'u6', name: 'Орхан Б.', score: 1890, avatar: '🦅' },
  { id: 'u7', name: 'Гюнай Р.', score: 1540, avatar: '🐬' },
  { id: 'u8', name: 'Эльнур Х.', score: 980, avatar: '🦉' },
  { id: 'u9', name: 'Сабина Ф.', score: 720, avatar: '🐝' },
  { id: 'u10', name: 'Вусал Н.', score: 340, avatar: '🦊' },
];

export function getLeaderboard() {
  const saved = localStorage.getItem('az_leaderboard');
  return saved ? JSON.parse(saved) : [...MOCK_USERS];
}

export function saveUserScore(name, score) {
  const board = getLeaderboard();
  const existing = board.find(u => u.id === 'me');
  if (existing) {
    existing.score = score;
    existing.name = name;
  } else {
    board.push({ id: 'me', name, score, avatar: '⭐' });
  }
  board.sort((a, b) => b.score - a.score);
  localStorage.setItem('az_leaderboard', JSON.stringify(board));
  return board;
}
