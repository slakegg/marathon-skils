import { useState, useEffect } from 'react'
import styles from './Countdown.module.css'

function getMarathonDate() {
  const now = new Date()
  let d = new Date(now.getFullYear(), 5, 15, 9, 0, 0) // June 15
  if (d <= now) d.setFullYear(d.getFullYear() + 1)
  return d
}

export default function Countdown() {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    function update() {
      const diff = getMarathonDate() - new Date()
      if (diff <= 0) { setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return }
      setTime({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className={styles.wrap}>
      <div className={styles.label}>ДО СТАРТА МАРАФОНА</div>
      <div className={styles.tiles}>
        {[
          { v: time.days,    l: 'ДНЕЙ' },
          { v: time.hours,   l: 'ЧАСОВ' },
          { v: time.minutes, l: 'МИНУТ' },
          { v: time.seconds, l: 'СЕКУНД' },
        ].map(({ v, l }, i) => (
          <div key={i} className={styles.tile}>
            <span className={styles.num}>{String(v).padStart(2, '0')}</span>
            <span className={styles.unit}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
