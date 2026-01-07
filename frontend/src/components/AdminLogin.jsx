import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AdminLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (username === 'imelibrary' && password === '261518') {
      onLogin()
      navigate('/admin')
    } else {
      setError('Invalid username or password')
    }
  }

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '4rem' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
          <button type="submit" style={{ width: '100%' }}>Login</button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button 
            type="button" 
            className="button-secondary" 
            onClick={() => navigate('/')}
            style={{ background: 'transparent', color: '#666', border: 'none', textDecoration: 'underline' }}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
