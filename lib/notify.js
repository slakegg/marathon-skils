// lib/notify.js
// Отправляет уведомление админу в Telegram

const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID
const API = `https://api.telegram.org/bot${TOKEN}`

export async function notifyAdmin(text) {
  if (!TOKEN || !ADMIN_CHAT_ID) {
    console.warn('notifyAdmin: TELEGRAM_BOT_TOKEN or ADMIN_CHAT_ID not set')
    return
  }
  try {
    await fetch(`${API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text,
        parse_mode: 'HTML',
      }),
    })
  } catch (err) {
    console.error('notifyAdmin error:', err)
  }
}

export function formatNewRunner(runner) {
  const bmi = runner.bmi > 0 ? runner.bmi : 'не указан'
  const now = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' })
  return (
    `🎉 <b>Новый участник зарегистрирован!</b>\n\n` +
    `👤 <b>${runner.last_name} ${runner.first_name}</b>\n` +
    `📧 ${runner.email}\n` +
    `🌍 ${runner.country}\n` +
    `⚥ ${runner.gender}\n` +
    `🏷 Роль: ${runner.role}\n` +
    `⚖️ ИМТ: ${bmi}\n\n` +
    `🕐 ${now} (Алматы)`
  )
}
