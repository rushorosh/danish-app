import React, { useState, useEffect, useCallback } from 'react';
import ProgressHeader from './components/ProgressHeader';
import TabBar from './components/TabBar';
import TranslateScreen from './screens/TranslateScreen';
import LearnScreen from './screens/LearnScreen';
import GamesScreen from './screens/GamesScreen';
import FlashcardsGame from './screens/FlashcardsGame';
import ListeningGame from './screens/ListeningGame';
import RatingScreen from './screens/RatingScreen';
import { saveUserScore } from './data/leaderboard.js';
import './App.css';

const TABS = ['translate', 'learn', 'games', 'rating'];
const TAB_LABELS = {
  translate: 'Перевод',
  learn: 'Обучение',
  games: 'Игры',
  rating: 'Рейтинг',
};

export default function App() {
  const [activeTab, setActiveTab] = useState('learn');
  const [activeGame, setActiveGame] = useState(null); // null | 'flashcards' | 'listening'

  const [userScore, setUserScore] = useState(() =>
    parseInt(localStorage.getItem('az_score') || '0')
  );
  const [userName, setUserName] = useState(() =>
    localStorage.getItem('az_name') || 'Вы'
  );

  // Telegram WebApp init
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
        localStorage.setItem('az_name', name);
      }
    }
  }, []);

  const addScore = useCallback((points) => {
    setUserScore(prev => {
      const newScore = prev + points;
      localStorage.setItem('az_score', String(newScore));
      saveUserScore(userName, newScore);
      return newScore;
    });
  }, [userName]);

  const handleTabChange = useCallback((tab) => {
    setActiveGame(null);
    setActiveTab(tab);
  }, []);

  const handleOpenFlashcards = useCallback(() => {
    setActiveGame('flashcards');
  }, []);

  const handleOpenListening = useCallback(() => {
    setActiveGame('listening');
  }, []);

  const handleGameBack = useCallback(() => {
    setActiveGame(null);
  }, []);

  const handleScoreUpdate = useCallback((points) => {
    if (points > 0) addScore(points);
  }, [addScore]);

  // Full-screen game overlay (no header/tabbar)
  if (activeGame === 'flashcards') {
    return (
      <FlashcardsGame
        onBack={handleGameBack}
        onScoreUpdate={handleScoreUpdate}
      />
    );
  }

  if (activeGame === 'listening') {
    return (
      <ListeningGame
        onBack={handleGameBack}
        onScoreUpdate={handleScoreUpdate}
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
            onScoreUpdate={handleScoreUpdate}
          />
        );
      case 'games':
        return (
          <GamesScreen
            userScore={userScore}
            onOpenFlashcards={handleOpenFlashcards}
            onOpenListening={handleOpenListening}
          />
        );
      case 'rating':
        return (
          <RatingScreen
            userScore={userScore}
            userName={userName}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <ProgressHeader score={userScore} />
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
