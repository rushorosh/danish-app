import React, { useState, useEffect, useCallback, useRef } from 'react';
import ProgressHeader from './components/ProgressHeader';
import TabBar from './components/TabBar';
import TranslateScreen from './screens/TranslateScreen';
import LearnScreen from './screens/LearnScreen';
import GamesScreen from './screens/GamesScreen';
import FlashcardsGame from './screens/FlashcardsGame';
import ListeningGame from './screens/ListeningGame';
import LessonScreen from './screens/LessonScreen';
import RatingScreen from './screens/RatingScreen';
import { upsertUser, updateScore, addScoreEvent, loadProgress } from './data/api.js';
import { markSectionComplete, setProgressData } from './data/progress.js';
import { saveProgress } from './data/api.js';
import './App.css';

const TABS = ['translate', 'learn', 'games', 'rating'];
const TAB_LABELS = {
  translate: 'Перевод',
  learn: 'Обучение',
  games: 'Игры',
  rating: 'Рейтинг',
};

const AVATARS = ['🦊','🐺','🦋','🦁','🐸','🦅','🐬','🦉','🐝','🏆'];
function pickAvatar(id) {
  return AVATARS[Math.abs(Number(id) || 0) % AVATARS.length];
}

export default function App() {
  const [activeTab, setActiveTab] = useState('learn');
  const [activeGame, setActiveGame] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null); // { moduleId, sectionId, mod, sec }
  const [progressVersion, setProgressVersion] = useState(0); // force LearnScreen refresh

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

  // Telegram WebApp init + Supabase user sync
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
          if (dbUser && dbUser.score > parseInt(localStorage.getItem('az_score') || '0')) {
            setUserScore(dbUser.score);
            localStorage.setItem('az_score', String(dbUser.score));
          }
        });

        loadProgress(u.id).then(dbProgress => {
          if (dbProgress) {
            const local = JSON.parse(localStorage.getItem('az_progress') || '{}');
            const merged = { ...local, ...dbProgress };
            localStorage.setItem('az_progress', JSON.stringify(merged));
            setProgressData(merged);
            setProgressVersion(v => v + 1);
          }
        });
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

  // Called from LearnScreen when user taps a section node
  const handleStartLesson = useCallback((mod, sec) => {
    setActiveLesson({ moduleId: mod.id, sectionId: sec.id, mod, sec });
  }, []);

  // Called from LessonScreen when lesson finishes
  const handleLessonComplete = useCallback((passed, earnedScore) => {
    if (passed && activeLesson) {
      markSectionComplete(activeLesson.moduleId, activeLesson.sectionId);
      const tid = localStorage.getItem('az_tg_id');
      if (tid) saveProgress(tid, activeLesson.moduleId, activeLesson.sectionId);
      setProgressVersion(v => v + 1);
      if (earnedScore > 0) addScore(earnedScore);
    }
    setActiveLesson(null);
  }, [activeLesson, addScore]);

  // Full-screen overlays (no header/tabbar)
  if (activeGame === 'flashcards') {
    return <FlashcardsGame onBack={() => setActiveGame(null)} onScoreUpdate={handleScoreUpdate} />;
  }
  if (activeGame === 'listening') {
    return <ListeningGame onBack={() => setActiveGame(null)} onScoreUpdate={handleScoreUpdate} />;
  }
  if (activeLesson) {
    return (
      <LessonScreen
        moduleId={activeLesson.moduleId}
        sectionId={activeLesson.sectionId}
        mod={activeLesson.mod}
        sec={activeLesson.sec}
        onComplete={handleLessonComplete}
        onClose={() => setActiveLesson(null)}
      />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'translate':
        return <TranslateScreen />;
      case 'learn':
        return (
          <LearnScreen
            key={progressVersion}
            onStartLesson={handleStartLesson}
          />
        );
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
      default:
        return null;
    }
  };

  return (
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
        labels={TAB_LABELS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
}
