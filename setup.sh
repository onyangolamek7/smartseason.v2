#!/usr/bin/env bash
set -e

echo ""
echo "🌾  SmartSeason Setup"
echo "=============================="

# ── Backend ───────────────────────────────────────────────────────────────────
echo ""
echo "▶ Backend..."
cd backend

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "  ✔ .env created"
  echo ""
  echo "  ⚠  Edit backend/.env and set DB_USERNAME + DB_PASSWORD, then re-run."
  exit 1
fi

composer install --no-interaction --prefer-dist --quiet
echo "  ✔ Composer deps installed"

php artisan key:generate --force --quiet
echo "  ✔ App key generated"

php artisan migrate --force
echo "  ✔ Migrations run"

php artisan db:seed --force
echo "  ✔ Demo data seeded (12 fields, 4 users)"

cd ..

# ── Frontend ──────────────────────────────────────────────────────────────────
echo ""
echo "▶ Frontend..."
cd frontend
npm install --silent
echo "  ✔ Node deps installed"
cd ..

echo ""
echo "=============================="
echo "✅  Setup complete!"
echo ""
echo "  Terminal 1:  cd backend  && php artisan serve"
echo "  Terminal 2:  cd frontend && npm run dev"
echo ""
echo "  Open:  http://localhost:5173"
echo ""
echo "  Admin:  admin@smartseason.com  /  Admin@1234"
echo "  Agent:  james@smartseason.com  /  Agent@1234"
echo ""
