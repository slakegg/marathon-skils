import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Countdown from '../components/Countdown'
import styles from '../styles/Home.module.css'

export default function Home() {
  const { data: session } = useSession()

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden />
        <div className={styles.heroContent}>
          <div className={`${styles.eyebrow} fade-up`}>АСТАНА · 15 ИЮНЯ 2025</div>
          <h1 className={`${styles.heroTitle} fade-up-delay-1`}>
            МАРАФОН<br /><span className={styles.heroAccent}>КАЗАХСТАН</span>
          </h1>
          <p className={`${styles.heroSub} fade-up-delay-2`}>
            Международный марафон — бегите ради достижений, бегите ради страны
          </p>
          <div className={`${styles.heroCtas} fade-up-delay-3`}>
            {session ? (
              <Link href="/register" className="btn btn-primary">
                Зарегистрироваться →
              </Link>
            ) : (
              <Link href="/login" className="btn btn-primary">
                Войти и зарегистрироваться →
              </Link>
            )}
            <Link href="/participants" className="btn btn-secondary">
              Список участников
            </Link>
          </div>
        </div>
      </section>

      {/* Countdown */}
      <section className={styles.countdownSection}>
        <Countdown />
      </section>

      {/* Info cards */}
      <section className={styles.cards}>
        <div className={styles.cardsGrid}>
          {[
            { icon: '📍', title: 'Место', body: 'Астана, Казахстан\nЦентральный парк' },
            { icon: '📅', title: 'Дата', body: '15 июня 2025\nСтарт в 09:00' },
            { icon: '🏅', title: 'Дистанция', body: '42.195 км\nПолный марафон' },
            { icon: '🌍', title: 'Страны', body: 'Участники из\n24+ стран' },
          ].map(({ icon, title, body }) => (
            <div key={title} className={`card ${styles.infoCard}`}>
              <div className={styles.infoIcon}>{icon}</div>
              <div className={styles.infoTitle}>{title}</div>
              <div className={styles.infoBody}>{body}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
