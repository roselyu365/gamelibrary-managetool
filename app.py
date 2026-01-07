#!/usr/bin/env python3
"""
Gaming Catalog & Booking System
Backend API for managing games, rentals, and gaming area bookings
"""

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime, timedelta
from typing import Optional
import os
import re

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///gaming_catalog.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'

db = SQLAlchemy(app)
CORS(app)

# Configuration constants
MAX_BOOKING_HOURS_PER_WEEK = 4  # Maximum hours a user can book per week
GAMING_AREA_OPEN_HOUR = 8  # Gaming area opens at 8 AM
GAMING_AREA_CLOSE_HOUR = 23  # Gaming area closes at 11 PM
DEFAULT_RENTAL_DURATION_DAYS = 7  # Default rental period in days

# ==================== MODELS ====================

class Platform(db.Model):
    """Game platform model (PS5, PS4, PS3, Xbox, Nintendo Switch)"""
    __tablename__ = 'platforms'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    games = db.relationship('Game', backref='platform', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'game_count': len(self.games)
        }


class Game(db.Model):
    """Game model with support for multiple platforms"""
    __tablename__ = 'games'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False, index=True)
    chinese_title = db.Column(db.String(200))  # New field
    category = db.Column(db.String(50))  # New field: Game or Movie
    platform_id = db.Column(db.Integer, db.ForeignKey('platforms.id'), nullable=False)
    genre = db.Column(db.String(100))
    release_year = db.Column(db.Integer)
    developer = db.Column(db.String(200))
    publisher = db.Column(db.String(200))
    rating = db.Column(db.String(10))  # E, T, M, etc.
    max_players = db.Column(db.Integer)
    online_multiplayer = db.Column(db.Boolean, default=False)
    description = db.Column(db.Text)
    cover_image = db.Column(db.String(500))
    total_copies = db.Column(db.Integer, default=1)
    available_copies = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    rentals = db.relationship('Rental', backref='game', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'chinese_title': self.chinese_title,
            'category': self.category,
            'platform': self.platform.name if self.platform else None,
            'platform_id': self.platform_id,
            'genre': self.genre,
            'release_year': self.release_year,
            'developer': self.developer,
            'publisher': self.publisher,
            'rating': self.rating,
            'max_players': self.max_players,
            'online_multiplayer': self.online_multiplayer,
            'description': self.description,
            'cover_image': self.cover_image,
            'total_copies': self.total_copies,
            'available_copies': self.available_copies,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Rental(db.Model):
    """Game rental model"""
    __tablename__ = 'rentals'

    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('games.id'), nullable=False)
    user_name = db.Column(db.String(100), nullable=False)
    user_email = db.Column(db.String(150), nullable=False)
    rental_date = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.DateTime, nullable=False)
    return_date = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='active')  # active, returned, overdue
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'game': self.game.to_dict() if self.game else None,
            'user_name': self.user_name,
            'user_email': self.user_email,
            'rental_date': self.rental_date.isoformat() if self.rental_date else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'return_date': self.return_date.isoformat() if self.return_date else None,
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class GamingAreaBooking(db.Model):
    """Gaming area booking model"""
    __tablename__ = 'gaming_area_bookings'

    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(100), nullable=False)
    user_email = db.Column(db.String(150), nullable=False)
    student_id = db.Column(db.String(50)) # New field
    booking_date = db.Column(db.Date, nullable=False, index=True)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    game_id = db.Column(db.Integer, db.ForeignKey('games.id'), nullable=False)
    number_of_players = db.Column(db.Integer, default=1)
    special_requests = db.Column(db.Text)
    status = db.Column(db.String(20), default='confirmed')  # confirmed, cancelled, completed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    game = db.relationship('Game', backref='gaming_bookings')

    def to_dict(self):
        return {
            'id': self.id,
            'user_name': self.user_name,
            'user_email': self.user_email,
            'student_id': self.student_id,
            'booking_date': self.booking_date.isoformat() if self.booking_date else None,
            'start_time': self.start_time.strftime('%H:%M') if self.start_time else None,
            'end_time': self.end_time.strftime('%H:%M') if self.end_time else None,
            'game': self.game.to_dict() if self.game else None,
            'number_of_players': self.number_of_players,
            'special_requests': self.special_requests,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


# ==================== ADMIN API ENDPOINTS ====================

@app.route('/api/admin/platforms', methods=['GET', 'POST'])
def manage_platforms():
    """Get all platforms or create a new one"""
    if request.method == 'POST':
        data = request.get_json()
        platform = Platform(
            name=data.get('name'),
            description=data.get('description')
        )
        db.session.add(platform)
        db.session.commit()
        return jsonify(platform.to_dict()), 201

    platforms = Platform.query.all()
    return jsonify([p.to_dict() for p in platforms])


@app.route('/api/admin/platforms/<int:platform_id>', methods=['PUT', 'DELETE'])
def manage_platform(platform_id):
    """Update or delete a platform"""
    platform = Platform.query.get_or_404(platform_id)

    if request.method == 'PUT':
        data = request.get_json()
        platform.name = data.get('name', platform.name)
        platform.description = data.get('description', platform.description)
        db.session.commit()
        return jsonify(platform.to_dict())

    db.session.delete(platform)
    db.session.commit()
    return '', 204


@app.route('/api/admin/games', methods=['GET', 'POST'])
def manage_games():
    """Get all games or create a new one"""
    if request.method == 'POST':
        data = request.get_json()

        # Validate platform exists
        platform = Platform.query.get(data.get('platform_id'))
        if not platform:
            return jsonify({'error': 'Invalid platform'}), 400

        game = Game(
            title=data.get('title'),
            chinese_title=data.get('chinese_title'),
            category=data.get('category'),
            platform_id=data.get('platform_id'),
            genre=data.get('genre'),
            release_year=data.get('release_year'),
            developer=data.get('developer'),
            publisher=data.get('publisher'),
            rating=data.get('rating'),
            max_players=data.get('max_players'),
            online_multiplayer=data.get('online_multiplayer', False),
            description=data.get('description'),
            cover_image=data.get('cover_image'),
            total_copies=data.get('total_copies', 1),
            available_copies=data.get('total_copies', 1)
        )
        db.session.add(game)
        db.session.commit()
        return jsonify(game.to_dict()), 201

    # Get filters from query params
    platform_id = request.args.get('platform_id')
    genre = request.args.get('genre')
    search = request.args.get('search')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 50))

    query = Game.query

    if platform_id:
        query = query.filter_by(platform_id=platform_id)
    if genre:
        query = query.filter(Game.genre.ilike(f'%{genre}%'))
    if search:
        # Search by Title OR Chinese Title
        query = query.filter(db.or_(
            Game.title.ilike(f'%{search}%'),
            Game.chinese_title.ilike(f'%{search}%')
        ))

    pagination = query.order_by(Game.title).paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        'games': [game.to_dict() for game in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })


