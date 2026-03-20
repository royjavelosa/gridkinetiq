import { useState, useEffect } from 'react'
import { getSimulatorStatus } from '../api/client'
import styles from './Topbar.module.css'

export default function Topbar({ title }) {
  const [time, setTime] = useState(new Date())
  const [simStatus, setSimStatus] = useState(null)

  useEffect(() => {
    const tick = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(tick)
  }, [])

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getSimulatorStatus()
        setSimStatus(res.data)
      } catch {}
    }
    fetch()
    const interval = setInterval(fetch, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <span className={styles.title}>{title}</span>
      </div>

      <div className={styles.right}>
        {simStatus && (
          <div className={styles.simBadge}>
            <div
              className={styles.simDot}
              style={{ background: simStatus.enabled ? 'var(--green)' : 'var(--text-muted)' }}
            />
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              SIM {simStatus.enabled ? simStatus.mode : 'OFF'}
            </span>
          </div>
        )}

        <div className={styles.clock}>
          <span className="mono">
            {time.toLocaleTimeString('en-US', { hour12: false })}
          </span>
          <span className={styles.date} style={{ color: 'var(--text-muted)', fontSize: 11 }}>
            {time.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>
    </header>
  )
}
