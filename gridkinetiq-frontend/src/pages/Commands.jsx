import { useState, useEffect } from 'react'
import { getRecentCommands } from '../api/client'
import Topbar from '../components/Topbar'
import { formatTime } from '../utils/format'
import styles from './Commands.module.css'

export default function Commands({ onMenuClick }) {
  const [commands, setCommands] = useState([])

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getRecentCommands()
        setCommands(res.data)
      } catch {}
    }
    fetch()
    const interval = setInterval(fetch, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={styles.page}>
      <Topbar title="Command Audit Log" onMenuClick={onMenuClick} />
      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>RECENT COMMANDS — ALL SITES</div>
          {commands.length === 0 ? (
            <span className="mono" style={{ color: 'var(--text-muted)', fontSize: 12 }}>No commands dispatched yet. Go to a site to dispatch one.</span>
          ) : (
            <div className={styles.table}>
              <div className={styles.thead}>
                <span>Command</span><span>Site</span><span>Status</span><span>Issued By</span><span>Issued At</span><span>Completed At</span>
              </div>
              {commands.map(cmd => (
                <div key={cmd.id} className={styles.row}>
                  <span className={styles.cmdType}>{cmd.type}</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{cmd.siteId?.slice(0, 8)}...</span>
                  <span className={styles.status} style={{ color: statusColor(cmd.status) }}>{cmd.status}</span>
                  <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>{cmd.issuedBy}</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatTime(cmd.issuedAt)}</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatTime(cmd.completedAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function statusColor(s) {
  switch (s) {
    case 'COMPLETED': return 'var(--green)'
    case 'FAILED': return 'var(--red)'
    case 'PENDING': return 'var(--yellow)'
    case 'EXECUTING': return 'var(--orange)'
    default: return 'var(--text-muted)'
  }
}
