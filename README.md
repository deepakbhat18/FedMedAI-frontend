# FedMed AI — Frontend Web Application

> Clinical Practitioner Portal, Patient Registry & Federated Analytics Dashboard

The FedMed AI frontend is a single-page web application (SPA) built for healthcare practitioners and hospital administrators to evaluate multi-disease clinical risks, monitor federated model convergence, and manage patient registries under strict hospital isolation.

For the system-wide architecture and backend orchestrator details, refer to the [Root README](https://github.com/deepakbhat18/FedMedAI-backend/).

---

## Technology Stack

- **Core Framework:** React 18.2 with `React.lazy` code-splitting and `Suspense` boundary fallbacks
- **Routing:** React Router DOM v6.22 (protected route hierarchy, authentication guards)
- **Build Tool:** Vite 8.0.9 (Hot Module Replacement, optimized ES module bundling)
- **Styling & Design System:** Tailwind CSS v4.2 with custom `@custom-variant dark` support and design tokens
- **Data Fetching & Cache:** TanStack React Query v5.28 (background query caching, automatic stale time invalidation)
- **Data Visualization:** Recharts v2.12 (responsive SVG bar and area charts with coordinate padding)
- **UI & Motion:** Framer Motion v11, React Icons v4.12, React Toastify v10, React CountUp v6
- **Production Serving:** Nginx 1.25 Alpine (static asset compression, SPA route rewrites)

---

## Application Routes & Workflows

| Route | View Name | Access Level | Primary Features |
| :--- | :--- | :--- | :--- |
| `/login` | Authentication | Public | JWT login with password visibility toggle and instant theme switcher |
| `/register` | Node Registration | Public | Practitioner account creation with hospital node assignment |
| `/dashboard` | Clinical Dashboard | Authenticated | 4 KPI StatCards, Recharts disease volume breakdown, recent diagnostic feed |
| `/patients` | Patient Registry | Authenticated | Multi-filter patient search, 18-parameter registration modal, hospital scoping |
| `/predict` | AI Diagnosis | Authenticated | 18 clinical input fields, real-time risk stratification, OpenRouter clinical advice |
| `/predictions` | Audit Log | Authenticated | Historical diagnostic risk logs and disease breakdown statistics |
| `/models` | Federated Learning | Admin Only | FedAvg aggregation hyperparameter tuning and model version tracking |
| `/analytics` | Network Analytics | Authenticated | Cross-hospital performance benchmarks and model convergence charts |
| `/hospitals` | Hospital Network | Admin Only | Hospital node registry, online/offline telemetry status, node creation |
| `/scheduler` | Training Scheduler | Admin Only | Cron schedule management and instant manual training execution |
| `/export` | Reports & Export | Authenticated | Masked patient cohort and diagnostic risk CSV downloads |
| `/timeline` | Patient Trajectory | Authenticated | Longitudinal disease progression timeline for individual patients |

---

## Backend Communication & API Proxying

The frontend never communicates directly with the Python ML service; all requests are routed through the Spring Boot backend via an authenticated reverse proxy pattern:

- **Development:** Vite's development server proxies requests matching `/api/*` to `http://localhost:8080` (configured in `vite.config.js`).
- **Production:** Nginx proxies `/api/*` requests directly to `http://backend:8080/api/*` inside the Docker network.
- **Axios HTTP Client (`src/api/axiosConfig.js`):**
  - Injects `Authorization: Bearer <token>` from `localStorage` into every outgoing request.
  - Normalizes endpoints to prevent duplicate `/api/api/...` prefix concatenation.
  - Automatically handles HTTP 401 token expirations by attempting a silent token refresh via `/api/auth/refresh` before redirecting to `/login`.

---

## Environment Variables

| Variable | Default Value | Purpose |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `/api` | Base path prefix for all backend REST requests. Defaults to the local proxy path. |

---

## Local Development Setup

### Prerequisites
- Node.js 20+
- npm 10+

### 1. Install Dependencies
```bash
cd "federated learning medical diagnosis/fl/fl-medical-frontend"
npm ci
```

### 2. Start Vite Dev Server
```bash
npm run dev
```
The application will start at `http://localhost:5173` with Hot Module Replacement (HMR).

### 3. Production Build & Linting
```bash
# Verify code syntax and style rules
npm run lint

# Build optimized production bundle
npm run build

# Preview the production bundle locally
npm run preview
```
Production assets are generated in `dist/` (JavaScript bundles, CSS stylesheets, and assets).

---

## Production Docker Deployment

The frontend is packaged using a multi-stage `Dockerfile`:
1. **Builder Stage:** Uses `node:20-alpine` to execute `npm run build`.
2. **Runtime Stage:** Uses `nginx:1.25-alpine` to serve static assets with gzip compression, security headers, and `/api/*` proxy forwarding.

```bash
# Build the standalone frontend image
docker build -t fl-medical-frontend:latest .

# Run container on port 80
docker run -d \
  --name fl_frontend \
  -p 80:80 \
  fl-medical-frontend:latest
```

---

## Common Setup & Connectivity Issues

1. **`No static resource api/api/...` (HTTP 500):**
   - *Cause:* Prepending `/api/` to request paths when the Axios client already defines `baseURL: '/api'`.
   - *Resolution:* Endpoints should use relative paths like `/predictions` or rely on the normalization rule in `axiosConfig.js`.
2. **Blank Screen or 404 on Page Refresh:**
   - *Cause:* Direct navigation to sub-routes (e.g., `/dashboard`) when the web server lacks SPA fallback configuration.
   - *Resolution:* Ensure Nginx has `try_files $uri $uri/ /index.html;` configured in `nginx.conf`.
3. **ML Service Status Pill Shows "Offline":**
   - *Cause:* The Python FastAPI service is restarting or unreachable on `http://ml-service:8000`.
   - *Resolution:* Check container health via `docker compose ps` and verify the backend can reach the ML service.
