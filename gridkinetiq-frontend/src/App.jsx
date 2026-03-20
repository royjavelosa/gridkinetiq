import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Fleet from './pages/Fleet'
import SiteDetail from './pages/SiteDetail'
import Analytics from './pages/Analytics'
import Commands from './pages/Commands'
import Simulator from './pages/Simulator'
import './App.css'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Fleet onMenuClick={() => setSidebarOpen(true)} />} />
            <Route path="/sites/:id" element={<SiteDetail onMenuClick={() => setSidebarOpen(true)} />} />
            <Route path="/analytics" element={<Analytics onMenuClick={() => setSidebarOpen(true)} />} />
            <Route path="/commands" element={<Commands onMenuClick={() => setSidebarOpen(true)} />} />
            <Route path="/simulator" element={<Simulator onMenuClick={() => setSidebarOpen(true)} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
