// SOC color thresholds
export function socColor(soc) {
  if (soc >= 70) return 'var(--green)'
  if (soc >= 30) return 'var(--orange)'
  return 'var(--red)'
}

// Dispatch state badge color
export function dispatchColor(state) {
  switch (state) {
    case 'CHARGING': return 'var(--green)'
    case 'DISCHARGING': return 'var(--orange)'
    case 'STANDBY': return 'var(--blue)'
    case 'FAULT': return 'var(--red)'
    default: return 'var(--text-muted)'
  }
}

// Site status badge color
export function statusColor(status) {
  switch (status) {
    case 'ONLINE': return 'var(--green)'
    case 'OFFLINE': return 'var(--red)'
    case 'DEGRADED': return 'var(--yellow)'
    case 'MAINTENANCE': return 'var(--blue)'
    default: return 'var(--text-muted)'
  }
}

// Format power value with unit
export function formatPower(kw) {
  if (kw === null || kw === undefined) return '--'
  const abs = Math.abs(kw)
  if (abs >= 1000) return `${(kw / 1000).toFixed(2)} MW`
  return `${kw.toFixed(1)} kW`
}

// Format capacity
export function formatCapacity(kwh) {
  if (kwh >= 1000) return `${(kwh / 1000).toFixed(1)} MWh`
  return `${kwh.toFixed(0)} kWh`
}

// Format timestamp relative
export function timeAgo(ts) {
  if (!ts) return '--'
  const diff = Date.now() - new Date(ts).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  return `${h}h ago`
}

// Format ISO timestamp to HH:MM:SS
export function formatTime(ts) {
  if (!ts) return '--'
  return new Date(ts).toLocaleTimeString('en-US', { hour12: false })
}

// Round to 1 decimal
export function r1(val) {
  return typeof val === 'number' ? val.toFixed(1) : '--'
}
