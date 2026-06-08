import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import styles from '../styles/Admin.module.css'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(null)
  const [runners, setRunners] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('Все роли')
  const [sort, setSort] = useState('Имени')
  const [editRunner, setEditRunner] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editError, setEditError] = useState('')
  const [editLoading, setEditLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') { router.replace('/login'); return }
    if (!session) return
    fetch('/api/admin-check')
      .then(r => r.json())
      .then(d => {
        setIsAdmin(d.isAdmin)
        if (!d.isAdmin) router.replace('/')
      })
  }, [session, status])

  useEffect(() => {
    if (isAdmin) loadRunners()
  }, [isAdmin])

  async function loadRunners() {
    setLoading(true)
    const res = await fetch('/api/runners')
    const d = await res.json()
    setRunners(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  const filtered = runners
    .filter(r => roleFilter === 'Все роли' || r.role === roleFilter)
    .filter(r => {
      const q = search.toLowerCase()
      return !q || [r.first_name, r.last_name, r.email].some(v => v?.toLowerCase().includes(q))
    })
    .sort((a, b) => {
      if (sort === 'Фамилии') return (a.last_name||'').localeCompare(b.last_name||'')
      if (sort === 'Email')   return (a.email||'').localeCompare(b.email||'')
      if (sort === 'Роли')    return (a.role||'').localeCompare(b.role||'')
      return (a.first_name||'').localeCompare(b.first_name||'')
    })

  function openEdit(runner) {
    setEditRunner(runner)
    setEditForm({
      first_name: runner.first_name || '',
      last_name:  runner.last_name  || '',
      role:       runner.role       || 'Бегун',
    })
    setEditError('')
  }

  async function saveEdit() {
    if (!editForm.first_name.trim()) { setEditError('Введите имя'); return }
    if (editForm.first_name.length > 50) { setEditError('Имя — не более 50 символов'); return }
    if (editForm.last_name.length > 50) { setEditError('Фамилия — не более 50 символов'); return }
    setEditLoading(true)
    try {
      const res = await fetch(`/api/runners/${editRunner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (!res.ok) throw new Error('Ошибка сохранения')
      setEditRunner(null)
      loadRunners()
    } catch (e) {
      setEditError(e.message)
    } finally {
      setEditLoading(false)
    }
  }

  async function deleteRunner(id) {
    if (!confirm('Удалить участника?')) return
    await fetch(`/api/runners/${id}`, { method: 'DELETE' })
    loadRunners()
  }

  if (status === 'loading' || isAdmin === null) return null
  if (!isAdmin) return null

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.topBar}>
          <div>
            <h1 className="page-title">ПАНЕЛЬ ADMIN</h1>
            <p className="page-subtitle">Управление участниками марафона</p>
          </div>
          <div className={styles.topActions}>
            <button className="btn btn-primary" onClick={() => openEdit({ id: 'new', first_name: '', last_name: '', role: 'Бегун', email: '' })}>
              + Добавить участника
            </button>
          </div>
        </div>

        <div className={styles.filters}>
          <input
            className={styles.searchInput}
            placeholder="Поиск..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            maxLength={100}
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
          <button className="btn btn-secondary" onClick={loadRunners}>↺ Обновить</button>
        </div>

        <div className={styles.countRow}>
          <span className={styles.countBadge}>{filtered.length} участников</span>
        </div>

        {loading ? (
          <div className={styles.empty}>Загрузка...</div>
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
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id}>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>{i + 1}</td>
                    <td>
                      <div className={styles.nameCell}>
                        <div className={styles.avatar}>{(r.first_name?.[0] || '?').toUpperCase()}</div>
                        <span>{r.first_name} {r.last_name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--muted2)', fontSize: 13 }}>{r.email}</td>
                    <td>{r.country}</td>
                    <td>
                      <span className={`badge ${r.role === 'Координатор' ? 'badge-coord' : 'badge-runner'}`}>
                        {r.role}
                      </span>
                    </td>
                    <td>{r.bmi > 0 ? r.bmi : '—'}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button className="btn btn-ghost" style={{ fontSize: 12, padding: '5px 10px' }} onClick={() => openEdit(r)}>✏️ Изменить</button>
                        <button className="btn btn-danger" style={{ fontSize: 12, padding: '5px 10px' }} onClick={() => deleteRunner(r.id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editRunner && (
        <div className={styles.modalOverlay} onClick={e => { if (e.target === e.currentTarget) setEditRunner(null) }}>
          <div className={`card ${styles.modal} fade-up`}>
            <h2 className={styles.modalTitle}>
              {editRunner.id === 'new' ? 'Новый участник' : `Редактировать: ${editRunner.email || 'участник'}`}
            </h2>

            {editError && <div className="error-msg" style={{ marginBottom: 14 }}>{editError}</div>}

            <div>
              <label>Имя *</label>
              <input value={editForm.first_name}
                onChange={e => setEditForm(f => ({ ...f, first_name: e.target.value }))}
                maxLength={50}
                placeholder="Имя" />
              <span className={styles.hint}>{editForm.first_name.length}/50</span>
            </div>
            <div style={{ marginTop: 14 }}>
              <label>Фамилия</label>
              <input value={editForm.last_name}
                onChange={e => setEditForm(f => ({ ...f, last_name: e.target.value }))}
                maxLength={50}
                placeholder="Фамилия" />
              <span className={styles.hint}>{editForm.last_name.length}/50</span>
            </div>
            <div style={{ marginTop: 14 }}>
              <label>Роль</label>
              <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}>
                <option>Бегун</option>
                <option>Координатор</option>
                <option>Администратор</option>
              </select>
            </div>

            <div className={styles.modalActions}>
              <button className="btn btn-secondary" onClick={() => setEditRunner(null)}>Отмена</button>
              <button className="btn btn-primary" onClick={saveEdit} disabled={editLoading}>
                {editLoading ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