@app.route('/api/admin/games/<int:game_id>', methods=['GET', 'PUT', 'DELETE'])
def manage_game(game_id):
    """Get, update, or delete a specific game"""
    game = Game.query.get_or_404(game_id)

    if request.method == 'PUT':
        data = request.get_json()
        game.title = data.get('title', game.title)
        game.chinese_title = data.get('chinese_title', game.chinese_title)
        game.category = data.get('category', game.category)
        game.platform_id = data.get('platform_id', game.platform_id)
        game.genre = data.get('genre', game.genre)
        game.release_year = data.get('release_year', game.release_year)
        game.developer = data.get('developer', game.developer)
        game.publisher = data.get('publisher', game.publisher)
        game.rating = data.get('rating', game.rating)
        game.max_players = data.get('max_players', game.max_players)
        game.online_multiplayer = data.get('online_multiplayer', game.online_multiplayer)
        game.description = data.get('description', game.description)
        game.cover_image = data.get('cover_image', game.cover_image)

        # Update copies
        old_total = game.total_copies
        new_total = data.get('total_copies', old_total)
        difference = new_total - old_total
        game.total_copies = new_total
        game.available_copies = max(0, game.available_copies + difference)

        db.session.commit()
        return jsonify(game.to_dict())

    if request.method == 'DELETE':
        db.session.delete(game)
        db.session.commit()
        return '', 204

    return jsonify(game.to_dict())


