import React, { useState, useMemo } from 'react';
import { COURSE } from '../data/course.js';
import { getProgress, isSectionComplete } from '../data/progress.js';
import './LearnScreen.css';

// Zigzag positions for 10 sections per module
const ZIGZAG = [
  'center', 'right', 'center', 'left',
  'center', 'right', 'center', 'left',
  'center', 'center',
];

// Horizontal % for each position (used for connector dots and character placement)
const POS_PCT = { left: 18, center: 50, right: 82 };

// Animated characters: one per section per module
// Each entry: { figure, action, anim }
const CHARS = [
  // Module 1 — Greetings
  [
    { figure: '🧔🏻', action: '👋', anim: 'wave' },
    { figure: '👩🏻', action: '🙏', anim: 'bow' },
    { figure: '🧑🏻', action: '🤝', anim: 'bob' },
    { figure: '👩🏻‍🦱', action: '👋', anim: 'wave' },
    { figure: '👨🏻', action: '☀️', anim: 'bounce' },
    { figure: '👩🏻', action: '🤔', anim: 'think' },
    { figure: '🧔🏻', action: '💬', anim: 'talk' },
    { figure: '👩🏻‍🦳', action: '😊', anim: 'bounce' },
    { figure: '👦🏻', action: '📚', anim: 'bob' },
    { figure: '👧🏻', action: '⭐', anim: 'bounce' },
  ],
  // Module 2 — Numbers & Colors
  [
    { figure: '🧒🏻', action: '✋', anim: 'count' },
    { figure: '👩🏻', action: '🔢', anim: 'bounce' },
    { figure: '👨🏻‍🎨', action: '🎨', anim: 'bob' },
    { figure: '👩🏻‍🎨', action: '🌈', anim: 'bounce' },
    { figure: '🧔🏻', action: '🤔', anim: 'think' },
    { figure: '👩🏻', action: '✏️', anim: 'bob' },
    { figure: '👨🏻', action: '📏', anim: 'bob' },
    { figure: '👩🏻‍🦱', action: '📊', anim: 'bounce' },
    { figure: '👦🏻', action: '📚', anim: 'bob' },
    { figure: '👧🏻', action: '⭐', anim: 'bounce' },
  ],
  // Module 3 — Food & Drinks
  [
    { figure: '🧔🏻', action: '🍵', anim: 'drink' },
    { figure: '👩🏻', action: '🍑', anim: 'eat' },
    { figure: '👨🏻', action: '🍅', anim: 'eat' },
    { figure: '👩🏻‍🍳', action: '🥘', anim: 'cook' },
    { figure: '🧑🏻', action: '😋', anim: 'eat' },
    { figure: '👩🏻', action: '☕', anim: 'drink' },
    { figure: '🧔🏻', action: '📋', anim: 'bob' },
    { figure: '👩🏻‍🦱', action: '🛒', anim: 'walk' },
    { figure: '👦🏻', action: '📚', anim: 'bob' },
    { figure: '👧🏻', action: '⭐', anim: 'bounce' },
  ],
  // Module 4 — Family & Home
  [
    { figure: '👨🏻', action: '🤗', anim: 'bounce' },
    { figure: '👶🏻', action: '😊', anim: 'bounce' },
    { figure: '👩🏻', action: '👨‍👩‍👧‍👦', anim: 'bob' },
    { figure: '🧔🏻', action: '🏠', anim: 'bob' },
    { figure: '👩🏻‍🦱', action: '🌿', anim: 'bob' },
    { figure: '👧🏻', action: '🐱', anim: 'bounce' },
    { figure: '👨🏻', action: '🦅', anim: 'bounce' },
    { figure: '👩🏻‍🦳', action: '💕', anim: 'bounce' },
    { figure: '👦🏻', action: '📚', anim: 'bob' },
    { figure: '👧🏻', action: '⭐', anim: 'bounce' },
  ],
  // Module 5 — City & Verbs
  [
    { figure: '🧔🏻', action: '🏙️', anim: 'walk' },
    { figure: '👩🏻', action: '🚌', anim: 'walk' },
    { figure: '🏃🏻', action: '', anim: 'walk' },
    { figure: '👩🏻‍🦱', action: '⚡', anim: 'bounce' },
    { figure: '🧑🏻', action: '🗺️', anim: 'think' },
    { figure: '👨🏻', action: '⏰', anim: 'bob' },
    { figure: '👩🏻‍💼', action: '💼', anim: 'bob' },
    { figure: '🧔🏻', action: '🌿', anim: 'bob' },
    { figure: '👦🏻', action: '📚', anim: 'bob' },
    { figure: '👧🏻', action: '⭐', anim: 'bounce' },
  ],
];

