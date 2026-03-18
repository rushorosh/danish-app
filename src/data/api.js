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

function getWeekStart() {
  const d = new Date();
  const diff = d.getDay() === 0 ? -6 : 1 - d.getDay(); // Monday
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

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
 * Record score: writes to score_events (guaranteed) + tries add_score RPC (best effort).
 * score_events serves as the reliable fallback for leaderboards.
 */
export async function recordScore(telegramId, points) {
  if (!supabase || !telegramId || !points) return;
  const tid = Number(telegramId);

  // 1. Always write to score_events (source of truth for day/week leaderboard)
  await supabase.from('score_events').insert({
    telegram_id: tid,
    points,
    created_at: new Date().toISOString(),
  });

  // 2. Try RPC to update users.score (all-time leaderboard)
  const { error: rpcErr } = await supabase.rpc('add_score', { p_tid: tid, p_points: points });

  // 3. If RPC failed — update users.score directly (read-modify-write, safe: 1 session per user)
  if (rpcErr) {
    console.warn('[api] add_score RPC failed, using direct update:', rpcErr.message);
    const { data: user } = await supabase
      .from('users').select('score').eq('telegram_id', tid).single();
    if (user != null) {
      await supabase
        .from('users')
        .update({ score: (user.score || 0) + points })
        .eq('telegram_id', tid);
    }
  }

  invalidateRatingsCache();
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
 * Reads from pre-aggregated tables — no heavy aggregation at query time.
 */
export async function fetchLeaderboard(period = 'all', forceRefresh = false) {
  const key = `lb_${period}`;
  if (!forceRefresh) {
    const cached = cacheGet(key);
    if (cached) return cached;
  }
  if (!supabase) return null;

  let scores, err1;

  if (period === 'all') {
    ({ data: scores, error: err1 } = await supabase
      .from('users')
      .select('telegram_id, first_name, last_name, username, score')
      .gt('score', 0)
      .order('score', { ascending: false })
      .limit(50));
    if (err1) { console.warn('[api] fetchLeaderboard all:', err1.message); return null; }
    const result = (scores || []);
    cacheSet(key, result);
    return result;
  }

  // day or week — always read from score_events (always written, single source of truth)
  const since = period === 'day'
    ? new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
    : new Date(getWeekStart() + 'T00:00:00.000Z').toISOString();

  const { data: events, error: evErr } = await supabase
    .from('score_events')
    .select('telegram_id, points')
    .gte('created_at', since);

  if (evErr) { console.warn(`[api] fetchLeaderboard ${period}:`, evErr.message); return null; }

  const totals = {};
  for (const e of events || []) {
    const k = String(e.telegram_id);
    totals[k] = (totals[k] || 0) + e.points;
  }
  scores = Object.entries(totals)
    .map(([tid, score]) => ({ telegram_id: Number(tid), score }))
    .sort((a, b) => b.score - a.score).slice(0, 50);

  if (!scores || scores.length === 0) { cacheSet(key, []); return []; }

  // Fetch user info for those IDs
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
