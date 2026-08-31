# SHRNK

A fast, lightweight, and modern URL shortener and link analytics platform built with **FastAPI** (Python) and **React** (Vite). SHRNK converts long URLs into compact, customizable aliases, records click analytics in real time, and provides an authenticated management dashboard styled in a controlled **Neubrutalist developer-tool aesthetic**.

---

## Overview

SHRNK provides an end-to-end self-hosted link management platform designed for high performance, clean API contracts, and zero database domain lock-in.

### Core Highlights
* **Dynamic Base URL Resolution**: The database only stores short codes and destination URLs. Public links are assembled at runtime via server configuration, allowing effortless domain migrations without database rewrites.
* **Smart Custom Aliases**: Full support for custom slugs with case-insensitive uniqueness, format verification, reserved system keyword protection, and profanity filtering.
* **Controlled Alias Lifecycle**: `EXPIRED != DELETED`. Expired links remain visible in the dashboard with preserved historical analytics and retain their alias reservation until explicitly deleted by their owner.
* **Privacy-Friendly Analytics**: Tracks click timestamps, referrers, and device categories (Desktop vs. Mobile) via standard HTTP headers without intrusive tracking scripts.
* **JWT-Based Authentication**: Secure account registration and session management powered by 12-round bcrypt password hashing and signed JSON Web Tokens.
* **Controlled Neubrutalism UI**: Distinctive developer-tool visual style featuring thick borders, hard offset black shadows, warm off-white canvas, acid-lime accents, and monospace data typography.

---

## Tech Stack