@app.route('/api/admin/rentals', methods=['GET'])
def get_all_rentals():
    """Get all rentals (admin view)"""
    status = request.args.get('status')
    active_only = request.args.get('active_only', 'false').lower() == 'true'

    query = Rental.query

    if status:
        query = query.filter_by(status=status)
    if active_only:
        query = query.filter(Rental.status.in_(['active', 'overdue']))

    rentals = query.order_by(Rental.rental_date.desc()).all()
    return jsonify([rental.to_dict() for rental in rentals])


@app.route('/api/admin/rentals/<int:rental_id>/return', methods=['POST'])
def return_game(rental_id):
    """Mark a game as returned"""
    rental = Rental.query.get_or_404(rental_id)

    if rental.status == 'returned':
        return jsonify({'error': 'Game already returned'}), 400

    rental.return_date = datetime.utcnow()
    rental.status = 'returned'

    # Increase available copies
    if rental.game:
        rental.game.available_copies += 1

    db.session.commit()
    return jsonify(rental.to_dict())


@app.route('/api/admin/bookings', methods=['GET'])
def get_all_bookings():
    """Get all bookings (admin view)"""
    status = request.args.get('status')
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')
    student_id = request.args.get('student_id') # New filter

    query = GamingAreaBooking.query

    if status:
        query = query.filter_by(status=status)
    if date_from:
        query = query.filter(GamingAreaBooking.booking_date >= datetime.strptime(date_from, '%Y-%m-%d').date())
    if date_to:
        query = query.filter(GamingAreaBooking.booking_date <= datetime.strptime(date_to, '%Y-%m-%d').date())
    if student_id:
        query = query.filter_by(student_id=student_id) # Filter by student_id

    bookings = query.order_by(GamingAreaBooking.booking_date, GamingAreaBooking.start_time).all()
    return jsonify([booking.to_dict() for booking in bookings])


# ==================== USER API ENDPOINTS ====================

@app.route('/api/games/search', methods=['GET'])
def search_games():
    """Search games with filters"""
    query_param = request.args.get('q', '') 
    if not query_param:
        query_param = request.args.get('search', '')
        
    platform_id = request.args.get('platform_id')
    
    # Handle multi-select filters (comma separated)
    genre_filters = request.args.get('genres', '')
    style_filters = request.args.get('styles', '')
    decade_filters = request.args.get('decades', '')
    
    available_only = request.args.get('available_only', 'false').lower() == 'true'
    
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))

    query = Game.query

    # Text Search
    if query_param:
        query = query.filter(db.or_(
            Game.title.ilike(f'%{query_param}%'),
            Game.chinese_title.ilike(f'%{query_param}%')
        ))

    # Platform Filter
    if platform_id:
        query = query.filter_by(platform_id=platform_id)
        
    # Genre/Game Type Filter (AND logic: game must match ALL selected genres? Or ANY? 
    # Usually strictly refining -> AND. But simple tag cloud often implies OR.
    # The user asked for "screening" (filtering). Multi-tag usually means narrowing down.
    # Let's use AND logic for multi-genre to be precise.)
    if genre_filters:
        genres = genre_filters.split(',')
        for g in genres:
            if g:
                query = query.filter(Game.genre.ilike(f'%{g}%'))

    # Decade Filter (Range check)
    if decade_filters:
        # If multiple decades selected, it's OR logic (e.g. 2010s OR 2020s)
        decades = decade_filters.split(',')
        decade_conditions = []
        for d in decades:
            if d.endswith('s'):
                try:
                    start_year = int(d[:-1])
                    end_year = start_year + 9
                    decade_conditions.append(db.and_(Game.release_year >= start_year, Game.release_year <= end_year))
                except ValueError:
                    pass
        if decade_conditions:
            query = query.filter(db.or_(*decade_conditions))

    # Style Filter
    if style_filters:
        styles = style_filters.split(',')
        for s in styles:
            if s == 'Single Player':
                query = query.filter(Game.max_players == 1)
            elif s == 'Multiplayer':
                query = query.filter(Game.max_players > 1)
            elif s == 'Online Multiplayer':
                query = query.filter(Game.online_multiplayer == True)
            elif s in ['Game', 'Movie']:
                query = query.filter(Game.category == s)

    if available_only:
        query = query.filter(Game.available_copies > 0)

    pagination = query.order_by(Game.title).paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        'games': [game.to_dict() for game in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })


