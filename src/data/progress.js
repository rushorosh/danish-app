// Progress keys:
// "mod_1_sec_3"         → true  (legacy: whole section complete)
// "mod_1_sec_1_node_5"  → true  (new: individual node complete)

export const NODES_PER_SECTION = 7;

// Which lesson indices (from 10-lesson pattern) belong to each node
export const NODE_INDICES = [[0], [1], [2, 3], [4, 5], [6], [7, 8], [9]];

// Icons for each node slot
export const NODE_ICONS = ['📖', '📖', '❓', '🧩', '❓', '🧩', '⭐'];

const nodeKey = (m, s, n) => `mod_${m}_sec_${s}_node_${n}`;
const secKey  = (m, s)    => `mod_${m}_sec_${s}`;

export function setProgressData(data) {
  localStorage.setItem('az_progress', JSON.stringify(data));
}

export function getProgress() {
  try { return JSON.parse(localStorage.getItem('az_progress') || '{}'); }
  catch { return {}; }
}

export function isNodeComplete(modId, secId, nodeId, progress = getProgress()) {
  return !!(progress[secKey(modId, secId)] || progress[nodeKey(modId, secId, nodeId)]);
}

export function isSectionComplete(modId, secId, progress = getProgress()) {
  if (progress[secKey(modId, secId)]) return true;
  return Array.from({ length: NODES_PER_SECTION }, (_, i) => i + 1)
    .every(n => !!progress[nodeKey(modId, secId, n)]);
}

// Returns true if section just became complete
export function markNodeComplete(modId, secId, nodeId) {
  const p = getProgress();
  p[nodeKey(modId, secId, nodeId)] = true;
  const allDone = Array.from({ length: NODES_PER_SECTION }, (_, i) => i + 1)
    .every(n => !!(p[nodeKey(modId, secId, n)] || p[secKey(modId, secId)]));
  if (allDone) p[secKey(modId, secId)] = true;
  localStorage.setItem('az_progress', JSON.stringify(p));
  return !!p[secKey(modId, secId)];
}

export function markSectionComplete(modId, secId) {
  const p = getProgress();
  p[secKey(modId, secId)] = true;
  localStorage.setItem('az_progress', JSON.stringify(p));
}

export function getNodeStatus(modId, secId, nodeId, secAccessible, progress = getProgress()) {
  if (isNodeComplete(modId, secId, nodeId, progress)) return 'completed';
  if (!secAccessible) return 'locked';
  if (nodeId === 1) return 'active';
  if (isNodeComplete(modId, secId, nodeId - 1, progress)) return 'active';
  return 'locked';
}

export function isModuleComplete(mod, progress = getProgress()) {
  return mod.sections.every(sec => isSectionComplete(mod.id, sec.id, progress));
}
