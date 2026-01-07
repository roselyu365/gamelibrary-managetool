import React, { useState, useEffect } from 'react'
import axios from 'axios'
import GameDetails from './GameDetails'

const GameSearch = ({ apiUrl }) => {
  const [games, setGames] = useState([])
  const [platforms, setPlatforms] = useState([])
  
  // New Metadata State
  const [metadata, setMetadata] = useState({
      decades: [],
      game_types: [],
      styles: []
  });
  
  // Expanded Filter State
  const [filters, setFilters] = useState({
    search: '',
    platform_id: '',
    available_only: false,
    selectedDecades: [], // Array of strings e.g. "2020s"
    selectedGameTypes: [], // Array of strings e.g. "Action"
    selectedStyles: [] // Array of strings e.g. "Single Player"
  })
  
  // UI State for collapsing sections
  const [expandedSections, setExpandedSections] = useState({
      decades: false,
      gameTypes: false,
      styles: false
  });

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedGameId, setSelectedGameId] = useState(null)


  useEffect(() => {
    fetchPlatforms()
    fetchMetadata()
    fetchGames()
  }, [page])
  
  // Auto-search effect for array filters
  useEffect(() => {
      setPage(1);
      fetchGames();
  }, [filters.platform_id, filters.available_only, filters.selectedDecades, filters.selectedGameTypes, filters.selectedStyles])

  const fetchPlatforms = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/platforms`)
      setPlatforms(response.data)
    } catch (err) {
      console.error('Error fetching platforms:', err)
    }
  }

  const fetchMetadata = async () => {
    try {
        const response = await axios.get(`${apiUrl}/api/games/browsing-metadata`);
        setMetadata(response.data);
    } catch (err) {
        console.error('Error fetching metadata', err);
    }
  }

  const fetchGames = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page,
        per_page: 20
      })
      
      // Simple filters
      if (filters.search) params.append('search', filters.search);
      if (filters.platform_id) params.append('platform_id', filters.platform_id);
      if (filters.available_only) params.append('available_only', 'true');
      
      // Array filters -> comma joined string
      if (filters.selectedDecades.length > 0) params.append('decades', filters.selectedDecades.join(','));
      if (filters.selectedGameTypes.length > 0) params.append('genres', filters.selectedGameTypes.join(','));
      if (filters.selectedStyles.length > 0) params.append('styles', filters.selectedStyles.join(','));

      const response = await axios.get(`${apiUrl}/api/games/search?${params}`)
      setGames(response.data.games)
      setTotalPages(response.data.pages)
    } catch (err) {
      setError('Failed to load games. Please try again.')
      console.error('Error fetching games:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchGames()
  }

  const toggleSection = (section) => {
      setExpandedSections(prev => ({
          ...prev,
          [section]: !prev[section]
      }));
  }

  const toggleFilter = (type, value) => {
      setFilters(prev => {
          const list = prev[type];
          const newList = list.includes(value) 
            ? list.filter(item => item !== value)
            : [...list, value];
            
          return { ...prev, [type]: newList };
      });
  }

  const isSelected = (type, value) => filters[type].includes(value);

  const FilterSection = ({ title, sectionKey, items, filterTypeKey }) => (
      <div style={{marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '1rem'}}>
          <div 
            onClick={() => toggleSection(sectionKey)}
            style={{
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                cursor: 'pointer',
                fontWeight: 'bold',
                marginBottom: '0.5rem'
            }}
          >
              <span>{title}</span>
              <span>{expandedSections[sectionKey] ? '▲' : '▼'}</span>
          </div>
          
          {expandedSections[sectionKey] && (
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
                  {items.map(item => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleFilter(filterTypeKey, item)}
                        style={{
                            padding: '0.3rem 0.8rem',
                            borderRadius: '15px',
                            border: '1px solid #667eea',
                            backgroundColor: isSelected(filterTypeKey, item) ? '#667eea' : 'white',
                            color: isSelected(filterTypeKey, item) ? 'white' : '#667eea',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                      >
                          {item}
                      </button>
                  ))}
              </div>
          )}
      </div>
  );

  return (
    <div>
      <div className="card">
        <h2>🔍 Search Assets</h2>
        <form onSubmit={handleSearch}>
          <div className="search-filters">
            <div className="form-group" style={{flex: 2}}>
              <label>Search</label>
              <input
                type="text"
                placeholder="Search by Title..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
              />
            </div>

            <div className="form-group" style={{flex: 1}}>
              <label>Platform</label>
              <select
                value={filters.platform_id}
                onChange={(e) => setFilters(prev => ({...prev, platform_id: e.target.value}))}
              >
                <option value="">All Platforms</option>
                {platforms.map(platform => (
                  <option key={platform.id} value={platform.id}>
                    {platform.name}
                  </option>
                ))}
              </select>
            </div>
            
             <div className="form-group">
              <label>&nbsp;</label>
              <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <input
                  type="checkbox"
                  checked={filters.available_only}
                  onChange={(e) => setFilters(prev => ({...prev, available_only: e.target.checked}))}
                  style={{width: 'auto'}}
                />
                Available Only
              </label>
            </div>
          </div>
          
          <div className="advanced-filters" style={{marginTop: '1rem'}}>
              <FilterSection 
                title="📅 Era" 
                sectionKey="decades" 
                items={metadata.decades} 
                filterTypeKey="selectedDecades" 
              />
              <FilterSection 
                title="🎮 Genres" 
                sectionKey="gameTypes" 
                items={metadata.game_types} 
                filterTypeKey="selectedGameTypes" 
              />
          </div>

          <button type="submit" style={{marginTop: '1rem'}}>Search Games</button>
        </form>
      </div>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div className="loading">Loading games...</div>
      ) : (
        <>
          <div className="games-grid">
            {games.map(game => (
              <div 
                key={game.id} 
                className="game-card game-card-clickable"
                onClick={() => setSelectedGameId(game.id)}
              >
                {game.cover_image ? (
                  <img src={game.cover_image} alt={game.title} />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '200px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '3rem'
                  }}>🎮</div>
                )}
                <div className="game-card-content">
                  <div className="game-card-title">
                    {game.title}
                    {game.chinese_title && <span style={{display: 'block', fontSize: '0.9rem', color: '#888', fontWeight: 'normal'}}>{game.chinese_title}</span>}
                  </div>
                  <span className="game-card-platform">{game.platform}</span>
                  <div className="game-card-genre">{game.genre || 'No genre specified'}</div>
                  <div className="game-card-availability">
                    {game.available_copies > 0 ? (
                      <span className="available">✓ {game.available_copies} available</span>
                    ) : (
                      <span className="unavailable">✗ Not available</span>
                    )}
                    <span style={{color: '#666', marginLeft: 'auto'}}>
                      {game.total_copies} total copies
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              {Array.from({length: totalPages}, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={page === p ? 'active' : ''}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
      )}

      {selectedGameId && (
        <GameDetails
          gameId={selectedGameId}
          onClose={() => setSelectedGameId(null)}
          apiUrl={apiUrl}
        />
      )}
    </>
  )}
</div>
  )
}

export default GameSearch
