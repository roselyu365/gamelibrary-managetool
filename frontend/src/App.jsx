import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import GameSearch from './components/GameSearch'
import GameRental from './components/GameRental'
import GamingAreaBooking from './components/GamingAreaBooking'
import AdminDashboard from './components/AdminDashboard'
import ApiSettings from './components/ApiSettings'
import RoleSelection from './components/RoleSelection'
import AdminLogin from './components/AdminLogin'
import './App.css'

function App() {
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:8000')
  const [showSettings, setShowSettings] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const location = useLocation()

  useEffect(() => {
    // Load saved API URL from localStorage
    const savedApiUrl = localStorage.getItem('backendApiUrl')
    if (savedApiUrl) {
      setApiUrl(savedApiUrl)
    }
  }, [])

  const handleApiUrlChange = (newUrl) => {
    setApiUrl(newUrl)
  }

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const isRoleSelection = location.pathname === '/' || location.pathname === '/admin/login'
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <div className="App">
      {!isRoleSelection && (
        <header>
          <div className="container">
            <h1>🎮 Gaming Area</h1>
            <p>Catalog Search, Game Rentals & Gaming Area Bookings</p>
            <nav>
              {isAdmin ? (
                <>
                  <Link to="/">Home</Link>
                  <Link to="/admin">Dashboard</Link>
                </>
              ) : (
                <>
                  <Link to="/">Home</Link>
                  <Link to="/user">Search Games</Link>
                  <Link to="/user/bookings">My Bookings</Link>
                  <Link to="/user/booking">Book Gaming Area</Link>
                </>
              )}
              <button 
                className="nav-settings-btn"
                onClick={() => setShowSettings(true)}
                title="API Settings"
              >
                ⚙️
              </button>
            </nav>
          </div>
        </header>
      )}

      <main className="container">
        <Routes>
          <Route path="/" element={<RoleSelection />} />
          <Route path="/user" element={<GameSearch apiUrl={apiUrl} />} />
          <Route path="/user/bookings" element={<GameRental apiUrl={apiUrl} />} />
          <Route path="/user/booking" element={<GamingAreaBooking apiUrl={apiUrl} />} />
          <Route path="/admin/login" element={<AdminLogin onLogin={handleLogin} />} />
          <Route 
            path="/admin" 
            element={
              isAuthenticated ? (
                <AdminDashboard apiUrl={apiUrl} />
              ) : (
                <Navigate to="/admin/login" replace />
              )
            } 
          />
        </Routes>
      </main>

      {showSettings && (
        <ApiSettings 
          onClose={() => setShowSettings(false)}
          onApiUrlChange={handleApiUrlChange}
        />
      )}
    </div>
  )
}

export default App
