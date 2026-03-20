import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Fleet from './pages/Fleet'
import SiteDetail from './pages/SiteDetail'
import Analytics from './pages/Analytics'
import Commands from './pages/Commands'
import Simulator from './pages/Simulator'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Fleet />} />
            <Route path="/sites/:id" element={<SiteDetail />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/commands" element={<Commands />} />
            <Route path="/simulator" element={<Simulator />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
