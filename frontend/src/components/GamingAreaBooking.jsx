import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'

const GamingAreaBooking = ({ apiUrl }) => {
  const location = useLocation()
  const [selectedDate, setSelectedDate] = useState('')
  const [availability, setAvailability] = useState(null)
  const [games, setGames] = useState([])
  const [filteredGames, setFilteredGames] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedGame, setSelectedGame] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [config, setConfig] = useState(null)

  const [booking, setBooking] = useState({
    booking_date: '',
    start_time: '',
    end_time: '',
    user_name: '',
    user_email: '',
    student_id: '', // New field
    number_of_players: 1,
    special_requests: '',
    game_id: null
  })

  const [selectedSlots, setSelectedSlots] = useState([])

  useEffect(() => {
    fetchConfig()
    fetchGames()
    // Set default date to today
    const today = new Date().toISOString().split('T')[0]
    setBooking(prev => ({...prev, booking_date: today}))
    setSelectedDate(today)

    // Check if a game was pre-selected from navigation
    if (location.state?.gameId) {
      const gameId = location.state.gameId
      setSelectedGame(gameId)
      setBooking(prev => ({...prev, game_id: gameId}))
    }

    // Check availability for today on initial load
    checkAvailability(today)
  }, [location.state])

  // Filter games when searchTerm changes
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredGames(games)
    } else {
      const lower = searchTerm.toLowerCase();
      const filtered = games.filter(g => 
        (g.title && g.title.toLowerCase().includes(lower)) || 
        (g.chinese_title && g.chinese_title.toLowerCase().includes(lower))
      );
      setFilteredGames(filtered)
    }
  }, [searchTerm, games])

  // Initialize filtered games when games load
  useEffect(() => {
    setFilteredGames(games);
    // Determine initial search term if game is pre-selected
    if (selectedGame && games.length > 0) {
      const game = games.find(g => g.id === selectedGame);
      if (game) setSearchTerm(game.title);
    }
  }, [games, selectedGame]);


  const fetchConfig = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/config`)
      setConfig(response.data)
    } catch (err) {
      console.error('Error fetching config:', err)
    }
  }

  const fetchGames = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/games/search?available_only=true`)
      setGames(response.data.games || [])
    } catch (err) {
      console.error('Error fetching games:', err)
    }
  }

  const checkAvailability = async (date) => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${apiUrl}/api/gaming-area/availability?date=${date}`)
      setAvailability(response.data)
    } catch (err) {
      setError('Failed to check availability')
      console.error('Error checking availability:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (e) => {
    const date = e.target.value
    setSelectedDate(date)
    setBooking(prev => ({...prev, booking_date: date}))
    setSelectedSlots([])
    if (date) {
      checkAvailability(date)
    }
  }

  const toggleSlot = (slot) => {
    if (availability.booked_slots.some(booked =>
      (booked.start <= slot.start && booked.end > slot.start) ||
      (booked.start < slot.end && booked.end >= slot.end)
    )) {
      return // Slot is booked
    }

    setSelectedSlots(prev => {
      const exists = prev.find(s => s.start === slot.start)
      if (exists) {
        return prev.filter(s => s.start !== slot.start)
      } else {
        return [...prev, slot].sort((a, b) => a.start.localeCompare(b.start))
      }
    })
  }

  useEffect(() => {
    if (selectedSlots.length > 0) {
      const start = selectedSlots[0].start
      const end = selectedSlots[selectedSlots.length - 1].end
      setBooking(prev => ({
        ...prev,
        start_time: start,
        end_time: end
      }))
    } else {
      setBooking(prev => ({
        ...prev,
        start_time: '',
        end_time: ''
      }))
    }
  }, [selectedSlots])

  const handleGameSelect = (game) => {
    if (!game) {
        setSelectedGame(null);
        setBooking(prev => ({...prev, game_id: null}));
        setSearchTerm('');
        return;
    }
    setSelectedGame(game.id)
    setBooking(prev => ({...prev, game_id: game.id}))
    setSearchTerm(game.title)
    setIsDropdownOpen(false)
  }
  
  const handleBooking = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!booking.game_id) {
      setError('Please select a game to play')
      return
    }

    // New Frontend Validation: Max 4 hours check (simple check)
    // Note: The real robust check is on the backend, but we can give checking here if possible.
    // However, simply enforcing "Length of selectedSlots <= 4" is good for single booking.
    if (selectedSlots.length > 4) {
        setError('You can only book up to 4 hours at a time. Also note the weekly limit is 4 hours.')
        return
    }

    try {
      const response = await axios.post(`${apiUrl}/api/gaming-area/bookings`, booking)
      setSuccess('Gaming area booked successfully! See you there!')
      setBooking({
        booking_date: selectedDate,
        start_time: '',
        end_time: '',
        user_name: '',
        user_email: '',
        student_id: '', // Reset new field
        number_of_players: 1,
        special_requests: '',
        game_id: null
      })
      setSelectedSlots([])
      setSelectedGame(null)
      checkAvailability(selectedDate) // Refresh availability
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create booking')
    }
  }

  const getMinDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  const getMaxDate = () => {
    // Current Logic: Next week is released on Monday. 
    // This allows booking up to next Sunday.
    // Calculate "End of Next Week" from today.
    
    const today = new Date();
    const dayOfWeek = today.getDay(); // Sun=0, Mon=1...Sat=6
    
    // Calculate days until next Sunday.
    // If today is Sunday (0), next Sunday is 7 days away.
    // If today is Monday (1), next Sunday is 6 (this week) + 7 (next week) = 13 days away.
    // Formula: Days to end of NEXT week (Sunday)
    // Days to end of CURRENT week (Sunday) = (7 - dayOfWeek) % 7 
    // Wait, (7-0)%7 = 0 (Today is Sun).
    // (7-1)%7 = 6 (Today is Mon, 6 days to Sun). Correct.
    
    const daysToCurrentSunday = (7 - dayOfWeek) % 7;
    // Next Sunday is current Sunday + 7 days
    const daysToNextSunday = daysToCurrentSunday + 7;
    
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + daysToNextSunday);
    
    return maxDate.toISOString().split('T')[0];
  }

  return (
    <div>
      <div className="card">
        <h2>📅 Book Gaming Area</h2>
        <div className="alert alert-info" style={{marginBottom: '1.5rem'}}>
          <strong>ℹ️ In-Area Gaming:</strong> Games are for use within the gaming area only. 
          You cannot take games home with you.
        </div>

        {config && (
          <div className="stats-grid" style={{marginBottom: '1.5rem'}}>
            <div className="stat-card">
              <div className="stat-card-value">{config.max_booking_hours_per_week}h</div>
              <div className="stat-card-label">Max Per Week</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-value">{config.gaming_area_open_hour}:00</div>
              <div className="stat-card-label">Opens</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-value">{config.gaming_area_close_hour}:00</div>
              <div className="stat-card-label">Closes</div>
            </div>
          </div>
        )}

        <form onSubmit={handleBooking}>
          <div className="form-group">
            <label>Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              min={getMinDate()}
              max={getMaxDate()}
              required
            />
          </div>

          {loading && <div className="loading">Checking availability...</div>}

          {availability && !loading && (
            <>
              <h3 style={{marginTop: '1.5rem', marginBottom: '1rem'}}>
                Available Time Slots for {new Date(availability.date).toLocaleDateString()}
              </h3>

              <div className="time-slots">
                {availability.available_slots.map((slot, index) => {
                  const isBooked = availability.booked_slots.some(booked =>
                    (booked.start <= slot.start && booked.end > slot.start) ||
                    (booked.start < slot.end && booked.end >= slot.end)
                  )

                  const isSelected = selectedSlots.find(s => s.start === slot.start)

                  return (
                    <div
                      key={index}
                      className={`time-slot ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                      onClick={() => !isBooked && toggleSlot(slot)}
                    >
                      <div>{slot.start}</div>
                      <div style={{fontSize: '0.875rem', color: '#666'}}>to {slot.end}</div>
                    </div>
                  )
                })}
              </div>

              {selectedSlots.length > 0 && (
                <div style={{marginTop: '1rem', textAlign: 'center'}}>
                  <p>Selected: {booking.start_time} - {booking.end_time}</p>
                  <p style={{color: '#666'}}>
                    ({selectedSlots.length} hour{selectedSlots.length > 1 ? 's' : ''})
                  </p>
                </div>
              )}

              {booking.start_time && (
                <>
                  <h3 style={{marginTop: '2rem', marginBottom: '1rem'}}>Select a Game</h3>
                  
                  <div className="form-group" style={{position: 'relative'}}>
                    <label>Choose a game to play in the gaming area</label>
                    
                    <input
                        type="text"
                        placeholder="Search game by English or Chinese title..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsDropdownOpen(true);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        onBlur={() => {
                            // Delay hiding so items can be clicked
                            setTimeout(() => setIsDropdownOpen(false), 200);
                        }}
                        style={{width: '100%', padding: '0.5rem'}}
                    />
                    
                    {isDropdownOpen && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            maxHeight: '200px',
                            overflowY: 'auto',
                            backgroundColor: 'white',
                            border: '1px solid #ddd',
                            zIndex: 1000,
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                             {/* Allow "Deselect" or "None" option if needed, 
                                 or just rely on standard filtering. 
                                 Here we just list the filtered games. */}
                             {filteredGames.length === 0 && (
                                 <div style={{padding: '0.5rem', color: '#888'}}>No games found</div>
                             )}
                             {filteredGames.map(game => (
                                <div 
                                    key={game.id}
                                    onClick={() => handleGameSelect(game)}
                                    style={{
                                        padding: '0.5rem',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #eee',
                                        backgroundColor: selectedGame === game.id ? '#f0f4ff' : 'white'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = selectedGame === game.id ? '#f0f4ff' : 'white'}
                                >
                                    <strong>{game.title}</strong>
                                    {game.chinese_title && <span style={{color: '#666', marginLeft: '0.5rem'}}>({game.chinese_title})</span>}
                                    <span style={{fontSize: '0.8rem', color: '#999', float: 'right'}}>
                                        {game.platform}
                                    </span>
                                </div>
                             ))}
                        </div>
                    )}

                    <small style={{color: '#666', marginTop: '0.5rem', display: 'block'}}>
                      Only available games are shown. The game will be provided for use within the gaming area during your booking.
                    </small>
                  </div>

                  <h3 style={{marginTop: '2rem', marginBottom: '1rem'}}>Your Details</h3>

                  <div className="form-group">
                    <label>Your Name</label>
                    <input
                      type="text"
                      value={booking.user_name}
                      onChange={(e) => setBooking({...booking, user_name: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Student ID</label>
                    <input
                      type="text"
                      value={booking.student_id}
                      onChange={(e) => setBooking({...booking, student_id: e.target.value})}
                      required
                      placeholder="Enter your Student ID"
                    />
                  </div>

                  <div className="form-group">
                    <label>Your Email</label>
                    <input
                      type="email"
                      value={booking.user_email}
                      onChange={(e) => setBooking({...booking, user_email: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Number of Players</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={booking.number_of_players}
                      onChange={(e) => setBooking({...booking, number_of_players: parseInt(e.target.value)})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Special Requests (optional)</label>
                    <textarea
                      value={booking.special_requests}
                      onChange={(e) => setBooking({...booking, special_requests: e.target.value})}
                      rows="3"
                      placeholder="Any special requirements or requests..."
                    />
                  </div>

                  <button type="submit">Confirm Booking</button>
                </>
              )}
            </>
          )}
        </form>

        {error && <div className="error" style={{marginTop: '1rem'}}>{error}</div>}
        {success && <div className="success" style={{marginTop: '1rem'}}>{success}</div>}
      </div>
    </div>
  )
}

export default GamingAreaBooking
