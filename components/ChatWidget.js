// components/ChatWidget.js
import { useState, useRef, useEffect } from 'react'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '👋 Привет! Я помощник марафона MarathonKZ. Спрашивай о дате, месте, регистрации — отвечу!' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  async function send() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', text }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      // Формируем историю для API (только role+content)
      const history = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role, content: m.text }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      })
      const data = await res.json()
      setMessages(m => [...m, { role: 'assistant', text: data.reply || 'Ошибка ответа' }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', text: '❌ Ошибка соединения. Попробуй ещё раз.' }])
    } finally {
      setLoading(false)
    }
  }

  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      {/* Кнопка открытия */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--accent, #f97316)', border: 'none',
          color: '#fff', fontSize: 24, cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s',
        }}
        title="Чат с ИИ"
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Окно чата */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 90, right: 24, zIndex: 999,
          width: 340, maxHeight: 480,
          background: '#1a1a1a', border: '1px solid #333',
          borderRadius: 16, boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Шапка */}
          <div style={{
            padding: '14px 16px', background: '#111',
            borderBottom: '1px solid #333',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 20 }}>🏃</span>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>MarathonKZ Ассистент</div>
              <div style={{ color: '#f97316', fontSize: 11 }}>● онлайн</div>
            </div>
          </div>

          {/* Сообщения */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '12px 14px',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '80%', padding: '9px 13px',
                  borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: m.role === 'user' ? '#f97316' : '#2a2a2a',
                  color: '#fff', fontSize: 13, lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '9px 13px', borderRadius: '16px 16px 16px 4px',
                  background: '#2a2a2a', color: '#888', fontSize: 13,
                }}>
                  ⏳ Печатает...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Ввод */}
          <div style={{
            padding: '10px 12px', borderTop: '1px solid #333',
            display: 'flex', gap: 8,
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Спроси о марафоне..."
              maxLength={300}
              style={{
                flex: 1, background: '#2a2a2a', border: '1px solid #444',
                borderRadius: 10, padding: '8px 12px',
                color: '#fff', fontSize: 13, outline: 'none',
              }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              style={{
                background: '#f97316', border: 'none', borderRadius: 10,
                padding: '8px 14px', color: '#fff', fontSize: 16,
                cursor: 'pointer', opacity: (loading || !input.trim()) ? 0.5 : 1,
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  )
}