@app.route('/api/games/<int:game_id>', methods=['GET'])
def get_game(game_id):
    """Get a specific game"""
    game = Game.query.get_or_404(game_id)
    return jsonify(game.to_dict())


@app.route('/api/games/browsing-metadata', methods=['GET'])
def get_browsing_metadata():
    """Get all metadata for browsing filters: Decades, Genres, Styles"""
    
    # 1. Genres (Game Type)
    # Query all distinct genres combined
    all_games = db.session.query(Game.genre).all()
    genre_counts = {}

    for g in all_games:
        if g[0]:
            text = g[0]
            # Normalize separators
            text = text.replace(',', ' ').replace('/', ' ')
            
            # Protected compounds: Temporarily replace specific compounds to avoid splitting
            # Use regex to catch "Sci-Fi", "Sci Fi", "Third-Person", etc.
            
            # Sci-Fi
            text = re.sub(r'\bsci[- ]?fi\b', 'SCI_FI_TEMP', text, flags=re.IGNORECASE)
            # Third-Person
            text = re.sub(r'\bthird[- ]?person\b', 'THIRD_PERSON_TEMP', text, flags=re.IGNORECASE)
            # First-Person
            text = re.sub(r'\bfirst[- ]?person\b', 'FIRST_PERSON_TEMP', text, flags=re.IGNORECASE)
            # Open-World
            text = re.sub(r'\bopen[- ]?world\b', 'OPEN_WORLD_TEMP', text, flags=re.IGNORECASE)
            # Turn-Based
            text = re.sub(r'\bturn[- ]?based\b', 'TURN_BASED_TEMP', text, flags=re.IGNORECASE)
            # Co-Op
            text = re.sub(r'\bco[- ]?op\b', 'CO_OP_TEMP', text, flags=re.IGNORECASE)

            # Now safe to split remaining dashes (like Action-Adventure -> Action Adventure)
            text = text.replace('-', ' ')
            
            words = text.split()
            for word in words:
                word = word.strip()
                
                # Restore protected terms
                if word == 'SCI_FI_TEMP':
                    word = 'Sci-Fi'
                elif word == 'THIRD_PERSON_TEMP':
                    word = 'Third-Person'
                elif word == 'FIRST_PERSON_TEMP':
                    word = 'First-Person'
                elif word == 'OPEN_WORLD_TEMP':
                    word = 'Open-World'
                elif word == 'TURN_BASED_TEMP':
                    word = 'Turn-Based'
                elif word == 'CO_OP_TEMP':
                    word = 'Co-Op'
                
                # Basic cleanup - blacklist explicit tags we don't want as Game Types
                # (Platform names should not be game types, 'Art' is vague)
                blacklist = ['Ps3', 'Nintendo', 'Sega', 'Xbox', 'Playstation', 'Wii', 'Art', 'And', '&']
                
                if len(word) > 1 and word not in blacklist and word.capitalize() not in blacklist and word.lower() not in [b.lower() for b in blacklist]:
                     # Capitalize properly if it's not a compound with specific casing requirements
                    if '_' not in word and '-' not in word: # Simple words
                        word = word.title()
                    
                    genre_counts[word] = genre_counts.get(word, 0) + 1
    
    # Filter genres with fewer than 5 assets
    unique_genres = [g for g, count in genre_counts.items() if count >= 5]
    
    # 2. Decades
    # Query min and max years
    years = db.session.query(db.func.min(Game.release_year), db.func.max(Game.release_year)).first()
    min_year = years[0] or 2000
    max_year = years[1] or datetime.now().year
    
    decades = []
    # Round down min_year to nearest decade
    start_decade = (min_year // 10) * 10
    end_decade = (max_year // 10) * 10
    
    for d in range(end_decade, start_decade - 10, -10):
        decades.append(f"{d}s")
        
    # 3. Styles (Mapped from Features/Category/Platform for now as we lack specific 'style' field)
    styles = ['Single Player', 'Multiplayer', 'Online Multiplayer']
    
    # Add Categories if mixed
    categories = db.session.query(Game.category).distinct().all()
    for c in categories:
        if c[0]:
            styles.append(c[0]) # e.g. "Game", "Movie"

    return jsonify({
        'decades': decades,
        'game_types': sorted(unique_genres),
        'styles': sorted(list(set(styles)))
    })


@app.route('/api/rentals', methods=['POST'])
def create_rental():
    """Rent a game"""
    data = request.get_json()

    game = Game.query.get_or_404(data.get('game_id'))

    if game.available_copies <= 0:
        return jsonify({'error': 'No copies available'}), 400

    # Calculate due date
    rental_duration = data.get('rental_duration_days', DEFAULT_RENTAL_DURATION_DAYS)
    due_date = datetime.utcnow() + timedelta(days=rental_duration)

    rental = Rental(
        game_id=game.id,
        user_name=data.get('user_name'),
        user_email=data.get('user_email'),
        due_date=due_date,
        notes=data.get('notes')
    )

    game.available_copies -= 1

    db.session.add(rental)
    db.session.commit()

    return jsonify(rental.to_dict()), 201


@app.route('/api/rentals/<int:rental_id>', methods=['GET'])
def get_rental(rental_id):
    """Get rental details"""
    rental = Rental.query.get_or_404(rental_id)
    return jsonify(rental.to_dict())


@app.route('/api/gaming-area/availability', methods=['GET'])
def check_availability():
    """Check gaming area availability for a specific date"""
    date_str = request.args.get('date')
    if not date_str:
        return jsonify({'error': 'Date required'}), 400

    try:
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400

    bookings = GamingAreaBooking.query.filter_by(
        booking_date=date,
        status='confirmed'
    ).all()

    booked_slots = []
    for booking in bookings:
        booked_slots.append({
            'start': booking.start_time.strftime('%H:%M'),
            'end': booking.end_time.strftime('%H:%M')
        })

    # Generate available time slots
    available_slots = []
    current_hour = GAMING_AREA_OPEN_HOUR

    while current_hour < GAMING_AREA_CLOSE_HOUR:
        slot_start = f"{current_hour:02d}:00"
        slot_end = f"{min(current_hour + 1, GAMING_AREA_CLOSE_HOUR):02d}:00"

        # Check if this slot is booked
        is_booked = any(
            slot['start'] == slot_start or
            (slot['start'] < slot_start and slot['end'] > slot_start)
            for slot in booked_slots
        )

        if not is_booked:
            available_slots.append({
                'start': slot_start,
                'end': slot_end
            })

        current_hour += 1

    return jsonify({
        'date': date_str,
        'open_hour': f'{GAMING_AREA_OPEN_HOUR}:00',
        'close_hour': f'{GAMING_AREA_CLOSE_HOUR}:00',
        'booked_slots': booked_slots,
        'available_slots': available_slots
    })


@app.route('/api/gaming-area/bookings', methods=['POST'])
def create_booking():
    """Create a new booking"""
    data = request.get_json()

    # Validate date and time
    try:
        booking_date = datetime.strptime(data.get('booking_date'), '%Y-%m-%d').date()
        start_time = datetime.strptime(data.get('start_time'), '%H:%M').time()
        end_time = datetime.strptime(data.get('end_time'), '%H:%M').time()
    except ValueError:
        return jsonify({'error': 'Invalid date or time format'}), 400

    # Rule: Weekly booking window
    # System releases next week's slots on Monday.
    # Current implementation interprets: "System releases availability for the coming week every Monday".
    # Assuming "future week" means current week (Mon-Sun) is always open, and maybe limits beyond that?
    # User Requirement: "System weekly on Monday releases future week's availability"
    # Let's interpret: On any given day, users can book for dates within the current "released window".
    # If today is Monday, maybe next week is open? Or is it just "bookings for this week open on Monday"?
    # "Every Monday release future week" usually means:
    # On Mon Jan 1st, slots for Jan 8th-14th become available? Or Jan 1st-7th?
    # Let's assume standard practice: On Monday, the schedule for the NEXT week (Mon-Sun) opens up.
    # But usually current week is also open.
    # Let's stick to a simpler interpretation first:
    # Users can only book dates that are "open".
    # Let's implement the logic: Booking date must be <= Next Sunday (if today < Monday) or something.
    
    # Revised Interpretation from prompt: "System weekly on Monday releases future week's available time"
    # This implies a rolling window or a specific drop time.
    # Let's calculate the max allowed date based on "Current Date".
    today = datetime.now().date()
    current_weekday = today.weekday() # Mon=0, Sun=6
    
    # Calculate the start of the current week (Monday)
    start_of_current_week = today - timedelta(days=current_weekday)
    
    # Calculate the end of the current week (Sunday)
    end_of_current_week = start_of_current_week + timedelta(days=6)
    
    # Calculate the end of the NEXT week
    end_of_next_week = end_of_current_week + timedelta(days=7)

    # Logic: 
    # If today is Monday (0) or later, is the "next week" released? 
    # Prompt: "Monday releases future week".
    # It implies: 
    # - At all times, current week is bookable.
    # - On Monday, the *next* week becomes bookable.
    # So valid range is: [Today, End of Next Week] 
    # (Since on Monday, next week is released. On Tuesday, next week is still released).
    
    # Wait, if "Monday releases future week", does it mean BEFORE Monday, next week was NOT released?
    # Yes. So on Sunday, I can only book up to this Sunday. On Monday, I can book up to next Sunday.
    
    max_allowed_date = end_of_next_week

    if booking_date > max_allowed_date:
        return jsonify({'error': 'Bookings for this date are not yet open. Schedule is released on Mondays.'}), 400

    if booking_date < today:
        return jsonify({'error': 'Cannot book in the past'}), 400
        

    # Validate game availability
    game = Game.query.get(data.get('game_id'))
    if not game:
        return jsonify({'error': 'Invalid game selected'}), 400

    # Check for conflicts
    conflicts = GamingAreaBooking.query.filter(
        GamingAreaBooking.booking_date == booking_date,
        GamingAreaBooking.status == 'confirmed',
        db.or_(
            db.and_(GamingAreaBooking.start_time <= start_time, GamingAreaBooking.end_time > start_time),
            db.and_(GamingAreaBooking.start_time < end_time, GamingAreaBooking.end_time >= end_time)
        )
    ).all()

    # Simple capacity check (e.g., max 5 concurrent bookings)
    # In a real app, you might have specific stations/consoles
    if len(conflicts) >= 5:
        return jsonify({'error': 'No slots available for this time'}), 400
        
        
    # Rule: Max 4 hours per Calendar Week (Mon-Sun)
    # 1. Identify the calendar week of the requested booking
    booking_weekday = booking_date.weekday()
    booking_week_start = booking_date - timedelta(days=booking_weekday)
    booking_week_end = booking_week_start + timedelta(days=6)
    
    # 2. Find all existing bookings for this user in that specific week
    user_email = data.get('user_email')
    student_id = data.get('student_id')
    
    # Build query to check existing bookings in that week
    weekly_bookings = GamingAreaBooking.query.filter(
        (GamingAreaBooking.user_email == user_email) | (GamingAreaBooking.student_id == student_id),
        GamingAreaBooking.status == 'confirmed',
        GamingAreaBooking.booking_date >= booking_week_start,
        GamingAreaBooking.booking_date <= booking_week_end
    ).all()
    
    # 3. Calculate total hours already booked
    total_minutes = 0
    for b in weekly_bookings:
        # Calculate duration in minutes
        start_dt = datetime.combine(datetime.min, b.start_time)
        end_dt = datetime.combine(datetime.min, b.end_time)
        diff = end_dt - start_dt
        total_minutes += diff.total_seconds() / 60
        
    # 4. Add the duration of the new requested booking
    req_start_dt = datetime.combine(datetime.min, start_time)
    req_end_dt = datetime.combine(datetime.min, end_time)
    req_diff = req_end_dt - req_start_dt
    new_minutes = req_diff.total_seconds() / 60
    
    total_hours = (total_minutes + new_minutes) / 60
    
    if total_hours > MAX_BOOKING_HOURS_PER_WEEK:
        return jsonify({'error': f'Weekly limit exceeded. You can only book max {MAX_BOOKING_HOURS_PER_WEEK} hours per calendar week (Mon-Sun).'}), 400


    booking = GamingAreaBooking(
        user_name=data.get('user_name'),
        user_email=data.get('user_email'),
        student_id=data.get('student_id'), # New field
        booking_date=booking_date,
        start_time=start_time,
        end_time=end_time,
        game_id=game.id,
        number_of_players=data.get('number_of_players', 1),
        special_requests=data.get('special_requests')
    )

    db.session.add(booking)
    db.session.commit()

    return jsonify(booking.to_dict()), 201


@app.route('/api/gaming-area/bookings/<int:booking_id>', methods=['GET', 'DELETE'])
def manage_user_booking(booking_id):
    """Get or cancel a booking"""
    booking = GamingAreaBooking.query.get_or_404(booking_id)

    if request.method == 'DELETE':
        if booking.status == 'cancelled':
            return jsonify({'error': 'Booking already cancelled'}), 400

        booking.status = 'cancelled'
        db.session.commit()
        return jsonify(booking.to_dict())

    return jsonify(booking.to_dict())


@app.route('/api/config', methods=['GET'])
def get_config():
    """Get system configuration"""
    return jsonify({
        'max_booking_hours_per_week': MAX_BOOKING_HOURS_PER_WEEK,
        'gaming_area_open_hour': GAMING_AREA_OPEN_HOUR,
        'gaming_area_close_hour': GAMING_AREA_CLOSE_HOUR,
        'default_rental_duration_days': DEFAULT_RENTAL_DURATION_DAYS
    })


# ==================== HEALTH CHECK ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat()
    })


# ==================== INITIALIZATION ====================

def init_db():
    """Initialize the database with default platforms"""
    with app.app_context():
        db.create_all()

        # Check if platforms already exist
        if Platform.query.count() == 0:
            platforms = [
                {'name': 'PS5', 'description': 'PlayStation 5 games'},
                {'name': 'PS4', 'description': 'PlayStation 4 games'},
                {'name': 'PS3', 'description': 'PlayStation 3 games'},
                {'name': 'Xbox', 'description': 'Xbox games'},
                {'name': 'Nintendo Switch', 'description': 'Nintendo Switch games'}
            ]

            for platform_data in platforms:
                platform = Platform(**platform_data)
                db.session.add(platform)

            db.session.commit()
            print("✅ Default platforms created successfully")


if __name__ == '__main__':
    init_db()
    # Get port from environment variable for Zeabur deployment
    port = int(os.environ.get('PORT', 8000))
    app.run(debug=os.environ.get('FLASK_DEBUG', 'False') == 'True', host='0.0.0.0', port=port)
