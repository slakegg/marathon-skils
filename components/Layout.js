import Navbar from './Navbar'
import styles from './Layout.module.css'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export default function Layout({ children }) {
  const { data: session } = useSession()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (session) {
      fetch('/api/admin-check')
        .then(r => r.json())
        .then(d => setIsAdmin(d.isAdmin))
        .catch(() => {})
    }
  }, [session])

  return (
    <div className={styles.root}>
      <Navbar isAdmin={isAdmin} />
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>© 2025 MarathonKZ — Все права защищены</span>
        </div>
      </footer>
    </div>
  )
}
