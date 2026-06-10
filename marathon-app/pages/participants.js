import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Countdown from '../components/Countdown'
import styles from '../styles/Participants.module.css'

export default function ParticipantsPage() {
  const { data: session } = useSession()
  const [runners, setRunners] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('Все роли')
  const [sort, setSort] = useState('Имени')

  useEffect(() => {
    if (!session) return
    fetch('/api/runners')
      .then(r => r.json())
      .then(d => { setRunners(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [session])

  const filtered = runners
    .filter(r => roleFilter === 'Все роли' || r.role === roleFilter)
    .filter(r => {
      const q = search.toLowerCase()
      return !q || [r.first_name, r.last_name, r.email, r.country]
        .some(v => v?.toLowerCase().includes(q))
    })
    .sort((a, b) => {
      if (sort === 'Фамилии') return (a.last_name || '').localeCompare(b.last_name || '')
      if (sort === 'Email')   return (a.email || '').localeCompare(b.email || '')
      if (sort === 'Роли')    return (a.role || '').localeCompare(b.role || '')
      return (a.first_name || '').localeCompare(b.first_name || '')
    })

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.topBar}>
          <div>
            <h1 className="page-title">УЧАСТНИКИ</h1>
            <p className="page-subtitle">Зарегистрированные бегуны и координаторы</p>
          </div>
          <div className={styles.countdownWrap}><Countdown /></div>
        </div>

        {!session ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'var(--muted2)', marginBottom: 16 }}>Войдите, чтобы видеть список участников</p>
            <a href="/login" className="btn btn-primary">Войти</a>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className={styles.filters}>
              <input
                placeholder="Поиск по имени, email, стране..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                maxLength={100}
                className={styles.searchInput}
              />
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className={styles.select}>
                <option>Все роли</option>
                <option>Бегун</option>
                <option>Координатор</option>
              </select>
              <select value={sort} onChange={e => setSort(e.target.value)} className={styles.select}>
                <option>Имени</option>
                <option>Фамилии</option>
                <option>Email</option>
                <option>Роли</option>
              </select>
            </div>

            <div className={styles.countRow}>
              <span className={styles.countBadge}>{filtered.length} участников</span>
            </div>

            {loading ? (
              <div className={styles.empty}>Загрузка...</div>
            ) : filtered.length === 0 ? (
              <div className={styles.empty}>Участники не найдены</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Имя</th>
                      <th>Email</th>
                      <th>Страна</th>
                      <th>Роль</th>
                      <th>ИМТ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, i) => (
                      <tr key={r.id}>
                        <td style={{ color: 'var(--muted)', fontSize: 12 }}>{i + 1}</td>
                        <td>
                          <div className={styles.nameCell}>
                            <div className={styles.avatar}>
                              {(r.first_name?.[0] || '?').toUpperCase()}
                            </div>
                            <div>
                              <div>{r.first_name} {r.last_name}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: 'var(--muted2)', fontSize: 13 }}>{r.email}</td>
                        <td>{r.country}</td>
                        <td>
                          <span className={`badge ${r.role === 'Координатор' ? 'badge-coord' : r.role === 'Администратор' ? 'badge-admin' : 'badge-runner'}`}>
                            {r.role}
                          </span>
                        </td>
                        <td style={{ color: r.bmi > 0 ? 'var(--text)' : 'var(--muted)' }}>
                          {r.bmi > 0 ? r.bmi : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
