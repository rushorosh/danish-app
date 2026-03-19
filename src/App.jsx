import React, { useState, useEffect, useCallback } from 'react';
import { LanguageContext } from './data/LanguageContext.jsx';
import { getSettings, saveSettings } from './data/settings.js';
import ProgressHeader from './components/ProgressHeader';
import TabBar from './components/TabBar';
import TranslateScreen from './screens/TranslateScreen';
import LearnScreen from './screens/LearnScreen';
import GamesScreen from './screens/GamesScreen';
import FlashcardsGame from './screens/FlashcardsGame';
import ListeningGame from './screens/ListeningGame';
import LessonScreen from './screens/LessonScreen';
import RatingScreen from './screens/RatingScreen';
import SettingsScreen from './screens/SettingsScreen';
import { upsertUser, recordScore, loadProgress, addReferral, saveProgress, preloadRatings, saveUserData, loadUserData } from './data/api.js';
import { markNodeComplete, markSectionComplete, setProgressData, getProgress } from './data/progress.js';
import VocabScreen from './screens/VocabScreen';
import SRSReviewScreen from './screens/SRSReviewScreen';
import './App.css';

const TABS = ['translate', 'learn', 'vocab', 'games', 'rating', 'settings'];

const AVATARS = ['🦊','🐺','🦋','🦁','🐸','🦅','🐬','🦉','🐝','🏆'];
function pickAvatar(id) {
  return AVATARS[Math.abs(Number(id) || 0) % AVATARS.length];
}

// ─── Cross-device sync helpers ────────────────────────

function gatherLocalData() {
  const parse = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || fallback); } catch { return JSON.parse(fallback); } };
  return {
    srs: parse('az_srs', '{}'),
    knownWords: parse('az_known_words', '[]'),
    streak: {
      count: parseInt(localStorage.getItem('az_streak_count') || '0'),
      date: localStorage.getItem('az_streak_date') || '',
    },
    settings: parse('az_settings', '{}'),
    progress: parse('az_progress', '{}'),
  };
}

