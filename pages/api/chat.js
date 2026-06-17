// pages/api/chat.js
// ИИ-чат о марафоне — Groq (бесплатно)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { message, history = [] } = req.body
  if (!message?.trim()) return res.status(400).json({ error: 'Нет сообщения' })

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 500,
        messages: [
          {
            role: 'system',
            content: `Ты — помощник марафона MarathonKZ. Отвечай коротко и по делу на русском языке.

Информация о марафоне:
- Название: Марафон Казахстан (MarathonKZ)
- Дата: 15 июня 2025, старт в 09:00
- Место: Астана, Казахстан, Центральный парк
- Дистанция: 42.195 км (полный марафон)
- Участники из 24+ стран
- Регистрация: на сайте marathonkz228.vercel.app
- Telegram-бот: @bestvoiceRustbek
- Для регистрации нужен аккаунт Google

Отвечай только на вопросы о марафоне. Если вопрос не по теме — вежливо скажи что можешь помочь только с вопросами о марафоне.`
          },
          ...history.slice(-6),
          { role: 'user', content: message }
        ],
      }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message || 'Ошибка API')

    const reply = data.choices?.[0]?.message?.content || 'Извините, не смог ответить.'
    return res.json({ reply })

  } catch (err) {
    console.error('Chat error:', err)
    return res.status(500).json({ error: 'Ошибка сервера' })
  }
}
