import { supabase } from '../lib/supabase.js';

// ─── User ───────────────────────────────────────────

/**
 * Upsert user on login. Uses Telegram user data.
 * Returns the user row from DB.
 */
export async function upsertUser({ telegramId, username, firstName, lastName }) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('users')
    .upsert(
      {
        telegram_id: telegramId,
        username: username || null,
        first_name: firstName || null,
        last_name: lastName || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'telegram_id', ignoreDuplicates: false }
    )
    .select()
    .single();
  if (error) console.warn('[api] upsertUser error:', error.message);
  return data || null;
}

/**
 * Update user score in DB.
 */
export async function updateScore(telegramId, score) {
  if (!supabase || !telegramId) return;
  const { error } = await supabase
    .from('users')
    .update({ score, updated_at: new Date().toISOString() })
    .eq('telegram_id', telegramId);
  if (error) console.warn('[api] updateScore error:', error.message);
}

// ─── Progress ────────────────────────────────────────

/**
 * Load all completed sections for a user from DB.
 * Returns object like { 'mod_1_sec_3': true, ... }
 */
export async function loadProgress(telegramId) {
  if (!supabase || !telegramId) return null;
  const { data, error } = await supabase
    .from('progress')
    .select('module_id, section_id')
    .eq('telegram_id', telegramId);
  if (error) {
    console.warn('[api] loadProgress error:', error.message);
    return null;
  }
  const result = {};
  for (const row of data || []) {
    result[`mod_${row.module_id}_sec_${row.section_id}`] = true;
  }
  return result;
}

/**
 * Save one completed section to DB.
 */
export async function saveProgress(telegramId, moduleId, sectionId) {
  if (!supabase || !telegramId) return;
  const { error } = await supabase.from('progress').upsert(
    {
      telegram_id: telegramId,
      module_id: moduleId,
      section_id: sectionId,
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'telegram_id,module_id,section_id', ignoreDuplicates: true }
  );
  if (error) console.warn('[api] saveProgress error:', error.message);
}

// ─── Leaderboard ─────────────────────────────────────

/**
 * Fetch top-50 users by score.
 * Returns array of { telegram_id, first_name, username, score }.
 */
export async function fetchLeaderboard() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('users')
    .select('telegram_id, first_name, last_name, username, score')
    .order('score', { ascending: false })
    .limit(50);
  if (error) {
    console.warn('[api] fetchLeaderboard error:', error.message);
    return null;
  }
  return data || [];
}
