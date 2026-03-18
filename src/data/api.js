import { supabase } from '../lib/supabase.js';

// ─── Rating cache ────────────────────────────────────
const _cache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function cacheGet(key) {
  const entry = _cache[key];
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  return null;
}
function cacheSet(key, data) { _cache[key] = { data, ts: Date.now() }; }

/** Call on app start to warm rating cache in background */
export function preloadRatings() {
  fetchLeaderboard();
  fetchLeaderboardPeriod('day');
  fetchLeaderboardPeriod('week');
}

// ─── Vocabulary ──────────────────────────────────────

const VOC_CACHE_TTL = 30 * 60 * 1000; // 30 min

/**
 * Fetch vocabulary words from Supabase by topic and optional max level.
 * Falls back to empty array if DB unavailable.
 */
export async function fetchVocabulary(topic, maxLevel = 4) {
  const key = `voc_${topic}_${maxLevel}`;
  const cached = cacheGet(key);
  if (cached) return cached;
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('vocabulary')
    .select('*')
    .eq('topic', topic)
    .lte('level', maxLevel)
    .order('level', { ascending: true });
  if (error) { console.warn('[api] fetchVocabulary:', error.message); return []; }
  const result = data || [];
  _cache[key] = { data: result, ts: Date.now() };
  return result;
}

/**
 * Fetch all vocabulary for preloading (no topic filter).
 */
export async function fetchAllVocabulary() {
  const key = 'voc_all';
  const cached = cacheGet(key);
  if (cached) return cached;
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('vocabulary')
    .select('*')
    .order('topic', { ascending: true })
    .order('level', { ascending: true });
  if (error) { console.warn('[api] fetchAllVocabulary:', error.message); return []; }
  const result = data || [];
  _cache[key] = { data: result, ts: Date.now() };
  return result;
}

/**
 * Fetch sentences accessible to the user based on their known words.
 * Returns sentences where ALL word_codes are in knownWords set.
 * knownWords: Set<string> of lowercase az words
 */
export async function fetchAccessibleSentences(knownWords, maxLevel = 5) {
  const key = `sent_${maxLevel}`;
  let sentences = cacheGet(key);
  if (!sentences) {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('sentences')
      .select('*')
      .lte('level', maxLevel)
      .order('level', { ascending: true });
    if (error) { console.warn('[api] fetchSentences:', error.message); return []; }
    sentences = data || [];
    _cache[key] = { data: sentences, ts: Date.now() };
  }
  // Filter: all key words must be known by user
  return sentences.filter(s =>
    !s.word_codes?.length ||
    s.word_codes.every(w => knownWords.has(w.toLowerCase()))
  );
}

/**
 * Fetch sentences by topic for a lesson section.
 */
export async function fetchSentencesByTopic(topic, level = 5) {
  const key = `sent_topic_${topic}_${level}`;
  const cached = cacheGet(key);
  if (cached) return cached;
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('sentences')
    .select('*')
    .eq('topic', topic)
    .lte('level', level)
    .order('level', { ascending: true });
  if (error) { console.warn('[api] fetchSentencesByTopic:', error.message); return []; }
  const result = data || [];
  _cache[key] = { data: result, ts: Date.now() };
  return result;
}

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
  else invalidateRatingsCache();
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

export function invalidateRatingsCache() {
  delete _cache['all'];
  delete _cache['day'];
  delete _cache['week'];
}

/**
 * Fetch top-50 users by score (all time).
 * Uses sum of score_events — same source as day/week to stay consistent.
 */
