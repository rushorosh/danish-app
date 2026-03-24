# CLAUDE.md

Инструкции для Claude Code при работе с этим проектом.

## Что это

Telegram Mini App для изучения **азербайджанского языка** (аналог Duolingo).
> Папка называется `danish-app` — историческое название, не отражает язык контента.

## Стек

- **Frontend:** React 18 + Vite
- **Backend/DB:** Supabase (PostgreSQL + auth + JSONB sync)
- **Платформа:** Telegram WebApp API (Mini App)
- **Bot:** `api/bot.js` — Vercel serverless function (webhook)

## Запуск

```bash
npm install
npm run dev     # локальная разработка
npm run build   # сборка
```

Переменные окружения (`.env`):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_BOT_USERNAME`
- `VITE_APP_URL`
- `BOT_TOKEN` (только для bot.js)

## Структура

```
src/
  screens/        — экраны приложения
  components/     — переиспользуемые компоненты
  data/           — логика данных и API
  lib/            — внешние клиенты (supabase.js)
  utils/          — утилиты (tts.js)
api/
  bot.js          — Telegram bot webhook (Vercel serverless)
```

## Экраны (`src/screens/`)

| Файл | Назначение |
|------|-----------|
| `TranslateScreen` | Перевод слов/фраз |
| `LearnScreen` | Курс: дерево уроков (модули → секции → узлы) |
| `LessonScreen` | Прохождение урока (упражнения) |
| `GamesScreen` | Список мини-игр |
| `FlashcardsGame` | Игра: карточки |
| `ListeningGame` | Игра: аудирование |
| `SRSReviewScreen` | Повторение по интервальной системе (SRS) |
| `VocabScreen` | Словарь + запуск SRS |
| `RatingScreen` | Рейтинг игроков (all-time / weekly / daily) |
| `SettingsScreen` | Настройки (язык UI: RU/EN) |

## Данные (`src/data/`)

| Файл | Назначение |
|------|-----------|
| `api.js` | Все запросы к Supabase |
| `progress.js` | Прогресс по курсу (localStorage) |
| `srs.js` | Интервальная система повторений |
| `vocabulary.js` | Словарный запас |
| `course.js` | Структура курса |
| `levels.js` | Уровни и модули |
| `streak.js` | Серия дней |
| `settings.js` | Настройки пользователя |
| `i18n.js` | Переводы UI (RU/EN) |
| `wordProgress.js` | Прогресс по словам |
| `leaderboard.js` | Данные рейтинга |
| `LanguageContext.jsx` | React context для языка интерфейса |

## Компоненты

- `ProgressHeader` — шапка с очками пользователя
- `TabBar` — нижняя навигация (6 вкладок: translate, learn, vocab, games, rating, settings)

## Supabase схема (ключевые таблицы)

| Таблица | Назначение |
|---------|-----------|
| `users` | Пользователи: `telegram_id`, `username`, `score` (all-time) |
| `score_events` | Все события начисления очков — источник для рейтингов |
| `user_data` | JSONB колонка для cross-device sync |

### Cross-device sync (`user_data` JSONB)

Синхронизируется при скрытии приложения (`visibilitychange`). Логика слияния:
- **SRS:** берёт запись с большим box-уровнем
- **Known words:** объединение (union)
- **Streak:** берёт более позднюю дату
- **Settings:** DB только если локально не установлено
- **Progress:** локальные данные приоритетнее DB

### Рейтинг

3-уровневая архитектура: all-time (`users.score`), weekly, daily.
`score_events` — единый источник истины для агрегации через Supabase RPC функции.

## Telegram WebApp

- Данные пользователя: `window.Telegram.WebApp.initDataUnsafe.user`
- Deep links через `start_param` (реферальная система: +50 очков рефереру)

## Соглашения

- Стили — отдельный `.css` файл рядом с каждым компонентом/экраном
- Нет TypeScript, нет тестов — чистый JS/JSX
- Не трогать `src/lib/supabase.js` без необходимости — там защита от `null` при отсутствии env vars