function mergeUserData(dbData) {
  if (!dbData) return;

  // SRS: merge per word, keep the entry with higher box level
  if (dbData.srs && Object.keys(dbData.srs).length) {
    const local = (() => { try { return JSON.parse(localStorage.getItem('az_srs') || '{}'); } catch { return {}; } })();
    const merged = { ...dbData.srs };
    for (const [key, entry] of Object.entries(local)) {
      if (!merged[key] || entry.box > merged[key].box) merged[key] = entry;
    }
    localStorage.setItem('az_srs', JSON.stringify(merged));
  }

  // Known words: union of both sets
  if (dbData.knownWords?.length) {
    const localSet = new Set((() => { try { return JSON.parse(localStorage.getItem('az_known_words') || '[]'); } catch { return []; } })());
    dbData.knownWords.forEach(w => localSet.add(w));
    localStorage.setItem('az_known_words', JSON.stringify([...localSet]));
  }

  // Streak: take the more recent date
  if (dbData.streak?.date) {
    const localDate = localStorage.getItem('az_streak_date') || '';
    if (dbData.streak.date > localDate) {
      localStorage.setItem('az_streak_date', dbData.streak.date);
      localStorage.setItem('az_streak_count', String(dbData.streak.count || 0));
    }
  }

  // Settings: apply language from DB only if not set locally
  if (dbData.settings?.language) {
    const local = (() => { try { return JSON.parse(localStorage.getItem('az_settings') || '{}'); } catch { return {}; } })();
    if (!local.language) localStorage.setItem('az_settings', JSON.stringify({ ...local, ...dbData.settings }));
  }

  // Progress: merge (DB + local, local wins on conflict)
  if (dbData.progress && Object.keys(dbData.progress).length) {
    const local = (() => { try { return JSON.parse(localStorage.getItem('az_progress') || '{}'); } catch { return {}; } })();
    localStorage.setItem('az_progress', JSON.stringify({ ...dbData.progress, ...local }));
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('learn');
  const [activeGame, setActiveGame] = useState(null);
  const [gameKey, setGameKey] = useState(0);
  const [activeLesson, setActiveLesson] = useState(null);
  const [progressVersion, setProgressVersion] = useState(0);
  const [language, setLanguage] = useState(() => getSettings().language);

  const [userScore, setUserScore] = useState(() =>
    parseInt(localStorage.getItem('az_score') || '0')
  );
  const [userName, setUserName] = useState(() =>
    localStorage.getItem('az_name') || 'Вы'
  );
  const [telegramId, setTelegramId] = useState(() =>
    localStorage.getItem('az_tg_id') || null
  );

  // Preload ratings in background on startup
  useEffect(() => { preloadRatings(); }, []);

  // Telegram WebApp init + Supabase sync + referral detection
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      tg.setHeaderColor('#FFFFFF');
      tg.setBackgroundColor('#FFFFFF');
      const u = tg.initDataUnsafe?.user;
      if (u) {
        const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Вы';
        setUserName(name);
        setTelegramId(String(u.id));
        localStorage.setItem('az_name', name);
        localStorage.setItem('az_tg_id', String(u.id));

        // upsertUser returns users.score — same source as all-time leaderboard
        upsertUser({
          telegramId: u.id,
          username: u.username,
          firstName: u.first_name,
          lastName: u.last_name,
        }).then(dbUser => {
          if (dbUser && dbUser.score != null) {
            setUserScore(prev => {
              const result = Math.max(prev, dbUser.score);
              localStorage.setItem('az_score', String(result));
              return result;
            });
          }
        });

        loadProgress(u.id).then(dbProgress => {
          if (dbProgress !== null) {
            // Merge: local node-level keys + DB section-level keys (DB wins for sections)
            const local = getProgress();
            const merged = { ...local, ...dbProgress };
            setProgressData(merged);
            setProgressVersion(v => v + 1);
          }
        });

        // Cross-device sync: restore SRS, known words, streak, settings from DB
        loadUserData(u.id).then(dbData => {
          if (dbData) {
            mergeUserData(dbData);
            setProgressVersion(v => v + 1); // re-render learn screen with restored progress
          }
        });

        // Referral detection via start_param
        const startParam = tg.initDataUnsafe?.start_param;
        if (startParam?.startsWith('ref_')) {
          const referrerId = startParam.replace('ref_', '');
          if (referrerId && referrerId !== String(u.id)) {
            addReferral(referrerId, u.id).then(ok => {
              if (ok) {
                // +50 points to referrer
                addScoreEvent(referrerId, 50);
              }
            });
          }
        }
      }
    }
  }, []);

  const addScore = useCallback((points) => {
    if (!points || points <= 0) return;
    // Optimistic update for instant feedback
    setUserScore(prev => {
      const n = prev + points;
      localStorage.setItem('az_score', String(n));
      return n;
    });
    const tid = localStorage.getItem('az_tg_id');
    if (tid) {
      // After DB write, sync header with actual users.score (same source as all-time leaderboard)
      recordScore(tid, points).then(dbScore => {
        if (dbScore != null) {
          setUserScore(prev => {
            const result = Math.max(prev, dbScore);
            localStorage.setItem('az_score', String(result));
            return result;
          });
        }
      });
    }
  }, []);

  const syncUserData = useCallback(() => {
    const tid = localStorage.getItem('az_tg_id');
    if (tid) saveUserData(tid, gatherLocalData());
  }, []);

  // Sync when user hides the app or closes tab
  useEffect(() => {
    const onHide = () => { if (document.visibilityState === 'hidden') syncUserData(); };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [syncUserData]);

  const handleTabChange = useCallback((tab) => {
    setActiveGame(null);
    setActiveLesson(null);
    setActiveTab(tab);
  }, []);

  const handleScoreUpdate = useCallback((points) => {
    if (points > 0) addScore(points);
  }, [addScore]);

  const handleStartLesson = useCallback((mod, sec, nodeIdx) => {
    setActiveLesson({ moduleId: mod.id, sectionId: sec.id, mod, sec, nodeIdx });
  }, []);

  const handleLessonComplete = useCallback((passed, earnedScore) => {
    if (passed && activeLesson) {
      const { moduleId, sectionId, nodeIdx } = activeLesson;
      let sectionJustDone = false;
      if (nodeIdx != null) {
        sectionJustDone = markNodeComplete(moduleId, sectionId, nodeIdx + 1);
      } else {
        markSectionComplete(moduleId, sectionId);
        sectionJustDone = true;
      }
      if (sectionJustDone) {
        const tid = localStorage.getItem('az_tg_id');
        if (tid) saveProgress(tid, moduleId, sectionId);
      }
      setProgressVersion(v => v + 1);
      if (earnedScore > 0) addScore(earnedScore);
      syncUserData();
    }
    setActiveLesson(null);
  }, [activeLesson, addScore, syncUserData]);

  const handleSettingsChange = useCallback((next) => {
    if (next.language) setLanguage(next.language);
  }, []);

  // Full-screen overlays
  if (activeGame === 'srs-review') {
    return (
      <LanguageContext.Provider value={language}>
        <SRSReviewScreen
          onBack={() => setActiveGame(null)}
          onComplete={(correct) => {
            if (correct > 0) addScore(correct * 2);
            syncUserData();
            setActiveGame(null);
          }}
        />
      </LanguageContext.Provider>
    );
  }
  if (activeGame === 'flashcards') {
    return (
      <LanguageContext.Provider value={language}>
        <FlashcardsGame
          key={gameKey}
          onBack={() => setActiveGame(null)}
          onScoreUpdate={handleScoreUpdate}
          onRestart={() => setGameKey(k => k + 1)}
        />
      </LanguageContext.Provider>
    );
  }
  if (activeGame === 'listening') {
    return (
      <LanguageContext.Provider value={language}>
        <ListeningGame onBack={() => setActiveGame(null)} onScoreUpdate={handleScoreUpdate} />
      </LanguageContext.Provider>
    );
  }
  if (activeLesson) {
    return (
      <LanguageContext.Provider value={language}>
        <LessonScreen
          moduleId={activeLesson.moduleId}
          sectionId={activeLesson.sectionId}
          mod={activeLesson.mod}
          sec={activeLesson.sec}
          nodeIdx={activeLesson.nodeIdx}
          onComplete={handleLessonComplete}
          onClose={() => setActiveLesson(null)}
        />
      </LanguageContext.Provider>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'translate':
        return <TranslateScreen />;
      case 'learn':
        return <LearnScreen key={progressVersion} onStartLesson={handleStartLesson} />;
      case 'games':
        return (
          <GamesScreen
            userScore={userScore}
            onOpenFlashcards={() => setActiveGame('flashcards')}
            onOpenListening={() => setActiveGame('listening')}
          />
        );
      case 'rating':
        return (
          <RatingScreen
            userScore={userScore}
            userName={userName}
            telegramId={telegramId}
            userAvatar={pickAvatar(telegramId)}
          />
        );
      case 'vocab':
        return (
          <VocabScreen
            onStartReview={() => setActiveGame('srs-review')}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            telegramId={telegramId}
            onSettingsChange={handleSettingsChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <LanguageContext.Provider value={language}>
      <div className="app">
        <ProgressHeader
          score={userScore}
          onScoreClick={() => handleTabChange('rating')}
        />
        <main className="app__content">
          {renderContent()}
        </main>
        <TabBar
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          language={language}
        />
      </div>
    </LanguageContext.Provider>
  );
}
