import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { upsertUser, updateScore, addScoreEvent, loadProgress, addReferral, saveProgress, preloadRatings } from './data/api.js';
import { markNodeComplete, markSectionComplete, setProgressData } from './data/progress.js';
import VocabScreen from './screens/VocabScreen';
import SRSReviewScreen from './screens/SRSReviewScreen';
import './App.css';

const TABS = ['translate', 'learn', 'vocab', 'games', 'rating', 'settings'];

const AVATARS = ['🦊','🐺','🦋','🦁','🐸','🦅','🐬','🦉','🐝','🏆'];
function pickAvatar(id) {
  return AVATARS[Math.abs(Number(id) || 0) % AVATARS.length];
}

export default function App() {
  const [activeTab, setActiveTab] = useState('learn');
  const [activeGame, setActiveGame] = useState(null);
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

  const scoreDebounce = useRef(null);

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

        upsertUser({
          telegramId: u.id,
          username: u.username,
          firstName: u.first_name,
          lastName: u.last_name,
        }).then(dbUser => {
          if (dbUser) {
            const dbScore = dbUser.score ?? 0;
            setUserScore(dbScore);
            localStorage.setItem('az_score', String(dbScore));
          }
        });

        loadProgress(u.id).then(dbProgress => {
          if (dbProgress !== null) {
            localStorage.setItem('az_progress', JSON.stringify(dbProgress));
            setProgressData(dbProgress);
            setProgressVersion(v => v + 1);
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
    setUserScore(prev => {
      const newScore = prev + points;
      localStorage.setItem('az_score', String(newScore));
      const tid = localStorage.getItem('az_tg_id');
      if (tid) addScoreEvent(tid, points);
      if (scoreDebounce.current) clearTimeout(scoreDebounce.current);
      scoreDebounce.current = setTimeout(() => {
        if (tid) updateScore(tid, newScore);
      }, 2000);
      return newScore;
    });
  }, []);

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
    }
    setActiveLesson(null);
  }, [activeLesson, addScore]);

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
            setActiveGame(null);
          }}
        />
      </LanguageContext.Provider>
    );
  }
  if (activeGame === 'flashcards') {
    return (
      <LanguageContext.Provider value={language}>
        <FlashcardsGame onBack={() => setActiveGame(null)} onScoreUpdate={handleScoreUpdate} />
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
