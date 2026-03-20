import { useState, useEffect } from 'react'
import { getSimulatorStatus, startSimulator, stopSimulator, setSimulatorMode } from '../api/client'
import Topbar from '../components/Topbar'
import styles from './Simulator.module.css'

export default function Simulator() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchStatus = async () => {
    try {
      const res = await getSimulatorStatus()
      setStatus(res.data)
    } catch {}
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 3000)
    return () => clearInterval(interval)
  }, [])

  const toggle = async () => {
    setLoading(true)
    try {
      if (status?.enabled) await stopSimulator()
      else await startSimulator()
      await fetchStatus()
    } finally { setLoading(false) }
  }

  const switchMode = async (mode) => {
    setLoading(true)
    try {
      await setSimulatorMode(mode)
      await fetchStatus()
    } finally { setLoading(false) }
  }

  return (
    <div className={styles.page}>
      <Topbar title="Simulator Control" />

      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>TELEMETRY SIMULATOR</div>
          <p className={styles.desc}>
            Controls the Spring Boot scheduled task that writes simulated telemetry to MongoDB.
            In a production system, this data would come from the OEG edge gateway via MQTT.
          </p>

          {status && (
            <div className={styles.statusBlock}>
              <div className={styles.statusRow}>
                <span className={styles.statusLabel}>STATUS</span>
                <div className={styles.statusVal}>
                  <div className={styles.dot} style={{ background: status.enabled ? 'var(--green)' : 'var(--red)', animation: status.enabled ? 'pulse 2s infinite' : 'none' }} />
                  <span className="mono" style={{ color: status.enabled ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>
                    {status.enabled ? 'RUNNING' : 'STOPPED'}
                  </span>
                </div>
              </div>
              <div className={styles.statusRow}>
                <span className={styles.statusLabel}>MODE</span>
                <span className="mono" style={{ color: 'var(--orange)', fontWeight: 700 }}>{status.mode}</span>
              </div>
            </div>
          )}

          {/* On/Off toggle */}
          <button
            className={styles.toggleBtn}
            onClick={toggle}
            disabled={loading}
            style={{ background: status?.enabled ? 'var(--red-dim)' : 'var(--green-dim)', borderColor: status?.enabled ? 'var(--red)' : 'var(--green)', color: status?.enabled ? 'var(--red)' : 'var(--green)' }}
          >
            {loading ? 'Updating...' : status?.enabled ? 'Stop Simulator' : 'Start Simulator'}
          </button>
        </div>

        {/* Mode selection */}
        <div className={styles.card}>
          <div className={styles.cardLabel}>SIMULATION MODE</div>

          <div className={styles.modeGrid}>
            <ModeCard
              mode="STEADY"
              active={status?.mode === 'STEADY'}
              title="Steady State"
              desc="Values drift very slightly around a stable baseline. SOC stays near current level, power fluctuates minimally. Good for showing a site at rest."
              color="var(--blue)"
              onClick={() => switchMode('STEADY')}
              disabled={loading}
            />
            <ModeCard
              mode="LIVE"
              active={status?.mode === 'LIVE'}
              title="Live / Dynamic"
              desc="Values respond to the site's dispatch state. CHARGING raises SOC, DISCHARGING drains it, alarms can trigger randomly. Good for showing active grid behavior."
              color="var(--orange)"
              onClick={() => switchMode('LIVE')}
              disabled={loading}
            />
          </div>
        </div>

        {/* Architecture note */}
        <div className={styles.card} style={{ borderColor: 'var(--orange-border)', background: 'var(--orange-dim)' }}>
          <div className={styles.cardLabel} style={{ color: 'var(--orange)' }}>ARCHITECTURE NOTE</div>
          <p className={styles.desc} style={{ color: 'var(--text-dim)' }}>
            This simulator replicates the data flow of a real BESS telemetry pipeline without requiring
            physical hardware or a live network. In a production system, the edge gateway (the hardware
            unit on-site) continuously publishes telemetry readings at a fixed interval to a messaging
            broker (Kafka) — a pipeline that queues and delivers data between services. A Spring Boot
            consumer service listens to that pipeline and writes each reading to MongoDB the moment it
            arrives, with no polling or delay. Here, the simulator uses a Spring <code>@Scheduled</code> task
            that fires at the same interval and writes directly to MongoDB, reproducing that behavior
            without the broker in between.
          </p>
        </div>
      </div>
    </div>
  )
}

function ModeCard({ mode, active, title, desc, color, onClick, disabled }) {
  return (
    <div
      className={styles.modeCard}
      style={active ? { borderColor: color, background: `${color}12` } : {}}
      onClick={disabled ? null : onClick}
    >
      <div className={styles.modeHeader}>
        <div className={styles.modeRadio} style={active ? { borderColor: color, background: color } : {}} />
        <span className={styles.modeTitle} style={active ? { color } : {}}>{title}</span>
        <span className="mono" style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 'auto' }}>{mode}</span>
      </div>
      <p className={styles.modeDesc}>{desc}</p>
    </div>
  )
}