### Backend
* **Language & Framework**: Python 3.10+ & [FastAPI](https://fastapi.tiangolo.com/) (Asynchronous ASGI framework)
* **Server**: [Uvicorn](https://www.uvicorn.org/)
* **Database & ORM**: SQLite with [SQLAlchemy 2.0](https://www.sqlalchemy.org/) (Foreign key enforcement enabled via SQLite PRAGMA)
* **Data Validation**: [Pydantic v2](https://docs.pydantic.dev/)
* **Security & Cryptography**: [bcrypt](https://pypi.org/project/bcrypt/) (Password hashing) & [PyJWT](https://pyjwt.readthedocs.io/) (JWT tokens)

### Frontend
* **Core**: [React 19](https://react.dev/) & [Vite](https://vitejs.dev/)
* **Styling**: Pure Vanilla CSS (Design tokens, CSS variables, Neubrutalist component architecture)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Effects**: `canvas-confetti`
* **Linter**: [oxlint](https://oxc.rs/)

---

## Project Structure

```text
Shrnk/
├── backend/
│   ├── models/                  # SQLAlchemy ORM database models
│   │   ├── __init__.py
│   │   ├── user.py              # User model (accounts & credentials)
│   │   ├── url.py               # URL model (links, expiration, status)
│   │   └── click.py             # Click model (redirection access events)
│   ├── routes/                  # FastAPI router endpoints
│   │   ├── auth.py              # Register, login, me, profile, password change
│   │   ├── urls.py              # URL CRUD, filtering, search, link analytics
│   │   └── dashboard.py         # Aggregated stats, timeline overview
│   ├── alias_rules.py           # Reserved paths, format rules & profanity filter
│   ├── config.py                # Environment and application configuration
│   ├── database.py              # SQLite engine, session factory & table init
│   ├── main.py                  # Application entry point, CORS & public redirect
│   ├── schemas.py               # Pydantic request and response schemas
│   ├── security.py              # Password hashing, JWT creation & auth dependencies
│   ├── seed.py                  # Idempotent development demo seeder
│   ├── test_auth_and_dashboard.py # Integration test suite (14 test phases)
│   ├── test_db.py               # Database CRUD, indexes & cascade deletion tests
│   └── utils.py                 # URL normalizer, Base62 generator, status calculator
├── frontend/
│   ├── public/                  # Static assets (favicons, SVG definitions)
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── dashboard/       # Authenticated dashboard views
│   │   │   │   ├── AnalyticsView.jsx
│   │   │   │   ├── CreateUrlModal.jsx
│   │   │   │   ├── DashboardLayout.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   ├── LinkAnalyticsModal.jsx
│   │   │   │   ├── LinksView.jsx
│   │   │   │   ├── OverviewView.jsx
│   │   │   │   ├── SettingsView.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── StatCard.jsx
│   │   │   │   └── Topbar.jsx
│   │   │   ├── AuthModal.jsx    # Login, signup & password reset modal
│   │   │   ├── Footer.jsx       # 3-column creator & navigation footer
│   │   │   ├── LegalModal.jsx   # Terms of Service & Privacy Policy viewer
│   │   │   ├── Navbar.jsx       # Landing page navigation bar
│   │   │   └── Hero.jsx         # Landing page hero shortener widget
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # React authentication context & token manager
│   │   ├── services/
│   │   │   └── api.js           # Centralized Fetch client with JWT interceptor
│   │   ├── App.css              # Main design system & landing page styling
│   │   ├── App.jsx              # Client router & state orchestration
│   │   ├── config.js            # Frontend URL helpers & domain parsing
│   │   └── index.css            # Global CSS reset & typography rules
│   ├── package.json
│   └── vite.config.js
├── .env.example                 # Environment configuration template
├── LICENSE                      # MIT License
├── README.md                    # Project documentation
└── requirements.txt             # Backend Python dependencies
```

---

## How It Works

### 1. URL Creation & Validation
1. User provides a destination URL (e.g., `https://developer.mozilla.org`) with an optional custom alias and optional expiration date.
2. The backend normalizes the URL (ensures `http://` or `https://` protocol; rejects unsafe schemes like `javascript:`).
3. If an alias is provided:
   - Verifies character format (`^[a-zA-Z0-9_-]+$`).
   - Verifies length (3 to 64 characters).
   - Validates against reserved system keywords (`login`, `api`, `dashboard`, `terms`, etc.).
   - Checks against the profanity and blocked word list.
   - Confirms case-insensitive global availability across non-deleted links.
4. If no alias is provided, a random 6-character Base62 short code is generated (`secrets.choice`).
5. A new record is stored in the `urls` table with `short_code` and `original_url`.

### 2. Public Redirection (`GET /{short_code}`)
1. Visitor requests `http://localhost:8000/{short_code}` (or configured domain).
2. The server queries the database case-insensitively (`func.lower(URL.short_code) == short_code.lower()`).
3. If the link is **ACTIVE** and has not passed its `expires_at` timestamp:
   - Increments `click_count` atomically.
   - Logs a `Click` record with timestamp, client IP, User-Agent, and HTTP Referrer.
   - Responds with `HTTP 307 Temporary Redirect` to the destination URL.
4. If the link has reached its expiration time, the server returns `HTTP 410 Gone` (*"THIS LINK HAS EXPIRED"*).
5. If the link was deactivated by its owner, the server returns `HTTP 410 Gone` (*"This shortened link has been deactivated by its owner"*).
6. If the code does not exist, the server returns `HTTP 404 Not Found`.

---

## Database Architecture

SHRNK uses an SQLite database (`shrnk.db`) configured with foreign key cascades and case-insensitive indexes.

```text
┌──────────────────────────┐       ┌──────────────────────────────┐
│          users           │       │             urls             │
├──────────────────────────┤       ├──────────────────────────────┤
│ id (PK)                  │1     *│ id (PK)                      │
│ name                     ├───────┤ user_id (FK -> users.id)     │
│ email (UQ, IDX)          │       │ short_code (UQ, NOCASE IDX)  │
│ password_hash            │       │ original_url                 │
│ created_at               │       │ created_at (IDX)             │
│ updated_at               │       │ expires_at                   │
└──────────────────────────┘       │ is_active                    │
                                   │ click_count (CHECK >= 0)     │
                                   └──────────────┬───────────────┘
                                                  │1
                                                  │
                                                  │*
                                   ┌──────────────┴───────────────┐
                                   │            clicks            │
                                   ├──────────────────────────────┤
                                   │ id (PK)                      │
                                   │ url_id (FK -> urls.id)       │
                                   │ clicked_at (IDX)             │
                                   │ ip_address                   │
                                   │ user_agent                   │
                                   │ referrer                     │
                                   └──────────────────────────────┘
```

---

## Authentication & OAuth Status

* **Email & Password Authentication**: Fully implemented with secure 12-round bcrypt hashing, JWT issuance on `/api/auth/register` and `/api/auth/login`, and client token persistence in `localStorage`.
* **OAuth Status (Google & GitHub)**: The UI displays "Continue with Google" and "Continue with GitHub" buttons. In the current implementation, third-party OAuth providers are not configured. Clicking these buttons displays an in-app notice (`"Google/GitHub login is temporarily unavailable. Please use email & password."`) without generating fake sessions or mock accounts.

---

## Getting Started

### Prerequisites
* **Python 3.10+**
* **Node.js 18+** and **npm**

---

### 1. Backend Setup

1. **Navigate to project root and create a virtual environment**:
   ```bash
   python -m venv .venv
   ```

2. **Activate the virtual environment**:
   * Windows (PowerShell):
     ```powershell
     .\.venv\Scripts\Activate.ps1
     ```
   * Windows (CMD):
     ```cmd
     .\.venv\Scripts\activate.bat
     ```
   * Linux / macOS:
     ```bash
     source .venv/bin/activate
     ```

3. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

5. **Start the FastAPI backend server**:
   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```
   The backend API will run at `http://localhost:8000`. Interactive OpenAPI documentation will be available at `http://localhost:8000/docs`.

---

### 2. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Start the Vite development server**:
   ```bash
   npm run dev
   ```
   The frontend application will run at `http://localhost:5173`.

---

## Environment Variables

Configure the following variables in your `.env` file located in the root directory:

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `BASE_URL` | String | `http://localhost:8000` | Canonical application base URL used to construct short links dynamically at runtime. |
| `DATABASE_URL` | String | `sqlite:///./shrnk.db` | SQLAlchemy database connection string. |
| `SECRET_KEY` | String | `your-secret-key` | Secret key used to sign JWT access tokens. |
| `ALGORITHM` | String | `HS256` | JWT signing algorithm. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Integer | `1440` | Token expiration lifetime in minutes (default: 24 hours). |
| `VITE_API_BASE_URL` | String | `http://localhost:8000` | Backend API URL accessed by the React frontend. |
| `VITE_BASE_URL` | String | `http://localhost:8000` | Base URL used by the frontend for display and clipboard copy. |

---

## API Reference

### Authentication (`/api/auth`)
* `POST /api/auth/register` - Create a new user account with `name`, `email`, and `password`. Returns JWT token and user info.
* `POST /api/auth/login` - Authenticate with `email` and `password`. Returns JWT token and user info.
* `POST /api/auth/logout` - Invalidate session (client clears token).
* `GET /api/auth/me` - Fetch profile details for the authenticated user.
* `PUT /api/auth/profile` - Update profile name.
* `POST /api/auth/change-password` - Change password (requires current password verification).
* `DELETE /api/auth/account` - Permanently delete account and cascade-delete all owned URLs and clicks.

### URLs (`/api/urls`)
* `POST /api/urls` - Create a new shortened link (`original_url`, optional `custom_alias`, optional `expires_at`).
* `GET /api/urls?filter={all|active|expired|disabled}&search={term}` - List URLs belonging to the authenticated user with optional status filter and search query.
* `GET /api/urls/{id}` - Retrieve a specific URL by ID (enforces ownership).
* `DELETE /api/urls/{id}` - Delete a URL and its analytics, permanently releasing the alias.
* `GET /api/urls/{id}/analytics` - Fetch single-link analytics (click counts, 7-day timeline, top referrers, device breakdown).

### Dashboard & Analytics (`/api`)
* `GET /api/dashboard` - Get aggregated dashboard metrics (total links, total clicks, active links, clicks this week, recent links).
* `GET /api/analytics/overview?range={7d|30d|90d}` - Get aggregate click trends, daily timeline points, and top performing links.

### Redirection & Health
* `GET /{short_code}` - Public redirection endpoint (`HTTP 307` to destination or `HTTP 410` if expired).
* `GET /health` - Service health status endpoint.

---

## Development & Testing

### Running Tests

1. **Full Integration Test Suite**:
   Runs 14 integration test phases verifying authentication, IDOR security, alias restrictions, profanity filtering, case-insensitive collision prevention, and dynamic domain resolution:
   ```bash
   python -m backend.test_auth_and_dashboard
   ```

2. **Database Engine Test Suite**:
   Verifies table creation, SQLite foreign keys, case-insensitive uniqueness indexes, and cascade deletion:
   ```bash
   python -m backend.test_db
   ```

3. **Frontend Production Build**:
   ```bash
   cd frontend
   npm run build
   ```

4. **Frontend Code Linting**:
   ```bash
   cd frontend
   npm run lint
   ```

---

## Security Features

* **Bcrypt Password Storage**: Passwords are never stored in plaintext; salted with 12 rounds.
* **IDOR Prevention**: All URL modification, retrieval, and deletion queries explicitly scope by `user_id == current_user.id`.
* **SQL Injection & ORM Safety**: Parameterized queries enforced across all endpoints via SQLAlchemy ORM.
* **Unsafe URL Sanitization**: Enforces `http://` or `https://` protocol; strips and rejects malicious URI schemes (`javascript:`, `data:`).
* **Race-Condition Protection**: SQLite `ix_urls_short_code_nocase` unique index and database rollback handling eliminate race conditions during concurrent alias registration.

---

## License

This project is open-source and available under the terms of the [MIT License](LICENSE).

```text
Copyright (c) 2026 Raj Desai
```

---

## Author

**Raj Desai**
* GitHub: [@RajDesai87](https://github.com/RajDesai87)
* LinkedIn: [raj-desai132](https://www.linkedin.com/in/raj-desai132/)
* Email: [rajgpdesai2007@gmail.com](mailto:rajgpdesai2007@gmail.com)
