'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Runner {
  id: string; first_name: string; last_name: string
  email: string; gender: string; country: string; role: string; bmi: number | null
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [runners, setRunners] = useState<Runner[]>([])
  const [role, setRole] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('first_name')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const isAdmin = (session?.user as any)?.isAdmin

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated' && !isAdmin) router.push('/')
  }, [status, isAdmin, router])

  const fetchRunners = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ role, search, sort })
    const res = await fetch(`/api/runners?${params}`)
    if (res.ok) setRunners(await res.json())
    setLoading(false)
  }, [role, search, sort])

  useEffect(() => { if (isAdmin) fetchRunners() }, [fetchRunners, isAdmin])

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить участника?')) return
    setDeleting(id)
    await fetch(`/api/runners/${id}`, { method: 'DELETE' })
    await fetchRunners()
    setDeleting(null)
  }

  if (!isAdmin) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          🛡 Панель администратора
          <span className="badge bg-blue-900 text-blue-300">{runners.length}</span>
        </h1>
        <div className="flex gap-3">
          <button onClick={fetchRunners} className="btn-secondary text-sm py-2 px-3">🔄</button>
          <Link href="/admin/add" className="btn-primary text-sm py-2 px-4">+ Добавить</Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap gap-3">
        <input className="input flex-1 min-w-[180px]" placeholder="🔍 Поиск..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input w-auto" value={role} onChange={e => setRole(e.target.value)}>
          <option value="all">Все роли</option>
          <option value="Бегун">Бегун</option>
          <option value="Координатор">Координатор</option>
        </select>
        <select className="input w-auto" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="first_name">По имени</option>
          <option value="last_name">По фамилии</option>
          <option value="email">По Email</option>
          <option value="role">По роли</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500">Загрузка...</div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 bg-navy-900/50">
                <th className="text-left px-4 py-3 text-slate-400 text-sm">Участник</th>
                <th className="text-left px-4 py-3 text-slate-400 text-sm hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-slate-400 text-sm hidden sm:table-cell">Страна</th>
                <th className="text-left px-4 py-3 text-slate-400 text-sm">Роль</th>
                <th className="text-left px-4 py-3 text-slate-400 text-sm hidden lg:table-cell">BMI</th>
                <th className="text-right px-4 py-3 text-slate-400 text-sm">Действия</th>
              </tr>
            </thead>
            <tbody>
              {runners.map((r, i) => (
                <tr key={r.id} className={`border-b border-slate-800 hover:bg-navy-700/30 ${i % 2 === 0 ? '' : 'bg-navy-900/20'}`}>
                  <td className="px-4 py-3 font-medium text-white">{r.first_name} {r.last_name}</td>
                  <td className="px-4 py-3 text-slate-300 text-sm hidden md:table-cell">{r.email}</td>
                  <td className="px-4 py-3 text-slate-300 text-sm hidden sm:table-cell">{r.country}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${r.role === 'Координатор' ? 'bg-purple-900/60 text-purple-300' : 'bg-blue-900/60 text-blue-300'}`}>
                      {r.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-sm hidden lg:table-cell">{r.bmi?.toFixed(1) ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/edit/${r.id}`}
                        className="text-xs text-blue-400 hover:text-blue-300 border border-blue-800 hover:border-blue-600 px-3 py-1 rounded transition">
                        ✏️ Изменить
                      </Link>
                      <button
                        onClick={() => handleDelete(r.id)}
                        disabled={deleting === r.id}
                        className="text-xs text-red-400 hover:text-red-300 border border-red-900 hover:border-red-700 px-3 py-1 rounded transition disabled:opacity-50">
                        {deleting === r.id ? '...' : '🗑'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
