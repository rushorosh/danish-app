import { supabase } from '../lib/supabase.js';

// ─── Cache ───────────────────────────────────────────
const _cache = {};
const RATING_TTL = 30 * 1000;      // 30 sec for leaderboards

function cacheGet(key, ttl = RATING_TTL) {
  const entry = _cache[key];
  if (entry && Date.now() - entry.ts < ttl) return entry.data;
  return null;
}
function cacheSet(key, data) { _cache[key] = { data, ts: Date.now() }; }


/** Preload all three leaderboard tabs on app start */
export function preloadRatings() {
  fetchLeaderboard('all');
  fetchLeaderboard('day');
  fetchLeaderboard('week');
}

export function invalidateRatingsCache() {
  delete _cache['lb_all'];
  delete _cache['lb_day'];
  delete _cache['lb_week'];
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
 * Record score via add_score RPC (writes to scores_alltime, scores_daily, scores_weekly atomically).
 * Returns the new all-time score from scores_alltime.
 */
export async function recordScore(telegramId, points) {
  if (!supabase || !telegramId || !points) return null;
  const tid = Number(telegramId);

  const { data: newScore, error: rpcErr } = await supabase.rpc('add_score', { p_tid: tid, p_points: points });

  if (rpcErr) {
    console.warn('[api] add_score RPC failed:', rpcErr.message);
  }

  invalidateRatingsCache();

  // Return fresh alltime score from scores_alltime (same source as leaderboard)
  const { data: updated } = await supabase
    .from('scores_alltime').select('score').eq('telegram_id', tid).single();
  return updated?.score ?? (typeof newScore === 'number' ? newScore : null);
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

// ─── Score helpers ────────────────────────────────────
export async function addScoreEvent(telegramId, points) {
  return recordScore(telegramId, points);
}

/** Get user's total score from score_events (source of truth for header). */
export async function fetchUserScore(telegramId) {
  if (!supabase || !telegramId) return 0;
  const { data, error } = await supabase
    .from('score_events')
    .select('points')
    .eq('telegram_id', Number(telegramId));
  if (error) { console.warn('[api] fetchUserScore:', error.message); return 0; }
  return (data || []).reduce((sum, e) => sum + (e.points || 0), 0);
}

// ─── Leaderboard ─────────────────────────────────────

/**
 * Unified leaderboard fetch.
 * period: 'all' | 'day' | 'week'
 * Each period reads from its own pre-aggregated table (reset by pg_cron for day/week).
 */
export async function fetchLeaderboard(period = 'all', forceRefresh = false) {
  const key = `lb_${period}`;
  if (!forceRefresh) {
    const cached = cacheGet(key);
    if (cached) return cached;
  }
  if (!supabase) return null;

  const table = period === 'all' ? 'scores_alltime'
    : period === 'day' ? 'scores_daily'
    : 'scores_weekly';

  const { data: scores, error } = await supabase
    .from(table)
    .select('telegram_id, score')
    .gt('score', 0)
    .order('score', { ascending: false })
    .limit(50);

  if (error) {
    console.warn(`[api] fetchLeaderboard ${period}:`, error.message, error.code, error.details);
    return { __error: error.message || 'DB error' };
  }
  if (!scores || scores.length === 0) { cacheSet(key, []); return []; }

  // Fetch user display info
  const ids = scores.map(s => s.telegram_id);
  const { data: users, error: err2 } = await supabase
    .from('users')
    .select('telegram_id, first_name, last_name, username')
    .in('telegram_id', ids);

  if (err2) { console.warn(`[api] fetchLeaderboard ${period} users:`, err2.message); return []; }

  const userMap = Object.fromEntries((users || []).map(u => [String(u.telegram_id), u]));
  const result = scores.map(s => ({
    ...userMap[String(s.telegram_id)],
    telegram_id: s.telegram_id,
    score: s.score,
  }));
  cacheSet(key, result);
  return result;
}

/** @deprecated use fetchLeaderboard('day'|'week') */
export async function fetchLeaderboardPeriod(period, forceRefresh = false) {
  return fetchLeaderboard(period, forceRefresh);
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

// ─── User data sync (cross-device) ───────────────────

/**
 * Save all local user data to DB for cross-device sync.
 * data: { srs, knownWords, streak, settings, progress }
 */
export async function saveUserData(telegramId, data) {
  if (!supabase || !telegramId) return;
  const { error } = await supabase
    .from('users')
    .update({ user_data: data })
    .eq('telegram_id', Number(telegramId));
  if (error) console.warn('[api] saveUserData:', error.message);
}

/**
 * Load user_data blob from DB. Returns null on failure.
 */
export async function loadUserData(telegramId) {
  if (!supabase || !telegramId) return null;
  const { data, error } = await supabase
    .from('users')
    .select('user_data')
    .eq('telegram_id', Number(telegramId))
    .single();
  if (error) { console.warn('[api] loadUserData:', error.message); return null; }
  return data?.user_data || null;
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
