import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Zap, Terminal, BarChart3, Settings } from 'lucide-react'
import styles from './Sidebar.module.css'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Fleet' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/commands', icon: Terminal, label: 'Commands' },
  { to: '/simulator', icon: Settings, label: 'Simulator' },
]

export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles.logo}>
        <Zap size={20} color="var(--orange)" strokeWidth={2.5} />
        <div>
          <span className={styles.logoText}>Grid<span className={styles.logoAccent}>Kinetiq</span></span>
          <a
            href="https://www.linkedin.com/in/royjavelosa/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.builtBy}
          >
            Built ⚡ by Roy Javelosa
          </a>
        </div>
      </div>

      <nav className={styles.nav}>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <Icon size={16} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <span className="mono" style={{ color: 'var(--text-muted)', fontSize: 11 }}>
          v{__APP_VERSION__}
        </span>
      </div>
    </aside>
  )
}
