// Keys: "mod_1_sec_3" → true (completed)

// Called from App.jsx after loading progress from Supabase
export function setProgressData(data) {
  localStorage.setItem('az_progress', JSON.stringify(data));
}

export function getProgress() {
  try {
    return JSON.parse(localStorage.getItem('az_progress') || '{}');
  } catch {
    return {};
  }
}

export function markSectionComplete(moduleId, sectionId) {
  const p = getProgress();
  p[`mod_${moduleId}_sec_${sectionId}`] = true;
  localStorage.setItem('az_progress', JSON.stringify(p));
}

export function isSectionComplete(moduleId, sectionId, progress) {
  return !!progress[`mod_${moduleId}_sec_${sectionId}`];
}

export function getCompletedModules(progress) {
  // Module complete if all 10 sections done
  return [1, 2, 3, 4, 5].filter(mid =>
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].every(sid => progress[`mod_${mid}_sec_${sid}`])
  );
}

export function getNextSection(progress) {
  for (const mod of [1, 2, 3, 4, 5]) {
    for (const sec of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
      if (!progress[`mod_${mod}_sec_${sec}`]) return { moduleId: mod, sectionId: sec };
    }
  }
  return null;
}
