# 📁 Lume Finance - Project Structure

## Directory Overview

```
lume-finance/
├── backend/                 # Python FastAPI backend
│   ├── main.py             # API entry point
│   ├── models.py           # Pydantic models
│   ├── database.py         # Database connection & ORM
│   ├── routes/             # API endpoints
│   │   ├── transactions.py
│   │   ├── accounts.py
│   │   ├── budgets.py
│   │   ├── breakdown.py    # Cost breakdown engine
│   │   └── analytics.py
│   ├── services/           # Business logic
│   │   ├── cost_calculator.py
│   │   ├── investment_simulator.py
│   │   └── budget_analyzer.py
│   └── tests/              # Backend tests
│
├── frontend/               # React + TypeScript frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API calls
│   │   ├── utils/          # Helper functions
│   │   └── styles/         # CSS/styling
│   ├── public/
│   └── package.json
│
├── database/               # Database migrations & seeds
│   ├── migrations/
│   └── schema.sql
│
├── docs/                   # Documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── USER_GUIDE.md
│
├── electron/               # Electron desktop wrapper (future)
│   └── main.js
│
├── scripts/                # Utility scripts
│   ├── setup.sh
│   └── deploy.sh
│
├── .gitignore
├── README.md
└── requirements.txt        # Python dependencies
```

## Component Responsibilities

### Backend (`/backend`)
- RESTful API with FastAPI
- Data validation with Pydantic
- SQLite database (SQLAlchemy ORM)
- Cost breakdown calculation engine
- Investment simulation algorithms

### Frontend (`/frontend`)
- React 18 with TypeScript
- Chart.js + Recharts for visualizations
- React Query for data fetching
- Responsive design (mobile-first)

### Database (`/database`)
- Schema definitions
- Migration scripts (Alembic)
- Seed data for testing

## Development Workflow

1. **Backend Development**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r ../requirements.txt
   uvicorn main:app --reload
   ```

2. **Frontend Development**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Full Stack**
   - Backend runs on `http://localhost:8000`
   - Frontend runs on `http://localhost:3000`
   - API docs available at `http://localhost:8000/docs`

## Next Steps

1. Complete database schema design
2. Implement core API endpoints
3. Build frontend dashboard
4. Develop cost breakdown algorithms
5. Create visualization components