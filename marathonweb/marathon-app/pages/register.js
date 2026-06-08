import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Countdown from '../components/Countdown'
import styles from '../styles/Register.module.css'

const COUNTRIES = [
  'Kazakhstan','Russia','Germany','France','USA','Spain','Italy',
  'Japan','China','Brazil','Kenya','Ethiopia','UK','Canada',
  'Australia','Netherlands','Sweden','Norway','Poland',
  'Czech Republic','Ukraine','Belarus','Uzbekistan','Kyrgyzstan',
]

const BMI_CATEGORIES = [
  { max: 18.5, label: 'Недостаточный', color: '#3b82f6' },
  { max: 25,   label: 'Здоровый',      color: '#22c55e' },
  { max: 30,   label: 'Избыточный',    color: '#eab308' },
  { max: Infinity, label: 'Ожирение',  color: '#ef4444' },
]

function getBMIInfo(bmi) {
  return BMI_CATEGORIES.find(c => bmi < c.max) || BMI_CATEGORIES[BMI_CATEGORIES.length - 1]
}

export default function RegisterPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1) // 1=form, 2=bmi, 3=done
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [runnerId, setRunnerId] = useState(null)

  // Form fields
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    gender: 'Мужской', birth_date: '1990-01-01',
    country: 'Kazakhstan',
  })
  // BMI fields
  const [height, setHeight] = useState('170')
  const [weight, setWeight] = useState('70')
  const [bmi, setBmi] = useState(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login')
    if (session?.user?.email && !form.email) {
      setForm(f => ({ ...f, email: session.user.email }))
    }
  }, [status, session])

  function set(k) { return e => setForm(f => ({ ...f, [k]: e.target.value })) }

  function validateStep1() {
    if (!form.first_name.trim()) return 'Введите имя (макс. 50 символов)'
    if (form.first_name.length > 50) return 'Имя — не более 50 символов'
    if (!form.last_name.trim()) return 'Введите фамилию (макс. 50 символов)'
    if (form.last_name.length > 50) return 'Фамилия — не более 50 символов'
    if (!form.email.trim() || !form.email.includes('@')) return 'Введите корректный Email'
    if (form.email.length > 100) return 'Email — не более 100 символов'
    return ''
  }

  async function submitStep1() {
    const err = validateStep1()
    if (err) { setError(err); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/runners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role: 'Бегун', bmi: 0 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка')
      setRunnerId(data.id)
      setStep(2)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function calcBMI() {
    const h = parseFloat(height), w = parseFloat(weight)
    if (!h || !w || h <= 0 || w <= 0) { setError('Введите корректный рост и вес'); return }
    if (h < 50 || h > 250) { setError('Рост должен быть 50–250 см'); return }
    if (w < 20 || w > 300) { setError('Вес должен быть 20–300 кг'); return }
    setError('')
    setBmi(Math.round(w / Math.pow(h / 100, 2) * 10) / 10)
  }

  async function saveBMI() {
    if (!bmi) { calcBMI(); return }
    setLoading(true)
    try {
      await fetch(`/api/runners/${runnerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bmi }),
      })
      setStep(3)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  if (status === 'loading') return null

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <Countdown />
        </div>

        {step === 1 && (
          <div className={`card ${styles.card} fade-up`}>
            <h1 className={styles.title}>Регистрация участника</h1>
            <p className={styles.sub}>Заполните данные для участия в марафоне</p>

            {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}

            <div className={styles.grid2}>
              <div>
                <label>Имя *</label>
                <input value={form.first_name} onChange={set('first_name')} maxLength={50} placeholder="Иван" />
                <span className={styles.hint}>{form.first_name.length}/50</span>
              </div>
              <div>
                <label>Фамилия *</label>
                <input value={form.last_name} onChange={set('last_name')} maxLength={50} placeholder="Иванов" />
                <span className={styles.hint}>{form.last_name.length}/50</span>
              </div>
            </div>

            <div className={styles.field}>
              <label>Email *</label>
              <input value={form.email} onChange={set('email')} maxLength={100} type="email" placeholder="your@email.com" />
              <span className={styles.hint}>{form.email.length}/100</span>
            </div>

            <div className={styles.grid2}>
              <div>
                <label>Пол</label>
                <select value={form.gender} onChange={set('gender')}>
                  <option>Мужской</option>
                  <option>Женский</option>
                </select>
              </div>
              <div>
                <label>Дата рождения</label>
                <input type="date" value={form.birth_date} onChange={set('birth_date')}
                  min="1920-01-01" max={new Date().toISOString().split('T')[0]} />
              </div>
            </div>

            <div className={styles.field}>
              <label>Страна</label>
              <select value={form.country} onChange={set('country')}>
                {COUNTRIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className={styles.actions}>
              <button className="btn btn-secondary" onClick={() => router.push('/')}>Назад</button>
              <button className="btn btn-primary" onClick={submitStep1} disabled={loading}>
                {loading ? 'Сохранение...' : 'Далее — Расчёт ИМТ →'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={`card ${styles.card} fade-up`}>
            <h1 className={styles.title}>Расчёт ИМТ</h1>
            <p className={styles.sub}>Индекс массы тела — важный показатель для участника марафона</p>

            {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}

            <div className={styles.bmiWrap}>
              <div className={styles.silhouette}>
                {bmi
                  ? bmi < 25 ? (form.gender === 'Женский' ? '🏃‍♀️' : '🏃‍♂️')
                    : (form.gender === 'Женский' ? '🚶‍♀️' : '🚶‍♂️')
                  : (form.gender === 'Женский' ? '🧍‍♀️' : '🧍‍♂️')
                }
              </div>

              {bmi && (
                <div className={styles.bmiResult} style={{ color: getBMIInfo(bmi).color }}>
                  <span className={styles.bmiNum}>{bmi}</span>
                  <span className={styles.bmiCat}>{getBMIInfo(bmi).label}</span>
                </div>
              )}
            </div>

            <div className={styles.grid2}>
              <div>
                <label>Рост (см)</label>
                <input type="number" value={height} onChange={e => setHeight(e.target.value)}
                  min={50} max={250} placeholder="170" />
              </div>
              <div>
                <label>Вес (кг)</label>
                <input type="number" value={weight} onChange={e => setWeight(e.target.value)}
                  min={20} max={300} placeholder="70" />
              </div>
            </div>

            {bmi && (
              <div className={styles.bmiScale}>
                <div className={styles.scaleBar}>
                  {[
                    { w: '25%', color: '#3b82f6' },
                    { w: '25%', color: '#22c55e' },
                    { w: '20%', color: '#eab308' },
                    { w: '30%', color: '#ef4444' },
                  ].map((s, i) => (
                    <div key={i} style={{ width: s.w, background: s.color, height: '8px', borderRadius: i === 0 ? '4px 0 0 4px' : i === 3 ? '0 4px 4px 0' : 0 }} />
                  ))}
                  <div className={styles.marker} style={{
                    left: `${Math.min(100, Math.max(0, (bmi - 10) / 30 * 100))}%`
                  }} />
                </div>
                <div className={styles.scaleLabels}>
                  <span>10</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
                </div>
              </div>
            )}

            <div className={styles.actions}>
              <button className="btn btn-secondary" onClick={() => { setBmi(null); setStep(1) }}>Назад</button>
              <button className="btn btn-secondary" onClick={() => { setBmi(null); setHeight('170'); setWeight('70'); setError('') }}>Сброс</button>
              <button className="btn btn-secondary" onClick={calcBMI}>Рассчитать</button>
              <button className="btn btn-primary" onClick={saveBMI} disabled={loading}>
                {loading ? 'Сохранение...' : 'Сохранить →'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={`card ${styles.card} ${styles.successCard} fade-up`}>
            <div className={styles.successIcon}>🎉</div>
            <h1 className={styles.title}>Регистрация завершена!</h1>
            <p className={styles.sub}>
              Вы успешно зарегистрированы как участник марафона.<br />
              {bmi && `ИМТ: ${bmi} — ${getBMIInfo(bmi).label}`}
            </p>
            <div className={styles.actions} style={{ justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => router.push('/participants')}>
                Список участников →
              </button>
              <button className="btn btn-secondary" onClick={() => router.push('/')}>
                На главную
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
