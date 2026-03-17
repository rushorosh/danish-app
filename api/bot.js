import { createClient } from '@supabase/supabase-js';

const BOT_TOKEN = process.env.BOT_TOKEN;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const BOT_USERNAME = process.env.VITE_BOT_USERNAME || '';
const APP_URL = process.env.VITE_APP_URL || '';

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

async function sendMessage(chatId, text, extra = {}) {
  if (!BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, ...extra }),
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
    const param = update.message.text.split(' ')[1] || '';
    const isReferral = param.startsWith('ref_');

    const text = isReferral
      ? '🎉 Тебя пригласил друг!\n\nОткрой приложение Danish! и начни изучать азербайджанский язык 🇦🇿\nВаш друг получит +50 очков когда ты начнёшь.'
      : '👋 Привет! Добро пожаловать в Danish! 🇦🇿\n\nИзучай азербайджанский язык в интерактивном формате.';

    // Build inline button to open mini app with start_param preserved
    const webAppUrl = APP_URL
      ? (isReferral ? `${APP_URL}?tgWebAppStartParam=${param}` : APP_URL)
      : null;

    const replyMarkup = webAppUrl
      ? {
          inline_keyboard: [[
            { text: '🚀 Открыть Danish!', web_app: { url: webAppUrl } },
          ]],
        }
      : undefined;

    await sendMessage(chatId, text, replyMarkup ? { reply_markup: replyMarkup } : {});
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