export default function LearnScreen({ onStartLesson }) {
  const [progress] = useState(() => getProgress());

  const nextSection = useMemo(() => {
    for (const mod of COURSE) {
      for (const sec of mod.sections) {
        if (!isSectionComplete(mod.id, sec.id, progress)) {
          return { mod, sec };
        }
      }
    }
    return null;
  }, [progress]);

  const getSectionStatus = (moduleId, sectionId) => {
    if (isSectionComplete(moduleId, sectionId, progress)) return 'completed';
    if (moduleId === 1 && sectionId === 1) return 'active';
    const prevSec =
      sectionId > 1
        ? { mid: moduleId, sid: sectionId - 1 }
        : { mid: moduleId - 1, sid: 10 };
    if (prevSec.mid < 1) return 'active';
    if (isSectionComplete(prevSec.mid, prevSec.sid, progress)) return 'active';
    return 'locked';
  };

  const handleSectionClick = (mod, sec, status) => {
    if (status === 'locked') return;
    onStartLesson?.(mod, sec);
  };

  return (
    <div className="learn-screen">
      {/* Top banner */}
      {nextSection && (
        <div
          className="learn-banner"
          style={{ background: nextSection.mod.color }}
          onClick={() => handleSectionClick(nextSection.mod, nextSection.sec, getSectionStatus(nextSection.mod.id, nextSection.sec.id))}
        >
          <div className="learn-banner__text">
            <div className="learn-banner__meta">
              МОДУЛЬ {nextSection.mod.id}, РАЗДЕЛ {nextSection.sec.id}
            </div>
            <div className="learn-banner__title">{nextSection.sec.title}</div>
          </div>
          <div className="learn-banner__icon">{nextSection.sec.mascot || nextSection.sec.icon}</div>
        </div>
      )}

      {/* Module path */}
      <div className="learn-path">
        {COURSE.map((mod, modIdx) => {
          // Only Module 1 is fully visible; all others are fogged
          const isFogModule = modIdx >= 1;

          return (
            <div key={mod.id} className="learn-module-group">
              {/* Module header */}
              <div className="learn-module-header">
                <div className="learn-module-header__line" />
                <div
                  className="learn-module-header__label"
                  style={{ color: mod.color }}
                >
                  МОДУЛЬ {mod.id} · {mod.title}
                </div>
                <div className="learn-module-header__line" />
              </div>

              {/* Section nodes with connectors and characters */}
              {mod.sections.map((sec, secIdx) => {
                const status = getSectionStatus(mod.id, sec.id);
                const pos = ZIGZAG[secIdx % ZIGZAG.length];
                const nextPos = ZIGZAG[(secIdx + 1) % ZIGZAG.length];
                const charData = CHARS[modIdx]?.[secIdx];

                // Character goes on opposite side from the node
                let charSide;
                if (pos === 'left') charSide = 'right';
                else if (pos === 'right') charSide = 'left';
                else charSide = secIdx % 2 === 0 ? 'right' : 'left';

                return (
                  <React.Fragment key={sec.id}>
                    {/* Node row */}
                    <div
                      className={`learn-node-row learn-node-row--${pos}${
                        isFogModule ? ' learn-node-row--fog' : ''
                      }`}
                    >
                      <button
                        className={`learn-node learn-node--${status}`}
                        style={
                          status !== 'locked'
                            ? {
                                '--node-color': mod.color,
                                '--node-shadow': mod.shadowColor,
                              }
                            : {}
                        }
                        onClick={() => handleSectionClick(mod, sec, status)}
                        disabled={status === 'locked'}
                      >
                        <div className="learn-node__circle">
                          {status === 'completed' ? (
                            <span className="learn-node__check">✓</span>
                          ) : status === 'locked' ? (
                            <span className="learn-node__lock">🔒</span>
                          ) : (
                            <span className="learn-node__icon">{sec.mascot || sec.icon}</span>
                          )}
                        </div>
                        {status === 'active' && (
                          <div className="learn-node__start-btn">НАЧАТЬ</div>
                        )}
                      </button>
                    </div>

                    {/* Connector dots to next node */}
                    {secIdx < mod.sections.length - 1 && (
                      <div
                        className={`learn-connector${isFogModule ? ' learn-connector--fog' : ''}`}
                        aria-hidden="true"
                      >
                        {[0.25, 0.5, 0.75].map((t, di) => {
                          const fromPct = POS_PCT[pos];
                          const toPct = POS_PCT[nextPos];
                          const leftPct = fromPct + (toPct - fromPct) * t;
                          return (
                            <div
                              key={di}
                              className="learn-connector__dot"
                              style={{
                                left: `${leftPct}%`,
                                top: `${25 + t * 50}%`,
                              }}
                            />
                          );
                        })}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          );
        })}

        {/* Fog overlay at bottom */}
        <div className="learn-path__fog" />
      </div>
    </div>
  );
}
