import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function sendMessage(chatId, text) {
  await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    }
  )
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  try {
    const { message } = req.body

    // Игнорируем если нет сообщения или текста
    if (!message || !message.text) {
      return res.status(200).json({ ok: true })
    }

    const chatId = message.chat.id
    const text = message.text.trim()

    // Команда /start
    if (text === '/start') {
      await sendMessage(
        chatId,
        'Привет! Я бот MarathonKZ.\nОтправь мне фамилию участника — я найду его в базе данных.'
      )
      return res.status(200).json({ ok: true })
    }

    // Ищем по фамилии в Supabase
    const surname = text

    const { data, error } = await supabase
      .from('runners')
      .select('*')
      .ilike('last_name', surname)
      .limit(1)
      .single()

    if (error || !data) {
      await sendMessage(chatId, `Фамилия «${surname}» не найдена в базе.`)
    } else {
      const fullName = `${data.first_name} ${data.last_name}`
      const bmi = data.bmi > 0 ? data.bmi : 'не указан'
      await sendMessage(
        chatId,
        `Участник найден!\n\n` +
        `👤 ${fullName}\n` +
        `📧 ${data.email}\n` +
        `🌍 ${data.country}\n` +
        `🏷 Роль: ${data.role}\n` +
        `⚖️ ИМТ: ${bmi}`
      )
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return res.status(200).json({ ok: true }) // всегда 200 для Telegram
  }
}
