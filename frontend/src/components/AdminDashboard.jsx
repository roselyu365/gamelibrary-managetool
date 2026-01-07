import React, { useState, useEffect } from 'react'
import axios from 'axios'

const AdminDashboard = ({ apiUrl }) => {
  const [activeTab, setActiveTab] = useState('games')
  const [platforms, setPlatforms] = useState([])
  const [games, setGames] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [newGame, setNewGame] = useState({
    title: '',
    chinese_title: '',
    platform_id: '',
    genre: '',
    release_year: '',
    developer: '',
    publisher: '',
    rating: '',
    max_players: '',
    online_multiplayer: false,
    description: '',
    cover_image: '',
    total_copies: 1
  })

  const [editingGame, setEditingGame] = useState(null)

  useEffect(() => {
    fetchPlatforms()
    fetchData()
  }, [activeTab])

  const fetchPlatforms = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/platforms`)
      setPlatforms(response.data)
    } catch (err) {
      console.error('Error fetching platforms:', err)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'games') {
        // Increased per_page to 300 to show all games (since we have around 160 items now)
        const response = await axios.get(`${apiUrl}/api/admin/games?per_page=300`)
        setGames(response.data.games)
      } else if (activeTab === 'bookings') {
        const response = await axios.get(`${apiUrl}/api/admin/bookings`)
        setBookings(response.data)
      }
    } catch (err) {
      setError('Failed to load data')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGame = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      await axios.post(`${apiUrl}/api/admin/games`, newGame)
      setSuccess('Game added successfully!')
      setNewGame({
        title: '',
        chinese_title: '',
        platform_id: '',
        genre: '',
        release_year: '',
        developer: '',
        publisher: '',
        rating: '',
        max_players: '',
        online_multiplayer: false,
        description: '',
        cover_image: '',
        total_copies: 1
      })
      fetchData()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add game')
    }
  }

  const handleUpdateGame = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      await axios.put(`${apiUrl}/api/admin/games/${editingGame.id}`, editingGame)
      setSuccess('Game updated successfully!')
      setEditingGame(null)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update game')
    }
  }

  const handleDeleteGame = async (gameId) => {
    if (!window.confirm('Are you sure you want to delete this game?')) return

    setError(null)
    try {
      await axios.delete(`${apiUrl}/api/admin/games/${gameId}`)
      setSuccess('Game deleted successfully!')
      fetchData()
    } catch (err) {
      setError('Failed to delete game')
    }
  }

  const stats = {
    totalGames: games.length,
    totalPlatforms: platforms.length,
    upcomingBookings: bookings.filter(b => b.status === 'confirmed').length
  }

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-value">{stats.totalGames}</div>
          <div className="stat-card-label">Total Games</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{stats.totalPlatforms}</div>
          <div className="stat-card-label">Platforms</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{stats.upcomingBookings}</div>
          <div className="stat-card-label">Upcoming Bookings</div>
        </div>
      </div>

      <div style={{marginBottom: '2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
        <button
          className={activeTab === 'games' ? 'active' : ''}
          onClick={() => setActiveTab('games')}
          style={{background: activeTab === 'games' ? '#764ba2' : '#667eea'}}
        >
          Manage Games
        </button>
        <button
          className={activeTab === 'bookings' ? 'active' : ''}
          onClick={() => setActiveTab('bookings')}
          style={{background: activeTab === 'bookings' ? '#764ba2' : '#667eea'}}
        >
          Bookings
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {activeTab === 'games' && (
        <>
          <div className="card">
            <h2>Add New Game</h2>
            <form onSubmit={handleCreateGame}>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem'}}>
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={newGame.title}
                    onChange={(e) => setNewGame({...newGame, title: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Chinese Title</label>
                  <input
                    type="text"
                    value={newGame.chinese_title || ''}
                    onChange={(e) => setNewGame({...newGame, chinese_title: e.target.value})}
                    placeholder="Enter Chinese title..."
                  />
                </div>

                <div className="form-group">
                  <label>Platform *</label>
                  <select
                    value={newGame.platform_id}
                    onChange={(e) => setNewGame({...newGame, platform_id: e.target.value})}
                    required
                  >
                    <option value="">Select platform</option>
                    {platforms.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Genre</label>
                  <input
                    type="text"
                    value={newGame.genre}
                    onChange={(e) => setNewGame({...newGame, genre: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Release Year</label>
                  <input
                    type="number"
                    value={newGame.release_year}
                    onChange={(e) => setNewGame({...newGame, release_year: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Developer</label>
                  <input
                    type="text"
                    value={newGame.developer}
                    onChange={(e) => setNewGame({...newGame, developer: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Publisher</label>
                  <input
                    type="text"
                    value={newGame.publisher}
                    onChange={(e) => setNewGame({...newGame, publisher: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Rating</label>
                  <select
                    value={newGame.rating}
                    onChange={(e) => setNewGame({...newGame, rating: e.target.value})}
                  >
                    <option value="">Select rating</option>
                    <option value="E">Everyone (E)</option>
                    <option value="E10+">Everyone 10+ (E10+)</option>
                    <option value="T">Teen (T)</option>
                    <option value="M">Mature (M)</option>
                    <option value="AO">Adults Only (AO)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Max Players</label>
                  <input
                    type="number"
                    min="1"
                    value={newGame.max_players}
                    onChange={(e) => setNewGame({...newGame, max_players: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Total Copies</label>
                  <input
                    type="number"
                    min="1"
                    value={newGame.total_copies}
                    onChange={(e) => setNewGame({...newGame, total_copies: parseInt(e.target.value)})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Cover Image URL</label>
                  <input
                    type="text"
                    value={newGame.cover_image}
                    onChange={(e) => setNewGame({...newGame, cover_image: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="form-group" style={{marginTop: '1rem'}}>
                <label>
                  <input
                    type="checkbox"
                    checked={newGame.online_multiplayer}
                    onChange={(e) => setNewGame({...newGame, online_multiplayer: e.target.checked})}
                    style={{width: 'auto', marginRight: '0.5rem'}}
                  />
                  Online Multiplayer
                </label>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newGame.description}
                  onChange={(e) => setNewGame({...newGame, description: e.target.value})}
                  rows="3"
                />
              </div>

              <button type="submit">Add Game</button>
            </form>
          </div>

          <div className="card">
            <h2>Game Library ({games.length} games)</h2>
            {loading ? (
              <div className="loading">Loading games...</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Platform</th>
                    <th>Genre</th>
                    <th>Copies</th>
                    <th>Available</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map(game => (
                    <tr key={game.id}>
                      <td>{game.title}</td>
                      <td>{game.platform}</td>
                      <td>{game.genre || '-'}</td>
                      <td>{game.total_copies}</td>
                      <td>
                        <span className={`badge badge-${game.available_copies > 0 ? 'success' : 'danger'}`}>
                          {game.available_copies}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => setEditingGame(game)}
                          className="btn-secondary"
                          style={{padding: '0.5rem', marginRight: '0.5rem'}}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteGame(game.id)}
                          className="btn-danger"
                          style={{padding: '0.5rem'}}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {activeTab === 'bookings' && (
        <div className="card">
          <h2>Gaming Area Bookings ({bookings.length})</h2>
          {loading ? (
            <div className="loading">Loading bookings...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>User</th>
                  <th>Email</th>
                  <th>Players</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.id}>
                    <td>{new Date(booking.booking_date).toLocaleDateString()}</td>
                    <td>{booking.start_time} - {booking.end_time}</td>
                    <td>{booking.user_name}</td>
                    <td>{booking.user_email}</td>
                    <td>{booking.number_of_players}</td>
                    <td>
                      <span className={`badge badge-${booking.status === 'confirmed' ? 'success' : booking.status === 'cancelled' ? 'danger' : 'warning'}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {editingGame && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{maxWidth: '600px', maxHeight: '90vh', overflow: 'auto'}}>
            <h2>Edit Game</h2>
            <form onSubmit={handleUpdateGame}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={editingGame.title}
                  onChange={(e) => setEditingGame({...editingGame, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Platform</label>
                <select
                  value={editingGame.platform_id}
                  onChange={(e) => setEditingGame({...editingGame, platform_id: e.target.value})}
                  required
                >
                  {platforms.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Genre</label>
                <input
                  type="text"
                  value={editingGame.genre || ''}
                  onChange={(e) => setEditingGame({...editingGame, genre: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Total Copies</label>
                <input
                  type="number"
                  min="0"
                  value={editingGame.total_copies}
                  onChange={(e) => setEditingGame({...editingGame, total_copies: parseInt(e.target.value)})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editingGame.description || ''}
                  onChange={(e) => setEditingGame({...editingGame, description: e.target.value})}
                  rows="5"
                />
              </div>

              <div style={{display: 'flex', gap: '1rem'}}>
                <button type="submit">Save Changes</button>
                <button type="button" className="btn-secondary" onClick={() => setEditingGame(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
