import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { getSite, getSiteDevices, getSiteTelemetry, dispatchCommand, getCommandHistory } from '../api/client'
import Topbar from '../components/Topbar'
import { socColor, dispatchColor, statusColor, formatPower, formatCapacity, formatTime } from '../utils/format'
import { ArrowLeft, Send, AlertTriangle } from 'lucide-react'
import styles from './SiteDetail.module.css'

const COMMAND_TYPES = ['CHARGE', 'DISCHARGE', 'STANDBY', 'EMERGENCY_STOP', 'RESET_ALARMS']

export default function SiteDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [site, setSite] = useState(null)
  const [devices, setDevices] = useState([])
  const [telemetry, setTelemetry] = useState([])
  const [commands, setCommands] = useState([])
  const [dispatching, setDispatching] = useState(false)
  const [selectedCmd, setSelectedCmd] = useState(null)
  const [cmdResult, setCmdResult] = useState(null)

  const fetchAll = async () => {
    try {
      const [siteRes, devRes, telRes, cmdRes] = await Promise.all([
        getSite(id),
        getSiteDevices(id),
        getSiteTelemetry(id, 'recent'),
        getCommandHistory(id),
      ])
      setSite(siteRes.data)
      setDevices(devRes.data)
      // Reverse so chart is chronological
      setTelemetry([...telRes.data].reverse().slice(-50))
      setCommands(cmdRes.data.slice(0, 10))
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 4000)
    return () => clearInterval(interval)
  }, [id])

  const handleDispatch = async () => {
    setDispatching(true)
    setCmdResult(null)
    try {
      const res = await dispatchCommand(id, selectedCmd, {}, 'operator')
      setCmdResult({ ok: true, msg: `${selectedCmd} dispatched successfully` })
      fetchAll()
    } catch {
      setCmdResult({ ok: false, msg: 'Dispatch failed' })
    } finally {
      setDispatching(false)
      setTimeout(() => setCmdResult(null), 4000)
    }
  }

  if (!site) return <div className={styles.loading}><span className="mono">Loading site...</span></div>

  const chartData = telemetry.map(t => ({
    time: formatTime(t.timestamp),
    soc: t.socPercent?.toFixed(1),
    power: t.powerKw?.toFixed(1),
    temp: t.tempCelsius?.toFixed(1),
  }))

  return (
    <div className={styles.page}>
      <Topbar title={site.name} />

      <div className={styles.content}>
        {/* Back + header */}
        <div className={styles.header}>
          <button className={styles.back} onClick={() => navigate('/')}>
            <ArrowLeft size={14} /> Fleet
          </button>
          <div className={styles.siteHeader}>
            <div>
              <h1 className={styles.siteName}>{site.name}</h1>
              <span className={styles.siteLocation}>{site.location} · {site.timezone}</span>
            </div>
            <div className={styles.badges}>
              <Badge color={statusColor(site.status)}>{site.status}</Badge>
              <Badge color={dispatchColor(site.dispatchState)} pulse={site.dispatchState !== 'STANDBY'}>
                {site.dispatchState}
              </Badge>
              {site.activeAlarms > 0 && (
                <Badge color="var(--red)"><AlertTriangle size={11} /> {site.activeAlarms} ALARM{site.activeAlarms > 1 ? 'S' : ''}</Badge>
              )}
            </div>
          </div>
        </div>

        {/* KPI row */}
        <div className={styles.kpiRow}>
          <KPI label="STATE OF CHARGE" value={`${site.socPercent?.toFixed(1)}%`} color={socColor(site.socPercent)} big />
          <KPI label="POWER" value={formatPower(site.powerKw)} color="var(--orange)" big />
          <KPI label="CAPACITY" value={formatCapacity(site.capacityKwh)} color="var(--blue)" />
          <KPI label="VOLTAGE" value={`${site.voltageV?.toFixed(0)} V`} color="var(--text)" />
          <KPI label="TEMPERATURE" value={`${site.tempCelsius?.toFixed(1)}°C`} color={site.tempCelsius > 35 ? 'var(--red)' : 'var(--text)'} />
          <KPI label="DEVICES" value={devices.length} color="var(--text)" />
        </div>

        <div className={styles.mainGrid}>
          {/* Telemetry chart */}
          <div className={styles.chartCard}>
            <div className={styles.cardLabel}>TELEMETRY — LAST 50 READINGS</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'IBM Plex Mono' }} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, fontFamily: 'IBM Plex Mono', fontSize: 11 }}
                  labelStyle={{ color: 'var(--text-muted)' }}
                />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'IBM Plex Mono', color: 'var(--text-muted)' }} />
                <Line type="monotone" dataKey="soc" stroke="var(--green)" strokeWidth={1.5} dot={false} name="SOC %" />
                <Line type="monotone" dataKey="power" stroke="var(--orange)" strokeWidth={1.5} dot={false} name="Power kW" />
                <Line type="monotone" dataKey="temp" stroke="var(--blue)" strokeWidth={1.5} dot={false} name="Temp °C" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Command dispatch */}
          <div className={styles.commandCard}>
            <div className={styles.cardLabel}>COMMAND DISPATCH</div>
            <div className={styles.commandForm}>
              <div className={styles.cmdButtons}>
                {COMMAND_TYPES.map(cmd => (
                  <button
                    key={cmd}
                    className={`${styles.cmdBtn} ${selectedCmd === cmd ? styles.cmdBtnActive : ''}`}
                    style={selectedCmd === cmd ? {
                      borderColor: cmd === 'EMERGENCY_STOP' ? 'var(--red)' : 'var(--orange)',
                      color: cmd === 'EMERGENCY_STOP' ? 'var(--red)' : 'var(--orange)',
                      background: cmd === 'EMERGENCY_STOP' ? 'var(--red-dim)' : 'var(--orange-dim)',
                    } : {}}
                    onClick={() => setSelectedCmd(cmd)}
                  >
                    {cmd.replace('_', ' ')}
                  </button>
                ))}
              </div>
              <button
                className={styles.dispatchBtn}
                onClick={handleDispatch}
                disabled={dispatching || !selectedCmd}
                style={selectedCmd === 'EMERGENCY_STOP' ? { background: 'var(--red)', borderColor: 'var(--red)' } : {}}
              >
                <Send size={13} />
                {dispatching ? 'Dispatching...' : selectedCmd ? `Dispatch ${selectedCmd}` : 'Select a command'}
              </button>
              {cmdResult && (
                <div className={styles.cmdResult} style={{ color: cmdResult.ok ? 'var(--green)' : 'var(--red)' }}>
                  {cmdResult.msg}
                </div>
              )}
            </div>

            {/* Recent commands */}
            <div className={styles.cmdHistory}>
              <div className={styles.cardLabel} style={{ marginBottom: 8 }}>RECENT COMMANDS</div>
              {commands.length === 0 ? (
                <span className="mono" style={{ color: 'var(--text-muted)', fontSize: 11 }}>No commands yet</span>
              ) : commands.map(cmd => (
                <div key={cmd.id} className={styles.cmdRow}>
                  <span className={styles.cmdType}>{cmd.type}</span>
                  <span className={styles.cmdStatus} style={{ color: cmd.status === 'COMPLETED' ? 'var(--green)' : 'var(--yellow)' }}>{cmd.status}</span>
                  <span className={styles.cmdTime}>{formatTime(cmd.issuedAt)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Devices table */}
        <div className={styles.devicesCard}>
          <div className={styles.cardLabel}>DEVICES ({devices.length})</div>
          <div className={styles.deviceTable}>
            <div className={styles.deviceHeader}>
              <span>Name</span><span>Type</span><span>Protocol</span><span>SOC</span><span>Power</span><span>Temp</span><span>Status</span>
            </div>
            {devices.map(dev => (
              <div key={dev.id} className={styles.deviceRow}>
                <span className={styles.devName}>{dev.name}</span>
                <span className={styles.devType}>{dev.type?.replace('_', ' ')}</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{dev.protocol}</span>
                <span className="mono" style={{ color: socColor(dev.socPercent), fontSize: 12 }}>
                  {dev.type === 'METER' ? '--' : `${dev.socPercent?.toFixed(1)}%`}
                </span>
                <span className="mono" style={{ fontSize: 12 }}>{formatPower(dev.powerKw)}</span>
                <span className="mono" style={{ fontSize: 12 }}>{dev.tempCelsius?.toFixed(1)}°C</span>
                <span style={{ color: statusColor(dev.status), fontSize: 11, fontFamily: 'var(--font-mono)' }}>{dev.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function KPI({ label, value, color, big }) {
  return (
    <div className={styles.kpi}>
      <span className={styles.kpiLabel}>{label}</span>
      <span className={styles.kpiValue} style={{ color, fontSize: big ? 22 : 16 }}>{value}</span>
    </div>
  )
}

function Badge({ children, color, pulse }) {
  return (
    <span className={styles.badge} style={{ color, borderColor: color, background: `${color}18` }}>
      {pulse && <span className={styles.pulseDot} style={{ background: color }} />}
      {children}
    </span>
  )
}
