import React, { useState } from 'react'
import axios from 'axios'

const GameRental = ({ apiUrl }) => {
  const [studentId, setStudentId] = useState('')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSearchBookings = async (e) => {
    e.preventDefault()
    if (!studentId) return

    setLoading(true)
    setError(null)
    setBookings([]) // Clear previous results
    try {
      const response = await axios.get(`${apiUrl}/api/admin/bookings?student_id=${studentId}`)
      setBookings(response.data)
    } catch (err) {
      setError('Failed to load bookings')
      console.error('Error fetching bookings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return
    }

    try {
      await axios.delete(`${apiUrl}/api/gaming-area/bookings/${bookingId}`)
      // Update the local state to reflect the cancellation
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? {...b, status: 'cancelled'} : b
      ))
      alert('Booking canceled successfully')
    } catch (err) {
      console.error('Error cancelling booking:', err)
      alert('Failed to cancel booking')
    }
  }

  return (
    <div>
      <div className="card">
        <h2>🎮 My Bookings</h2>
        <div className="form-group">
          <label>Enter your Student ID to view your bookings</label>
          <div style={{display: 'flex', gap: '1rem'}}>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Enter Student ID"
            />
            <button onClick={handleSearchBookings} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        {bookings.length > 0 ? (
          <div className="rentals-list">
            {bookings.map(booking => (
              <div key={booking.id} className="rental-item">
                <div className="rental-header">
                  <h3>{booking.game ? booking.game.title : 'Unknown Game'}</h3>
                  <span className={`status-badge ${booking.status}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="rental-details">
                  <p><strong>Date:</strong> {new Date(booking.booking_date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {booking.start_time} - {booking.end_time}</p>
                  <p><strong>Platform:</strong> {booking.game ? booking.game.platform : 'N/A'}</p>
                  <p><strong>Name:</strong> {booking.user_name}</p>
                  
                  {booking.status === 'confirmed' && (
                    <button 
                      onClick={() => handleCancelBooking(booking.id)}
                      className="secondary-btn"
                      style={{
                        marginTop: '1rem',
                        backgroundColor: '#feb2b2',
                        color: '#c53030',
                        fontSize: '0.9rem',
                        padding: '0.5rem 1rem'
                      }}
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          studentId && !loading && <p>No bookings found for this Student ID.</p>
        )}
      </div>
    </div>
  )
}

export default GameRental
