import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const API = `https://api.telegram.org/bot${TOKEN}`

// Главное меню — кнопки внизу экрана
const MAIN_MENU = {
  keyboard: [
    ['🔍 Найти участника', '📋 Все участники'],
    ['📊 Статистика',      '🏅 Топ по ИМТ'],
  ],
  resize_keyboard: true,
  persistent: true,
}

async function send(chatId, text, extra = {}) {
  await fetch(`${API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      ...extra,
    }),
  })
}

async function showMenu(chatId, text) {
  await send(chatId, text, { reply_markup: MAIN_MENU })
}

// Состояния пользователей (в памяти, сбрасывается при холодном старте)
const userStates = {}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const { message, callback_query } = req.body

    if (!message && !callback_query) return res.status(200).json({ ok: true })

    const chatId = message ? message.chat.id : callback_query.message.chat.id
    const text   = message ? message.text?.trim() : null

    if (!text) return res.status(200).json({ ok: true })

    // /start
    if (text === '/start') {
      userStates[chatId] = null
      await showMenu(
        chatId,
        `👋 Привет! Я бот <b>MarathonKZ</b>.\n\n` +
        `Выбери действие в меню ниже или введи фамилию участника напрямую.`
      )
      return res.status(200).json({ ok: true })
    }

    // Кнопка: Найти участника
    if (text === '🔍 Найти участника') {
      userStates[chatId] = 'search'
      await send(chatId, '🔍 Введи фамилию участника:')
      return res.status(200).json({ ok: true })
    }

    // Кнопка: Все участники
    if (text === '📋 Все участники') {
      userStates[chatId] = null
      const { data, error } = await supabase
        .from('runners')
        .select('first_name, last_name, country, role')
        .order('last_name', { ascending: true })

      if (error || !data?.length) {
        await showMenu(chatId, '😔 Участники не найдены.')
        return res.status(200).json({ ok: true })
      }

      // Разбиваем на части по 20 человек чтобы не превысить лимит Telegram
      const chunks = []
      for (let i = 0; i < data.length; i += 20) {
        chunks.push(data.slice(i, i + 20))
      }

      for (let ci = 0; ci < chunks.length; ci++) {
        const lines = chunks[ci].map((r, idx) => {
          const num = ci * 20 + idx + 1
          return `${num}. <b>${r.last_name} ${r.first_name}</b> — ${r.country} (${r.role})`
        })
        const header = ci === 0 ? `📋 <b>Все участники (${data.length}):</b>\n\n` : ''
        await send(chatId, header + lines.join('\n'))
      }

      await showMenu(chatId, '👆 Полный список выше.')
      return res.status(200).json({ ok: true })
    }

    // Кнопка: Статистика
    if (text === '📊 Статистика') {
      userStates[chatId] = null
      const { data, error } = await supabase
        .from('runners')
        .select('country, role, bmi')

      if (error || !data?.length) {
        await showMenu(chatId, '😔 Данные не найдены.')
        return res.status(200).json({ ok: true })
      }

      const total = data.length
      const roles = {}
      const countries = {}
      let bmiSum = 0, bmiCount = 0

      data.forEach(r => {
        roles[r.role] = (roles[r.role] || 0) + 1
        countries[r.country] = (countries[r.country] || 0) + 1
        if (r.bmi > 0) { bmiSum += r.bmi; bmiCount++ }
      })

      const avgBmi = bmiCount > 0 ? (bmiSum / bmiCount).toFixed(1) : 'нет данных'

      // Топ-5 стран
      const topCountries = Object.entries(countries)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([c, n]) => `  • ${c}: ${n}`)
        .join('\n')

      const rolesText = Object.entries(roles)
        .map(([r, n]) => `  • ${r}: ${n}`)
        .join('\n')

      await showMenu(
        chatId,
        `📊 <b>Статистика марафона</b>\n\n` +
        `👥 Всего участников: <b>${total}</b>\n` +
        `⚖️ Средний ИМТ: <b>${avgBmi}</b>\n\n` +
        `🏷 <b>По ролям:</b>\n${rolesText}\n\n` +
        `🌍 <b>Топ-5 стран:</b>\n${topCountries}`
      )
      return res.status(200).json({ ok: true })
    }

    // Кнопка: Топ по ИМТ
    if (text === '🏅 Топ по ИМТ') {
      userStates[chatId] = null
      const { data, error } = await supabase
        .from('runners')
        .select('first_name, last_name, bmi, country')
        .gt('bmi', 0)
        .order('bmi', { ascending: true })
        .limit(10)

      if (error || !data?.length) {
        await showMenu(chatId, '😔 Данные по ИМТ не найдены.')
        return res.status(200).json({ ok: true })
      }

      const medals = ['🥇', '🥈', '🥉']
      const lines = data.map((r, i) => {
        const icon = medals[i] || `${i + 1}.`
        return `${icon} <b>${r.last_name} ${r.first_name}</b> — ИМТ: <b>${r.bmi}</b> (${r.country})`
      })

      await showMenu(
        chatId,
        `🏅 <b>Топ-10 участников по ИМТ</b>\n<i>(чем ниже — тем лучше для марафона)</i>\n\n` +
        lines.join('\n')
      )
      return res.status(200).json({ ok: true })
    }

    // Поиск по фамилии — если пользователь в режиме поиска или просто написал текст
    if (userStates[chatId] === 'search' || (!text.startsWith('/') && text.length > 1)) {
      userStates[chatId] = null
      const surname = text

      const { data, error } = await supabase
        .from('runners')
        .select('*')
        .ilike('last_name', `%${surname}%`)
        .limit(5)

      if (error || !data?.length) {
        await showMenu(chatId, `😔 Фамилия «${surname}» не найдена в базе.`)
        return res.status(200).json({ ok: true })
      }

      for (const r of data) {
        const bmi = r.bmi > 0 ? r.bmi : 'не указан'
        await send(
          chatId,
          `✅ <b>${r.last_name} ${r.first_name}</b>\n\n` +
          `📧 ${r.email}\n` +
          `🌍 ${r.country}\n` +
          `🏷 Роль: ${r.role}\n` +
          `⚖️ ИМТ: ${bmi}`
        )
      }

      if (data.length > 1) {
        await showMenu(chatId, `👆 Найдено ${data.length} совпадений.`)
      } else {
        await showMenu(chatId, '👆 Готово! Выбери следующее действие.')
      }
      return res.status(200).json({ ok: true })
    }

    // Неизвестная команда
    await showMenu(chatId, '❓ Не понял. Выбери действие в меню:')
    return res.status(200).json({ ok: true })

  } catch (err) {
    console.error('Webhook error:', err)
    return res.status(200).json({ ok: true })
  }
}
