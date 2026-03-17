import { createClient } from '@supabase/supabase-js';

const BOT_TOKEN = process.env.BOT_TOKEN;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

async function sendMessage(chatId, text) {
  if (!BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true });
  }

  const update = req.body;

  // Handle /start command (with or without referral param)
  if (update.message?.text?.startsWith('/start')) {
    const chatId = update.message.chat.id;
    await sendMessage(chatId,
      '👋 Привет! Я бот приложения Danish!\n\n' +
      'Открой приложение и изучай азербайджанский язык 🇦🇿\n\n' +
      'Если хочешь поделиться телефоном — нажми кнопку «Заполнить из Telegram» в настройках.'
    );
  }

  // Handle contact message (from requestContact in mini app)
  if (update.message?.contact) {
    const contact = update.message.contact;
    const userId = contact.user_id;
    const phone = contact.phone_number;

    if (userId && phone && supabase) {
      await supabase
        .from('users')
        .update({ phone, updated_at: new Date().toISOString() })
        .eq('telegram_id', userId);
    }

    await sendMessage(update.message.chat.id,
      '✅ Контакт получен! Вернитесь в приложение — телефон заполнен автоматически.'
    );
  }

  res.status(200).json({ ok: true });
}
