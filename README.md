# 🎮 Gaming Area Catalog & Booking System

A comprehensive web application for managing a gaming library with 2,000+ games across multiple platforms (PS5, PS4, Xbox, Nintendo Switch), featuring game rentals and gaming area bookings.

## Features

### For Users (Students)
- **🔍 Asset Search**: Advanced browsing with "Era" and "Genres" atomic filters, fuzzy search (English/Chinese) and autocomplete.
- **📚 Availability Display**: See real-time availability of all games and assets.
- **🎮 Game Rentals**: Rent games for customizable durations.
- **📅 Gaming Area Bookings**: Book the gaming area with time-slot selection (max 4h/week, available 8am-11pm).
- **🌏 Bilingual Support**: Full support for English and Chinese game titles.
- **🏷️ Intelligent Tagging**: Automated tag cleaning (e.g., "Action-Adventure" -> "Action" + "Adventure") and compound tag handling (e.g., "Sci-Fi", "Co-Op").

### For Administrators
- **📦 Inventory Management**: Add, edit, delete games with full details
- **🎯 Platform Management**: Manage gaming platforms
- **📊 Rental Tracking**: Track all game rentals and mark returns
- **📅 Booking Management**: View all gaming area bookings
- **📈 Dashboard**: Real-time statistics overview

## Tech Stack

### Backend
- **Flask** (Python) - RESTful API
- **SQLAlchemy** - Database ORM
- **SQLite** - Database
- **Flask-CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **Vite** - Build tool

## Installation

### Prerequisites
- Python 3.12+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the project directory:
```bash
cd gaming-area
```

2. Create a virtual environment:
```bash
python3 -m venv ven
source ven/bin/activate  # On Windows: ven\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Initialize the database:
```bash
python app.py
```

The database will be automatically created with default platforms (PS5, PS4, PS3, Xbox, Nintendo Switch).

The backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000` (or similar available port)

## Usage

### Starting the Application

**Terminal 1 - Backend:**
```bash
cd gaming-area
source ven/bin/activate
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd gaming-area/frontend
npm run dev
```

### Accessing the Application

Open your browser and navigate to:
- **User Interface**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin

## Configuration

Edit these constants in `app.py` to customize the system:

```python
MAX_BOOKING_HOURS_PER_DAY = 4  # Maximum hours per user per day
MAX_BOOKING_DAYS_IN_ADVANCE = 7  # Maximum days in advance for bookings
GAMING_AREA_OPEN_HOUR = 10  # Gaming area opens at 10 AM
GAMING_AREA_CLOSE_HOUR = 22  # Gaming area closes at 10 PM
DEFAULT_RENTAL_DURATION_DAYS = 7  # Default rental period
```

## API Endpoints

### Public Endpoints
- `GET /api/games/search` - Search games
- `GET /api/games/<id>` - Get specific game
- `POST /api/rentals` - Rent a game
- `GET /api/gaming-area/availability` - Check availability
- `POST /api/gaming-area/bookings` - Book gaming area
- `GET /api/config` - Get system configuration

### Admin Endpoints
- `GET/POST /api/admin/platforms` - Manage platforms
- `GET/POST /api/admin/games` - Manage games
- `PUT/DELETE /api/admin/games/<id>` - Update/delete games
- `GET /api/admin/rentals` - View all rentals
- `POST /api/admin/rentals/<id>/return` - Mark game returned
- `GET /api/admin/bookings` - View all bookings

## Database Schema

### Platforms
- id, name, description, created_at

### Games
- id, title, platform_id, genre, release_year, developer, publisher, rating, max_players, online_multiplayer, description, cover_image, total_copies, available_copies, created_at, updated_at

### Rentals
- id, game_id, user_name, user_email, rental_date, due_date, return_date, status, notes, created_at

### Gaming Area Bookings
- id, user_name, user_email, booking_date, start_time, end_time, number_of_players, special_requests, status, created_at, updated_at

## Importing Games

The system is designed to handle 2,000+ games. You can import games programmatically:

```python
from app import app, db, Game, Platform

with app.app_context():
    # Example: Add a game
    ps5_platform = Platform.query.filter_by(name='PS5').first()
    game = Game(
        title="Spider-Man 2",
        platform_id=ps5_platform.id,
        genre="Action-Adventure",
        release_year=2023,
        developer="Insomniac Games",
        publisher="Sony Interactive Entertainment",
        rating="T",
        max_players=1,
        online_multiplayer=False,
        total_copies=3,
        available_copies=3
    )
    db.session.add(game)
    db.session.commit()
```

Or use the API to bulk import games via the admin interface or API calls.

## Development

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

**Backend:**
Update `app.py` to serve the built frontend:
```python
# Add to app.py
from flask import send_from_directory

@app.route('/')
def serve_frontend():
    return send_from_directory('../frontend/dist', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('../frontend/dist', path)
```

## Features in Detail

### Game Search
- Real-time search by title
- Filter by platform (PS5, PS4, PS3, Xbox, Nintendo Switch)
- Filter by genre
- Show only available games
- Paginated results (20 per page)

### Game Rentals
- Rent games with customizable duration
- Automatic availability tracking
- Due date calculation
- Rental status tracking (active, returned, overdue)
- User rental history by email

### Gaming Area Bookings
- Visual time-slot selection
- Real-time availability checking
- Conflict detection
- Daily booking limits per user
- Maximum booking duration enforcement
- Advance booking limits

### Admin Dashboard
- Overview statistics
- Game inventory management
- Platform management
- Rental tracking and management
- Booking overview
- Quick actions (return games, edit inventory)

## Security Considerations

**For Production Deployment:**
1. Add user authentication (JWT sessions, OAuth, etc.)
2. Implement rate limiting
3. Use HTTPS
4. Add input validation and sanitization
5. Use environment variables for sensitive config
6. Implement CSRF protection
7. Add proper password hashing for user accounts
8. Set up database backups
9. Implement proper error logging
10. Add email verification for bookings/rentals

## Troubleshooting

### Database Issues
```bash
# Reset database (WARNING: Deletes all data)
rm gaming_catalog.db
python app.py
```

### Port Already in Use
```bash
# Change backend port in app.py (line 345):
app.run(debug=True, host='0.0.0.0', port=5001)

# Change frontend port in frontend/vite.config.js:
server: {
  port: 3001
}
```

## Future Enhancements

- User authentication and authorization
- Email notifications for due dates and bookings
- Game ratings and reviews
- Fines for overdue rentals
- Payment integration
- Advanced analytics and reporting
- Mobile app
- Barcode scanning for quick checkout
- Waitlist system for popular games

## License

MIT License - feel free to use for your gaming area!

## Support

For issues and questions, please contact your system administrator.

---

**Built with ❤️ for gaming areas everywhere**
