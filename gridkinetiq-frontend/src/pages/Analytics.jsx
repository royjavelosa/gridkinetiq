import { useState, useEffect } from 'react'
import { getSites, getSiteTelemetry } from '../api/client'
import Topbar from '../components/Topbar'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, BarChart, Bar
} from 'recharts'
import { formatTime, formatPower, socColor } from '../utils/format'
import styles from './Analytics.module.css'

const COLORS = ['#f97316', '#22c55e', '#3b82f6', '#eab308', '#a855f7', '#06b6d4']

export default function Analytics() {
  const [sites, setSites] = useState([])
  const [selectedSite, setSelectedSite] = useState(null)
  const [telemetry, setTelemetry] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await getSites()
        setSites(res.data)
        if (res.data.length > 0) setSelectedSite(res.data[0].id)
      } catch {}
      setLoading(false)
    }
    fetchSites()
  }, [])

  useEffect(() => {
    if (!selectedSite) return
    const fetchTelemetry = async () => {
      try {
        const res = await getSiteTelemetry(selectedSite, '24h')
        const reversed = [...res.data].reverse()
        setTelemetry(reversed)
      } catch {}
    }
    fetchTelemetry()
    const interval = setInterval(fetchTelemetry, 10000)
    return () => clearInterval(interval)
  }, [selectedSite])

  const chartData = telemetry.map(t => ({
    time: formatTime(t.timestamp),
    soc: parseFloat(t.socPercent?.toFixed(1)),
    power: parseFloat(t.powerKw?.toFixed(1)),
    temp: parseFloat(t.tempCelsius?.toFixed(1)),
  }))

  // Fleet SOC bar chart data
  const fleetSocData = sites.map(s => ({
    name: s.name.split(' ').slice(0, 2).join(' '),
    soc: parseFloat(s.socPercent?.toFixed(1)),
    power: parseFloat(Math.abs(s.powerKw)?.toFixed(1)),
  }))

  if (loading) return <div className={styles.loading}><span className="mono">Loading analytics...</span></div>

  return (
    <div className={styles.page}>
      <Topbar title="Analytics" />

      <div className={styles.content}>
        {/* Fleet SOC bar chart */}
        <div className={styles.card}>
          <div className={styles.cardLabel}>FLEET STATE OF CHARGE — ALL SITES</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={fleetSocData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'IBM Plex Mono' }} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} unit="%" />
              <Tooltip
                contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, fontFamily: 'IBM Plex Mono', fontSize: 11 }}
                cursor={{ fill: 'rgba(249,115,22,0.06)' }}
              />
              <Bar dataKey="soc" name="SOC %" fill="var(--orange)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Site selector + detail charts */}
        <div className={styles.card}>
          <div className={styles.siteSelector}>
            <div className={styles.cardLabel} style={{ marginBottom: 0 }}>SITE TELEMETRY DETAIL</div>
            <select
              className={styles.select}
              value={selectedSite || ''}
              onChange={e => setSelectedSite(e.target.value)}
            >
              {sites.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {chartData.length === 0 ? (
            <div className={styles.noData}>
              <span className="mono" style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                No telemetry data yet. Start the simulator to generate readings.
              </span>
            </div>
          ) : (
            <>
              <div className={styles.chartLabel}>SOC % over time</div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'IBM Plex Mono' }} tickLine={false} interval="preserveStartEnd" />
                  <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} unit="%" />
                  <Tooltip contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, fontFamily: 'IBM Plex Mono', fontSize: 11 }} />
                  <Line type="monotone" dataKey="soc" stroke="var(--green)" strokeWidth={1.8} dot={false} name="SOC %" />
                </LineChart>
              </ResponsiveContainer>

              <div className={styles.chartLabel} style={{ marginTop: 16 }}>Power kW over time (+ charge, - discharge)</div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'IBM Plex Mono' }} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} unit=" kW" />
                  <Tooltip contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, fontFamily: 'IBM Plex Mono', fontSize: 11 }} />
                  <Line type="monotone" dataKey="power" stroke="var(--orange)" strokeWidth={1.8} dot={false} name="Power kW" />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
