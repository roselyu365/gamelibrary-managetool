import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import AvailabilityCalendar from './AvailabilityCalendar' // Import the new component

const GameDetails = ({ gameId, onClose, apiUrl }) => {
  const navigate = useNavigate()
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCalendar, setShowCalendar] = useState(false) // State to toggle calendar

  useEffect(() => {
    const fetchGameDetails = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await axios.get(`${apiUrl}/api/games/${gameId}`)
        setGame(response.data)
      } catch (err) {
        setError('Failed to load game details')
        console.error('Error fetching game details:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGameDetails()
  }, [gameId, apiUrl])

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-body" style={{textAlign: 'center', padding: '3rem'}}>
            <div className="loading">Loading game details...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Game Details</h2>
            <button className="modal-close" onClick={onClose}>&times;</button>
          </div>
          <div className="modal-body">
            <div className="alert alert-error">{error}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Game Details</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="game-details">
            <div className="game-details-cover">
              {game.cover_image ? (
                <img src={game.cover_image} alt={game.title} />
              ) : (
                <div style={{
                  width: '100%',
                  height: '300px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '5rem'
                }}>🎮</div>
              )}
            </div>

            <div className="game-details-info">
              <h1 className="game-details-title">
                {game.title}
                {game.chinese_title && <span style={{display: 'block', fontSize: '1.2rem', color: '#666', marginTop: '0.2rem'}}>{game.chinese_title}</span>}
              </h1>

              <div className="game-details-meta">
                <div className="meta-item">
                  <strong>Platform:</strong> {game.platform}
                </div>
                <div className="meta-item">
                  <strong>Genre:</strong> {game.genre || 'Not specified'}
                </div>
                {game.release_year && (
                  <div className="meta-item">
                    <strong>Release Year:</strong> {game.release_year}
                  </div>
                )}
                {game.developer && (
                  <div className="meta-item">
                    <strong>Developer:</strong> {game.developer}
                  </div>
                )}
                {game.publisher && (
                  <div className="meta-item">
                    <strong>Publisher:</strong> {game.publisher}
                  </div>
                )}
                {game.rating && (
                  <div className="meta-item">
                    <strong>Rating:</strong> <span className="rating-badge">{game.rating}</span>
                  </div>
                )}
                {game.max_players && (
                  <div className="meta-item">
                    <strong>Max Players:</strong> {game.max_players}
                  </div>
                )}
                {game.online_multiplayer !== undefined && (
                  <div className="meta-item">
                    <strong>Online Multiplayer:</strong> {game.online_multiplayer ? '✓ Yes' : '✗ No'}
                  </div>
                )}
              </div>

            </div>
          </div>
          
          <div className="game-details-description">
            <h3>Description</h3>
            <p>{game.description || 'No description available.'}</p>
          </div>

          <div className="game-details-actions" style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
            <button 
              onClick={() => {
                navigate('/user/booking', { state: { gameId: game.id } })
              }}
              className="primary-btn"
              style={{
                flex: 1, 
                padding: '1rem', 
                fontSize: '1.1rem', 
                backgroundColor: '#667eea', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer'
              }}
            >
              Go Booking
            </button>
            <button 
              onClick={() => {
                setShowCalendar(true) // Open calendar instead of alert
              }}
              className="secondary-btn"
              style={{
                flex: 1, 
                padding: '1rem', 
                fontSize: '1.1rem', 
                backgroundColor: '#e2e8f0', 
                color: '#2d3748', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer'
              }}
            >
              Check Availability
            </button>
          </div>

          {game.created_at && (
            <div className="game-details-timestamp">
              <small>
                Added: {new Date(game.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                {game.updated_at && game.updated_at !== game.created_at && (
                  <span> (Updated: {new Date(game.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })})</span>
                )}
              </small>
            </div>
          )}
        </div>
      </div>
      
      {showCalendar && (
        <AvailabilityCalendar 
            gameId={gameId} 
            apiUrl={apiUrl} 
            onClose={() => setShowCalendar(false)} 
        />
      )}
    </div>
  )
}

export default GameDetails
