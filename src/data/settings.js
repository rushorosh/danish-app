const KEY = 'az_settings';

const DEFAULT = {
  voice: 'female',
  language: 'ru',
  displayName: '',
  phone: '',
  email: '',
};

export function getSettings() {
  try {
    return { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return { ...DEFAULT };
  }
}

export function saveSettings(patch) {
  const next = { ...getSettings(), ...patch };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
