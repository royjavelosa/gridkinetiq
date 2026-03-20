import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSites, getFleetSummary } from '../api/client'
import Topbar from '../components/Topbar'
import { socColor, dispatchColor, statusColor, formatPower, formatCapacity, timeAgo } from '../utils/format'
import { AlertTriangle, Zap, Battery, Activity } from 'lucide-react'
import styles from './Fleet.module.css'

export default function Fleet({ onMenuClick }) {
  const [sites, setSites] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchData = async () => {
    try {
      const [sitesRes, summaryRes] = await Promise.all([getSites(), getFleetSummary()])
      setSites(sitesRes.data)
      setSummary(summaryRes.data)
    } catch (err) {
      console.error('Failed to fetch fleet data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 4000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div className={styles.loading}><span className="mono">Loading fleet data...</span></div>

  return (
    <div className={styles.page}>
      <Topbar title="Fleet Overview" onMenuClick={onMenuClick} />

      <div className={styles.content}>
        {/* Fleet summary strip */}
        {summary && (
          <div className={styles.summaryStrip}>
            <StatCard icon={Activity} label="Sites Online" value={`${summary.onlineSites} / ${summary.totalSites}`} color="var(--green)" />
            <StatCard icon={Battery} label="Total Capacity" value={formatCapacity(summary.totalCapacityKwh)} color="var(--blue)" />
            <StatCard icon={Zap} label="Fleet Power" value={formatPower(summary.totalPowerKw)} color="var(--orange)" />
            <StatCard icon={Activity} label="Avg SOC" value={`${summary.avgSocPercent?.toFixed(1)}%`} color={socColor(summary.avgSocPercent)} />
            {summary.totalAlarms > 0 && (
              <StatCard icon={AlertTriangle} label="Active Alarms" value={summary.totalAlarms} color="var(--red)" />
            )}
          </div>
        )}

        {/* Site grid */}
        <div className={styles.grid}>
          {sites.map((site, i) => (
            <SiteCard
              key={site.id}
              site={site}
              delay={i * 0.05}
              onClick={() => navigate(`/sites/${site.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className={styles.statCard}>
      <Icon size={14} color={color} strokeWidth={1.8} />
      <div>
        <div className={styles.statLabel}>{label}</div>
        <div className={styles.statValue} style={{ color }}>{value}</div>
      </div>
    </div>
  )
}

function SiteCard({ site, delay, onClick }) {
  const soc = site.socPercent || 0

  return (
    <div
      className={styles.siteCard}
      style={{ animationDelay: `${delay}s` }}
      onClick={onClick}
    >
      {/* Header */}
      <div className={styles.cardHeader}>
        <div>
          <div className={styles.siteName}>{site.name}</div>
          <div className={styles.siteLocation}>{site.location}</div>
        </div>
        <div className={styles.badges}>
          <span className={styles.badge} style={{ color: statusColor(site.status), borderColor: statusColor(site.status), background: `${statusColor(site.status)}18` }}>
            {site.status}
          </span>
          {site.activeAlarms > 0 && (
            <span className={styles.badge} style={{ color: 'var(--red)', borderColor: 'var(--red)', background: 'var(--red-dim)' }}>
              <AlertTriangle size={10} /> {site.activeAlarms}
            </span>
          )}
        </div>
      </div>

      {/* SOC bar */}
      <div className={styles.socSection}>
        <div className={styles.socHeader}>
          <span className={styles.socLabel}>STATE OF CHARGE</span>
          <span className={styles.socValue} style={{ color: socColor(soc) }}>{soc.toFixed(1)}%</span>
        </div>
        <div className={styles.socTrack}>
          <div
            className={styles.socFill}
            style={{ width: `${soc}%`, background: socColor(soc) }}
          />
        </div>
      </div>

      {/* Metrics row */}
      <div className={styles.metrics}>
        <Metric label="POWER" value={formatPower(site.powerKw)} />
        <Metric label="CAPACITY" value={formatCapacity(site.capacityKwh)} />
        <Metric label="TEMP" value={`${site.tempCelsius?.toFixed(1) ?? '--'}°C`} />
      </div>

      {/* Dispatch state */}
      <div className={styles.dispatchRow}>
        <div
          className={styles.dispatchDot}
          style={{ background: dispatchColor(site.dispatchState), animation: site.dispatchState !== 'STANDBY' ? 'pulse 2s infinite' : 'none' }}
        />
        <span className={styles.dispatchLabel} style={{ color: dispatchColor(site.dispatchState) }}>
          {site.dispatchState || 'STANDBY'}
        </span>
      </div>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className={styles.metric}>
      <span className={styles.metricLabel}>{label}</span>
      <span className={styles.metricValue}>{value}</span>
    </div>
  )
}
