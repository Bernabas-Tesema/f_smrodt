# SMROD / VSCU-100

Vehicle security platform with three deployable parts:

| Directory | What it is | Typical host |
|---|---|---|
| `backend1/` | Django REST API, Celery, Channels | Render |
| `frontend1/` | React admin console (Vite) | Vercel |
| `mobile/` | Flutter owner app (VSCU-100) | Android APK / Play Store |

Shared auth uses **Supabase**. Map tiles and location search use **Mapbox**.

---

## Repository layout

```
f_smrodt/
├── backend1/       # Django API (deploy alone)
├── frontend1/      # Admin web UI (deploy alone)
├── mobile/         # Flutter phone app
├── supabase/       # Auth / SQL helpers
├── docker-compose.yml
├── render.yaml
└── README.md
```

---

## backend1 — Django API

**Path:** `backend1/`

### Local

```bash
cd backend1
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env   # fill secrets
python manage.py migrate
python manage.py runserver
```

Or from repo root with Docker:

```bash
docker compose up --build
```

API defaults to `http://localhost:8000`.

### Deploy on Render

1. Create a **Web Service** from this GitHub repo.
2. Set **Root Directory** to `backend1`.
3. Build: `./build.sh`
4. Start: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
5. Attach Render **PostgreSQL** and set `DATABASE_URL`.
6. Set env vars: `SECRET_KEY`, `DEBUG=False`, `SUPABASE_URL`, `SUPABASE_JWT_SECRET`, `CORS_ALLOWED_ORIGINS`.

`render.yaml` at the repo root already points `rootDir` to `backend1`.

---

## frontend1 — Admin web

**Path:** `frontend1/`

### Local

```bash
cd frontend1
npm install
copy .env.example .env   # fill VITE_* keys
npm run dev
```

Runs on Vite (usually `http://localhost:5173`).

### Deploy on Vercel

1. Import this GitHub repo in Vercel.
2. Set **Root Directory** to `frontend1`.
3. Framework: Vite.
4. Build: `npm run build`
5. Output: `dist`
6. Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE_URL` (your Render API URL).

---

## mobile — Flutter app (VSCU-100)

**Path:** `mobile/`

### Local

```bash
cd mobile
flutter pub get
flutter run
```

### Release APK

```bash
cd mobile
flutter build apk --release
```

APK output:

`mobile/build/app/outputs/flutter-apk/app-release.apk`

Update the app’s API / Supabase URLs before production builds.

---

## Environment overview

| Variable | Used by |
|---|---|
| `SUPABASE_URL` / `SUPABASE_JWT_SECRET` | backend1 |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | frontend1 |
| `VITE_API_BASE_URL` | frontend1 → backend1 |
| `DATABASE_URL` | backend1 on Render |
| `SECRET_KEY` / `DEBUG` | backend1 |

See root `.env.example` and `backend1/.env.example`.

---

## Why three folders?

Frontend and backend deploy on different hosts (Vercel vs Render). The phone app is built separately. Keeping `frontend1`, `backend1`, and `mobile` isolated makes each deploy root clear and avoids mixing Node, Python, and Flutter build tools.
