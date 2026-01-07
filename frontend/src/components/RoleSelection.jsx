import React from 'react'
import { useNavigate } from 'react-router-dom'

const RoleSelection = () => {
  const navigate = useNavigate()

  return (
    <div className="role-selection-container">
      <h1 style={{textAlign: 'center'}}>Welcome to Gaming Area</h1>
      <p style={{textAlign: 'center'}}>Please select your role to continue</p>
      
      <div className="role-cards">
        <div 
          className="card role-card role-card-user" 
          onClick={() => navigate('/user')}
        >
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👤</div>
          <h2>User</h2>
          <p>Browse games and make bookings</p>
        </div>

        <div 
          className="card role-card role-card-admin" 
          onClick={() => navigate('/admin/login')}
        >
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛡️</div>
          <h2>Administrator</h2>
          <p>Manage games and bookings</p>
        </div>
      </div>
    </div>
  )
}

export default RoleSelection
