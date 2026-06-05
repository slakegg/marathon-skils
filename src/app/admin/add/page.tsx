'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { COUNTRIES } from '@/lib/utils'

export default function AdminAddPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    gender: 'Мужской', birth_date: '1990-01-01',
    country: 'Kazakhstan', role: 'Бегун',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const isAdmin = (session?.user as any)?.isAdmin

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated' && !isAdmin) router.push('/')
  }, [status, isAdmin, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.first_name.trim()) { setError('Введите имя!'); return }
    setLoading(true); setError('')

    // Admin adds a runner without user_id (manual entry)
    const res = await fetch('/api/runners/admin-add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    router.push('/admin')
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push('/admin')} className="text-slate-400 hover:text-white transition">← Назад</button>
          <h1 className="text-xl font-bold text-white">+ Добавить участника</h1>
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 mb-5 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Имя</label>
              <input className="input" value={form.first_name}
                onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Фамилия</label>
              <input className="input" value={form.last_name}
                onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Пол</label>
              <select className="input" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                <option>Мужской</option>
                <option>Женский</option>
              </select>
            </div>
            <div>
              <label className="label">Роль</label>
              <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option>Бегун</option>
                <option>Координатор</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Дата рождения</label>
              <input type="date" className="input" value={form.birth_date}
                onChange={e => setForm(f => ({ ...f, birth_date: e.target.value }))} />
            </div>
            <div>
              <label className="label">Страна</label>
              <select className="input" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}>
                {COUNTRIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Создание...' : 'Создать участника'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => router.push('/admin')}>Отмена</button>
          </div>
        </form>
      </div>
    </div>
  )
}
