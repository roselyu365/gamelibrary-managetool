# Gaming Area System

## Quick Start

### Option 1: Automated Setup (Mac/Linux)

```bash
cd gaming-area
./start.sh
```

This will automatically:
1. Check prerequisites
2. Create virtual environment
3. Install dependencies
4. Initialize database
5. Start both backend and frontend servers

### Option 2: Manual Setup

**Terminal 1 - Backend:**
```bash
cd gaming-area
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd gaming-area/frontend
npm install
npm run dev
```

## Access Points

- **User Interface**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **API**: http://localhost:5000/api

## Default Configuration

- **Booking Limits**: 4 hours per day, 7 days in advance
- **Gaming Area Hours**: 10 AM - 10 PM
- **Default Rental**: 7 days

## First Steps

1. **Add Games**: Go to Admin Dashboard → Manage Games → Add New Game
2. **Search**: Use the main page to search through your game library
3. **Rent Games**: Students can rent games from the Rentals tab
4. **Book Gaming Area**: Use the Booking tab to reserve time slots

## Stopping the System

Press `Ctrl+C` in both terminal windows (or just the one if using start.sh)

## Documentation

See README.md for full documentation
