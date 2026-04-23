# 🌾 SmartSeason — Field Monitoring System

A full-stack web application for tracking crop progress across multiple fields during a growing season.

**Stack:** Laravel 11 · React 18 · MySQL · Laravel Sanctum · Tailwind CSS · Recharts

---

## Quick Start

### Prerequisites
- PHP 8.2+ with PDO MySQL extension
- Composer
- Node.js 18+
- MySQL 8+

### 1. Database
```bash
mysql -u root -p -e "CREATE DATABASE smartseason CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 2. Backend
```bash
cd backend
composer install
cp .env.example .env
# Edit .env — set DB_USERNAME, DB_PASSWORD
php artisan key:generate
php artisan migrate --seed
php artisan serve
# → http://localhost:8000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## Demo Credentials

| Role        | Email                     | Password     |
|-------------|---------------------------|--------------|
| Admin       | admin@smartseason.com     | Admin@1234   |
| Field Agent | james@smartseason.com     | Agent@1234   |
| Field Agent | grace@smartseason.com     | Agent@1234   |
| Field Agent | david@smartseason.com     | Agent@1234   |

The seed data includes **12 fields** deliberately covering every status scenario so you can see all states immediately after setup.

---

## Field Status Logic

Each field's status is **computed at runtime** (not stored) by `app/Models/Field.php → getStatusAttribute()`. This ensures status is always fresh and consistent with the latest data without needing background jobs.

### Status Levels (5 tiers)

| Status | Color | Logic |
|--------|-------|-------|
| **Completed** | Grey | Stage is `harvested` |
| **Active** | Green | Progressing normally within expected timelines |
| **At Risk** | Amber | Early warning — action recommended soon |
| **Critical** | Red | Urgent — immediate intervention required |
| **Abandoned** | Stone | Admin explicitly marked field as abandoned |

### Decision Tree

```
Is is_abandoned = true?          → ABANDONED
Is stage = harvested?            → COMPLETED

── CRITICAL checks (checked first, highest priority) ──
Expected harvest date is past?   → CRITICAL
Ready stage, no update 14+ days  → CRITICAL (missed harvest window)
No agent AND stage > planted     → CRITICAL (active crop, no oversight)
Stuck in stage 2× max days       → CRITICAL

── AT RISK checks ──
No agent assigned (any stage)    → AT RISK
Stuck in stage > max days        → AT RISK
Harvest within 7 days, not ready → AT RISK
Growing/Flowering/Maturing,
  no update in 14+ days          → AT RISK
Ready, no update in 7+ days      → AT RISK

Otherwise                        → ACTIVE
```

### Stage Duration Thresholds

Each stage has a `maxDaysInStage()` value — the expected maximum days before the crop should progress to the next stage. Exceeding this threshold triggers At Risk; exceeding it 2× triggers Critical.

| Stage      | Max Days |
|------------|----------|
| Planted    | 10       |
| Germinated | 21       |
| Growing    | 30       |
| Flowering  | 21       |
| Maturing   | 30       |
| Ready      | 7        |
| Harvested  | —        |

### Status Reason

Every field also returns a human-readable `status_reason` string explaining exactly why it received its status, displayed in the UI.

---

## Extended Field Stages

The system uses **7 stages** instead of the minimum 4, to provide more granular monitoring:

`Planted → Germinated → Growing → Flowering → Maturing → Ready → Harvested`

---

## Features

### Admin (Coordinator)
- Dashboard with KPI cards, stage donut chart, status bar chart, crop type chart
- Alert panel showing all at-risk and critical fields with reasons
- Upcoming harvests panel (next 14 days)
- Agent workload overview
- Recent activity feed across all agents
- Full field CRUD — create, edit, delete, abandon, restore
- Assign / reassign fields to agents
- User management — create, edit, delete admins and agents

### Field Agent
- Personal dashboard — only their assigned fields
- Their own "needs action" alert panel
- Their own upcoming harvests
- View field details and full update history
- Submit stage updates with health score (1–10) and notes
- Agents can only advance stage (not go backwards)

---

## Security

- **Authentication:** Laravel Sanctum Bearer tokens, 8-hour expiry, revoked on login/logout
- **Role enforcement:** Every endpoint checks role — admin actions return 403 for agents
- **Field isolation:** Agents can only view/update their assigned fields
- **Rate limiting:** Login: 10 req/min · API: 60 req/min
- **Input validation:** All inputs validated via Laravel Form Requests
- **Password policy:** Min 8 chars, mixed case + numbers (enforced server-side)
- **Self-deletion guard:** Admins cannot delete their own account
- **Abandoned field guard:** Updates blocked on abandoned fields
- **CORS:** Locked to frontend origin via config/cors.php
- **Structured errors:** All API errors return clean JSON; no stack traces exposed

---

## API Reference

```
POST   /api/auth/login                  Public, rate-limited
POST   /api/auth/logout                 Auth
GET    /api/auth/me                     Auth

GET    /api/dashboard                   Auth (role-scoped response)

GET    /api/fields                      Auth (agents see only assigned)
POST   /api/fields                      Admin
GET    /api/fields/:id                  Auth (agent access-checked)
PUT    /api/fields/:id                  Admin
DELETE /api/fields/:id                  Admin
POST   /api/fields/:id/abandon          Admin
POST   /api/fields/:id/restore          Admin

GET    /api/fields/:id/updates          Auth
POST   /api/fields/:id/updates          Auth (agent access-checked)

GET    /api/agents                      Admin
GET    /api/users                       Admin
POST   /api/users                       Admin
PUT    /api/users/:id                   Admin
DELETE /api/users/:id                   Admin
```

---

## Project Structure

```
smartseason/
├── backend/
│   ├── app/
│   │   ├── Enums/           FieldStage (7), FieldStatus (5), UserRole
│   │   ├── Http/
│   │   │   ├── Controllers/ Auth, Field, FieldUpdate, Dashboard, User
│   │   │   └── Requests/    Validated form requests
│   │   └── Models/          User, Field (computed status), FieldUpdate
│   ├── database/
│   │   ├── migrations/      4 migration files
│   │   └── seeders/         12 fields covering all status scenarios
│   └── routes/api.php
│
└── frontend/
    └── src/
        ├── api/             Axios client + service layer
        ├── components/
        │   ├── layout/      AppLayout, sidebar
        │   └── ui/          Badge, Modal, StatCard, HealthBar, etc.
        ├── context/         AuthContext
        └── pages/
            ├── auth/        LoginPage
            ├── admin/       UsersPage
            ├── DashboardPage.jsx
            ├── FieldsPage.jsx
            └── FieldDetailPage.jsx
```

---

## Design Decisions

1. **Computed status** — Not stored in DB; derived fresh on every request so it's always accurate without background jobs or triggers.
2. **5-tier status** — Added Critical and Abandoned beyond the minimum spec to enable more nuanced monitoring and avoid binary alerts.
3. **7 crop stages** — More granular than the minimum 4 to support realistic agricultural monitoring cycles.
4. **`status_reason` field** — Every field returns a plain-English explanation of its status, shown inline in the UI so users don't need to guess why a field is at risk.
5. **Health score per update** — Agents rate crop health 1–10 per update, providing a quantitative signal alongside qualitative notes.
6. **`expected_harvest_date`** — Drives proactive at-risk and critical detection before the harvest window is missed.
7. **Token auth** — Sanctum tokens over cookie sessions; simpler for a React SPA, tokens stored in localStorage (acceptable for this scope).
8. **Soft cascade on agent delete** — Deleting an agent nullifies `assigned_agent_id` on their fields (nullOnDelete) rather than cascading deletions.
