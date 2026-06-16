import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Countdown from '../components/Countdown'
import styles from '../styles/Home.module.css'
 
export default function Home() {
  const { data: session } = useSession()
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden />
        <div className={styles.heroContent}>
 
          <div className={styles.eyebrow}>АСТАНА · 15 ИЮНЯ 2025</div>
          <h1 className={styles.heroTitle}>
            МАРАФОН<br /><span className={styles.heroAccent}>КАЗАХСТАН</span>
          </h1>
 
          {/* 3 карточки */}
          <div className={styles.textCards}>
            <div className={styles.textCard}>
              <div className={styles.textCardIcon}>🏃</div>
              <h3 className={styles.textCardTitle}>О марафоне</h3>
              <p className={styles.textCardBody}>
                Марафон — ежегодный ритуал на 42,195 км, объединяющий профессионалов,
                любителей и тысячи зрителей в едином порыве воли и выносливости.
              </p>
            </div>
            <div className={styles.textCard}>
              <div className={styles.textCardIcon}>💪</div>
              <h3 className={styles.textCardTitle}>Испытание духа</h3>
              <p className={styles.textCardBody}>
                На 30–35 км бегуны встречают «стену». Преодоление — вопрос чистого
                упрямства и силы духа, а не физической подготовки.
              </p>
            </div>
            <div className={styles.textCard}>
              <div className={styles.textCardIcon}>🌍</div>
              <h3 className={styles.textCardTitle}>Город бегунам</h3>
              <p className={styles.textCardBody}>
                Мегаполисы перекрывают движение ради бегунов. Пробеги по мосту
                Верразано или мимо Бранденбургских ворот под крики болельщиков.
              </p>
            </div>
          </div>
 
          {/* Кнопки */}
          <div className={styles.heroCtas}>
            {session ? (
              <Link href="/register" className="btn btn-primary">Зарегистрироваться →</Link>
            ) : (
              <Link href="/login" className="btn btn-primary">Войти и зарегистрироваться →</Link>
            )}
            <Link href="/participants" className="btn btn-secondary">Список участников</Link>
            <a href="https://t.me/bestvoiceRustbek" target="_blank" rel="noopener noreferrer" className={styles.tgBtn}>
              ✈️ Telegram-бот
            </a>
          </div>
 
          {/* Таймер */}
          <div className={styles.countdownSection}>
            <Countdown />
          </div>
 
          {/* Инфо-карточки */}
          <div className={styles.cards}>
            <div className={styles.cardsGrid}>
              {[
                { icon: '📍', title: 'Место',     body: 'Астана, Казахстан\nЦентральный парк' },
                { icon: '📅', title: 'Дата',      body: '15 июня 2025\nСтарт в 09:00' },
                { icon: '🏅', title: 'Дистанция', body: '42.195 км\nПолный марафон' },
                { icon: '🌍', title: 'Страны',    body: 'Участники из\n24+ стран' },
              ].map(({ icon, title, body }) => (
                <div key={title} className={`card ${styles.infoCard}`}>
                  <div className={styles.infoIcon}>{icon}</div>
                  <div className={styles.infoTitle}>{title}</div>
                  <div className={styles.infoBody}>{body}</div>
                </div>
              ))}
            </div>
          </div>
 
        </div>
      </section>
    </div>
  )
}
