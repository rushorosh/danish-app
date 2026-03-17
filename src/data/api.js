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

// ─── Score events ─────────────────────────────────────

/**
 * Log a score event (called every time user earns points).
 */
export async function addScoreEvent(telegramId, points) {
  if (!supabase || !telegramId || !points) return;
  const { error } = await supabase.from('score_events').insert({
    telegram_id: telegramId,
    points,
    created_at: new Date().toISOString(),
  });
  if (error) console.warn('[api] addScoreEvent error:', error.message);
}

// ─── Leaderboard ─────────────────────────────────────

/**
 * Fetch top-50 users by score (all time).
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

/**
 * Fetch leaderboard for a time period.
 * period: 'week' | 'day'
 */
export async function fetchLeaderboardPeriod(period) {
  if (!supabase) return null;
  const now = new Date();
  let since;
  if (period === 'day') {
    since = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  } else if (period === 'week') {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    since = d.toISOString();
  } else {
    return fetchLeaderboard();
  }

  // Fetch score events for the period
  const { data: events, error } = await supabase
    .from('score_events')
    .select('telegram_id, points')
    .gte('created_at', since);

  if (error) {
    console.warn('[api] fetchLeaderboardPeriod error:', error.message);
    return null;
  }

  // Aggregate points by user
  const totals = {};
  for (const e of events || []) {
    totals[e.telegram_id] = (totals[e.telegram_id] || 0) + e.points;
  }

  if (Object.keys(totals).length === 0) return [];

  // Fetch user info for aggregated IDs
  const ids = Object.keys(totals);
  const { data: users, error: err2 } = await supabase
    .from('users')
    .select('telegram_id, first_name, last_name, username')
    .in('telegram_id', ids);

  if (err2) {
    console.warn('[api] fetchLeaderboardPeriod users error:', err2.message);
    return null;
  }

  return (users || [])
    .map(u => ({ ...u, score: totals[u.telegram_id] || 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);
}