export async function fetchLeaderboard(forceRefresh = false) {
  if (!forceRefresh) {
    const cached = cacheGet('all');
    if (cached) return cached;
  }
  if (!supabase) return null;

  const { data: events, error } = await supabase
    .from('score_events')
    .select('telegram_id, points');
  if (error) {
    console.warn('[api] fetchLeaderboard events error:', error.message);
    return null;
  }

  const totals = {};
  for (const e of events || []) {
    const key = String(e.telegram_id);
    totals[key] = (totals[key] || 0) + e.points;
  }

  const ids = Object.keys(totals).map(Number);
  if (!ids.length) { cacheSet('all', []); return []; }

  const { data: users, error: err2 } = await supabase
    .from('users')
    .select('telegram_id, first_name, last_name, username')
    .in('telegram_id', ids);
  if (err2) {
    console.warn('[api] fetchLeaderboard users error:', err2.message);
    return null;
  }

  const result = (users || [])
    .map(u => ({ ...u, score: totals[String(u.telegram_id)] || 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);
  cacheSet('all', result);
  return result;
}

/**
 * Fetch total score for a single user from score_events.
 */
export async function fetchUserScore(telegramId) {
  if (!supabase || !telegramId) return 0;
  const { data, error } = await supabase
    .from('score_events')
    .select('points')
    .eq('telegram_id', telegramId);
  if (error) { console.warn('[api] fetchUserScore error:', error.message); return 0; }
  return (data || []).reduce((sum, e) => sum + (e.points || 0), 0);
}

/**
 * Fetch leaderboard for a time period.
 * period: 'week' | 'day'
 */
export async function fetchLeaderboardPeriod(period, forceRefresh = false) {
  if (!forceRefresh) {
    const cached = cacheGet(period);
    if (cached) return cached;
  }
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
    console.warn('[api] fetchLeaderboardPeriod error:', error.message, '— falling back to all-time');
    return fetchLeaderboard();
  }

  if (!events || events.length === 0) return [];

  // Aggregate points by user
  const totals = {};
  for (const e of events) {
    const key = String(e.telegram_id);
    totals[key] = (totals[key] || 0) + e.points;
  }

  // Fetch user info for aggregated IDs
  const ids = Object.keys(totals).map(Number);
  const { data: users, error: err2 } = await supabase
    .from('users')
    .select('telegram_id, first_name, last_name, username')
    .in('telegram_id', ids);

  if (err2) {
    console.warn('[api] fetchLeaderboardPeriod users error:', err2.message);
    return fetchLeaderboard();
  }

  const result = (users || [])
    .map(u => ({ ...u, score: totals[String(u.telegram_id)] || 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);
  cacheSet(period, result);
  return result;
}

// ─── Profile ──────────────────────────────────────────

export async function fetchUserPhone(telegramId) {
  if (!supabase || !telegramId) return null;
  const { data } = await supabase
    .from('users')
    .select('phone')
    .eq('telegram_id', telegramId)
    .single();
  return data?.phone || null;
}

export async function updateUserProfile(telegramId, { phone, email, displayName }) {
  if (!supabase || !telegramId) return;
  const update = { updated_at: new Date().toISOString() };
  if (phone !== undefined) update.phone = phone;
  if (email !== undefined) update.email = email;
  if (displayName !== undefined) update.display_name = displayName;
  const { error } = await supabase.from('users').update(update).eq('telegram_id', telegramId);
  if (error) console.warn('[api] updateUserProfile error:', error.message);
}

// ─── Referrals ────────────────────────────────────────

export async function addReferral(referrerId, refereeId) {
  if (!supabase || !referrerId || !refereeId || String(referrerId) === String(refereeId)) return false;
  const { error } = await supabase
    .from('referrals')
    .upsert({ referrer_id: referrerId, referee_id: refereeId }, { onConflict: 'referee_id', ignoreDuplicates: true });
  if (error) console.warn('[api] addReferral error:', error.message);
  return !error;
}

export async function getReferralCount(telegramId) {
  if (!supabase || !telegramId) return 0;
  const { count, error } = await supabase
    .from('referrals')
    .select('*', { count: 'exact', head: true })
    .eq('referrer_id', telegramId);
  if (error) return 0;
  return count || 0;
}
