import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
})

// Sites
export const getSites = () => api.get('/sites')
export const getSite = (id) => api.get(`/sites/${id}`)
export const getFleetSummary = () => api.get('/sites/fleet-summary')
export const getSiteDevices = (id) => api.get(`/sites/${id}/devices`)
export const getSiteTelemetry = (id, range = 'recent') => api.get(`/sites/${id}/telemetry?range=${range}`)

// Commands
export const dispatchCommand = (siteId, type, params = {}, issuedBy = 'operator') =>
  api.post('/commands/dispatch', { siteId, type, params, issuedBy })
export const getCommandHistory = (siteId) => api.get(`/commands/site/${siteId}`)
export const getRecentCommands = () => api.get('/commands/recent')

// Simulator
export const getSimulatorStatus = () => api.get('/simulator/status')
export const startSimulator = () => api.post('/simulator/start')
export const stopSimulator = () => api.post('/simulator/stop')
export const setSimulatorMode = (mode) => api.post(`/simulator/mode?mode=${mode}`)

export default api
