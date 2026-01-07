import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AvailabilityCalendar = ({ gameId, apiUrl, onClose }) => {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const dates = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date();
          d.setDate(d.getDate() + i);
          dates.push(d.toISOString().split('T')[0]);
        }

        // Fetch availability for each date in parallel
        // Note: The backend endpoint accepts a single date query param.
        // We'll need to call it multiple times or use a range (if backend supports it, but currently it seems single date).
        // Let's call it for each date.
        const promises = dates.map(date => 
            axios.get(`${apiUrl}/api/gaming-area/availability?date=${date}`)
        );
        
        const results = await Promise.all(promises);
        
        const data = results.map((res, index) => ({
            date: dates[index],
            slots: res.data.available_slots || []
        }));
        setAvailability(data);

      } catch (err) {
        console.error("Failed to fetch availability", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [gameId, apiUrl]);

  return (
    <div className="modal-overlay" onClick={onClose} style={{zIndex: 2000}}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '800px'}}>
        <div className="modal-header">
           <h3>7-Day Availability Forecast</h3>
           <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
            {loading ? (
                <div>Loading calendar...</div>
            ) : (
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px'}}>
                    {availability.map(day => {
                        const dateObj = new Date(day.date);
                        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                        const dateNum = dateObj.getDate();
                        const availableCount = day.slots.length;
                        
                        return (
                            <div key={day.date} style={{
                                border: '1px solid #ddd', 
                                borderRadius: '8px', 
                                padding: '10px', 
                                textAlign: 'center',
                                backgroundColor: availableCount > 0 ? '#f0fff4' : '#fff5f5'
                            }}>
                                <div style={{fontWeight: 'bold'}}>{dayName}</div>
                                <div style={{fontSize: '0.9em', color: '#666'}}>{dateNum}</div>
                                <div style={{
                                    marginTop: '10px', 
                                    fontSize: '0.8em',
                                    color: availableCount > 0 ? 'green' : 'red'
                                }}>
                                    {availableCount} slots free
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
             <div style={{marginTop: '20px', textAlign: 'center'}}>
                 <small>Click "Go Booking" to reserve a specific time.</small>
             </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
