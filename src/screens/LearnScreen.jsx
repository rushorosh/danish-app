import React, { useState, useMemo, useEffect, useRef } from 'react';
import { COURSE } from '../data/course.js';
import {
  getProgress, isSectionComplete, isModuleComplete,
  getNodeStatus, NODE_ICONS, NODES_PER_SECTION,
} from '../data/progress.js';
import './LearnScreen.css';

// Zigzag positions for nodes within a section (7 nodes)
const ZIGZAG = ['center', 'right', 'center', 'left', 'center', 'right', 'center'];
const POS_PCT = { left: 16, center: 50, right: 84 };

export default function LearnScreen({ onStartLesson }) {
  const [progress] = useState(() => getProgress());
  const activeRef = useRef(null);

  // Find current module index (first non-complete module)
  const currentModIdx = useMemo(() => {
    const idx = COURSE.findIndex(m => !isModuleComplete(m, progress));
    return idx === -1 ? COURSE.length - 1 : idx;
  }, [progress]);

  // Find next node to do for banner
  const nextTarget = useMemo(() => {
    const mod = COURSE[currentModIdx];
    if (!mod) return null;
    for (const sec of mod.sections) {
      const secAccessible = sec.id === 1 || isSectionComplete(mod.id, sec.id - 1, progress);
      if (!secAccessible) break;
      for (let n = 1; n <= NODES_PER_SECTION; n++) {
        const st = getNodeStatus(mod.id, sec.id, n, secAccessible, progress);
        if (st === 'active') return { mod, sec, nodeIdx: n - 1 };
      }
    }
    return null;
  }, [progress, currentModIdx]);

  useEffect(() => {
    const timer = setTimeout(() => {
      activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const isSectionAccessible = (mod, sec) =>
    sec.id === 1 || isSectionComplete(mod.id, sec.id - 1, progress);

  return (
    <div className="learn-screen">
      {/* Banner */}
      {nextTarget && (
        <div
          className="learn-banner"
          style={{ background: nextTarget.mod.color }}
          onClick={() => onStartLesson?.(nextTarget.mod, nextTarget.sec, nextTarget.nodeIdx)}
        >
          <div className="learn-banner__text">
            <div className="learn-banner__meta">
              МОДУЛЬ {nextTarget.mod.id} · РАЗДЕЛ {nextTarget.sec.id}
            </div>
            <div className="learn-banner__title">{nextTarget.sec.title}</div>
          </div>
          <div className="learn-banner__icon">{nextTarget.sec.mascot || nextTarget.sec.icon}</div>
        </div>
      )}

      <div className="learn-path">
        {COURSE.map((mod, modIdx) => {
          // Completed modules: show collapsed header
          if (modIdx < currentModIdx) {
            return (
              <div key={mod.id} className="learn-module-done">
                <div className="learn-module-done__line" />
                <div className="learn-module-done__label" style={{ color: mod.color }}>
                  ✓ МОДУЛЬ {mod.id} · {mod.title}
                </div>
                <div className="learn-module-done__line" />
              </div>
            );
          }

          // Future modules: hidden
          if (modIdx > currentModIdx) return null;

          // Current module: full path
          return (
            <div key={mod.id} className="learn-module-group">
              <div className="learn-module-header">
                <div className="learn-module-header__line" />
                <div className="learn-module-header__label" style={{ color: mod.color }}>
                  МОДУЛЬ {mod.id} · {mod.title}
                  {mod.cefr && (
                    <span className="learn-module-header__cefr">{mod.cefr}</span>
                  )}
                </div>
                <div className="learn-module-header__line" />
              </div>

              {mod.sections.map((sec) => {
                const secAccessible = isSectionAccessible(mod, sec);
                const secComplete = isSectionComplete(mod.id, sec.id, progress);

                return (
                  <div key={sec.id} className={`learn-section${!secAccessible ? ' learn-section--locked' : ''}`}>
                    {/* Section header */}
                    <div className="learn-section-header">
                      <span className="learn-section-header__mascot">{sec.mascot || sec.icon}</span>
                      <span className="learn-section-header__title">{sec.title}</span>
                      {secComplete && <span className="learn-section-header__done">✓</span>}
                    </div>

                    {/* Node zigzag */}
                    {Array.from({ length: NODES_PER_SECTION }, (_, i) => {
                      const nodeId = i + 1;
                      const status = getNodeStatus(mod.id, sec.id, nodeId, secAccessible, progress);
                      const pos = ZIGZAG[i];
                      const nextPos = ZIGZAG[i + 1];
                      const isActiveNode = status === 'active';

                      return (
                        <React.Fragment key={nodeId}>
                          <div className={`learn-node-row learn-node-row--${pos}`}>
                            <button
                              ref={isActiveNode && sec.id === (nextTarget?.sec.id) && nodeId === (nextTarget?.nodeIdx + 1) ? activeRef : null}
                              className={`learn-node learn-node--${status}`}
                              style={status !== 'locked' ? {
                                '--node-color': mod.color,
                                '--node-shadow': mod.shadowColor,
                              } : {}}
                              onClick={() => {
                                if (status === 'locked') return;
                                onStartLesson?.(mod, sec, i);
                              }}
                              disabled={status === 'locked'}
                            >
                              <div className="learn-node__circle">
                                {status === 'completed' ? (
                                  <span className="learn-node__check">✓</span>
                                ) : status === 'locked' ? (
                                  <span className="learn-node__lock">🔒</span>
                                ) : (
                                  <span className="learn-node__icon">{NODE_ICONS[i]}</span>
                                )}
                              </div>
                              {isActiveNode && (
                                <div className="learn-node__start-btn">НАЧАТЬ</div>
                              )}
                            </button>
                          </div>

                          {/* Connector dots to next node within section */}
                          {i < NODES_PER_SECTION - 1 && nextPos && (
                            <div className="learn-connector" aria-hidden="true">
                              {[0.25, 0.5, 0.75].map((t, di) => {
                                const from = POS_PCT[pos];
                                const to = POS_PCT[nextPos];
                                return (
                                  <div
                                    key={di}
                                    className="learn-connector__dot"
                                    style={{
                                      left: `${from + (to - from) * t}%`,
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
            </div>
          );
        })}
        <div className="learn-path__fog" />
      </div>
    </div>
  );
}
