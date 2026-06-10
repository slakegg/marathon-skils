import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import styles from './Navbar.module.css'

export default function Navbar({ isAdmin }) {
  const { data: session } = useSession()
  const router = useRouter()

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🏃</span>
          <span className={styles.logoText}>MARATHON<span className={styles.logoAccent}>KZ</span></span>
        </Link>

        <div className={styles.links}>
          <Link href="/" className={`${styles.link} ${router.pathname === '/' ? styles.active : ''}`}>Главная</Link>
          <Link href="/participants" className={`${styles.link} ${router.pathname === '/participants' ? styles.active : ''}`}>Участники</Link>
          {session && (
            <Link href="/register" className={`${styles.link} ${router.pathname === '/register' ? styles.active : ''}`}>Регистрация</Link>
          )}
          {isAdmin && (
            <Link href="/admin" className={`${styles.link} ${router.pathname.startsWith('/admin') ? styles.active : ''}`}>
              <span className={styles.adminBadge}>ADMIN</span>
            </Link>
          )}
        </div>

        <div className={styles.right}>
          {session ? (
            <div className={styles.userBlock}>
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name || ''}
                  width={34}
                  height={34}
                  className={styles.avatar}
                />
              )}
              <span className={styles.userName}>{session.user?.name?.split(' ')[0]}</span>
              <button
                className={`btn btn-ghost ${styles.logoutBtn}`}
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                Выйти
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn btn-primary">
              Войти
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
