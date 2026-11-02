# Simran Kumari — Portfolio

A full-stack TypeScript portfolio website for **Simran Kumari** (B.Tech Mechanical Engineering, BIT Patna · IIT (BHU) research intern · MERN developer).

It has playable project demos, a visitor counter, a contact form that saves messages, and a private admin dashboard.

| Part | Stack |
| --- | --- |
| **Frontend** (`client/`) | React 18, TypeScript, Vite 5, Tailwind CSS 3, Font Awesome |
| **Backend** (`server/`) | Node.js, Express 4, TypeScript, MongoDB (Mongoose 8), Zod, Helmet, Nodemailer |
| **Tooling** | npm workspaces, Vitest, Supertest, tsx, concurrently |

---

## Features

### Portfolio
- **Sections:** Overview, Experience & Education, Live Demos, Skills Matrix, Honors & Certifications, Contact
- **Interactive demos** that run in the page:
  - **Loan Manager & CRM:** live EMI / interest calculations
  - **AI Fire Extinguisher:** a simulated IoT sensor circuit
- **Resume:** the **CV** / **View Resume** buttons open the resume on Google Drive in a new tab

### Modern features
- Command palette: press **Ctrl + K** (⌘ + K on Mac) to jump to a section or run an action
- Light / dark theme toggle and a sound on/off toggle, both remembered between visits
- Scroll progress bar, back-to-top button, and a highlighted nav link for the section you're on
- Sections fade in as you scroll
- Live visitor counters and a ❤️ like button
- Toast notifications and one-click copy for email, phone and profile JSON
- SEO: meta description, Open Graph tags, JSON-LD `Person` data, `robots.txt`
- Accessibility: a skip-to-content link, keyboard focus styles, and support for reduced-motion settings

### Backend
- **Visitor analytics:** page views, visits, unique visitors, visits today, and who is online now
- **Contact form:** validated, rate-limited, protected against spam bots with a hidden field, and saved to MongoDB, with optional email delivery
- **Admin dashboard** at `/admin`, protected by a secret token. It shows:
  - daily traffic chart
  - top referrers
  - device and browser breakdown
  - interaction events
  - message inbox (mark as read / delete)

---

## Getting started

### Requirements
- **Node.js 20+**
- **MongoDB**: a local server at `mongodb://127.0.0.1:27017`, or a MongoDB Atlas connection string

### Setup

```bash
# 1. Install dependencies for both apps
npm install

# 2. Create the server config
cp server/.env.example server/.env
```

Open `server/.env` and set `ADMIN_TOKEN` to a long random string. You can generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```

```bash
# 3. Start the API and the website with hot reload
npm run dev
```

| URL | What |
| --- | --- |
| http://localhost:5173 | Website |
| http://localhost:5173/admin | Admin dashboard (sign in with your `ADMIN_TOKEN`) |
| http://localhost:5000/api | API (the Vite dev server forwards `/api` requests here) |

---

## Environment variables

All variables live in `server/.env`, and `server/.env.example` has a template. **Never commit `.env`**, since it is already in `.gitignore`.

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `5000` | Port the server listens on |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/portfolio` | MongoDB connection string |
| `ADMIN_TOKEN` | *(empty)* | Secret for `/admin`. If it's empty, the admin API is turned off |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated origins allowed to call the API |
| `TRUST_PROXY` | `false` | Set `true` behind a reverse proxy (Render, Railway, Nginx…) so rate limits see real visitor IPs |
| `ANALYTICS_TIMEZONE` | `Asia/Kolkata` | Time zone used to group visits by day |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | *(empty)* | Optional: send contact messages by email. For Gmail, use an App Password |
| `CONTACT_FROM`, `CONTACT_TO` | *(empty)* | Sender and recipient addresses for contact emails |

---

## Scripts

Run these from the project root:

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the API and the website together with hot reload |
| `npm run build` | Production build: `client/dist` and `server/dist` |
| `npm start` | Starts the production server (API + built website) |
| `npm run typecheck` | TypeScript checks for both apps |
| `npm test` | Client unit tests, plus API integration tests (these need MongoDB and use the `portfolio_test` database) |

---

## Production deployment

```bash
npm run build
npm start
```

In production, Express serves the API and the built React site from one port (`PORT`, default `5000`).

On your host (Render, Railway, a VPS…), set at least these variables:

- `MONGODB_URI`: for example, a MongoDB Atlas connection string
- `ADMIN_TOKEN`
- `TRUST_PROXY=true` if the app runs behind a proxy
- `CORS_ORIGINS`: your site's URL

### Easiest: Render (one service for site + API)

`render.yaml` sets everything up. You need a free MongoDB Atlas database: allow access from `0.0.0.0/0` and copy its connection string.

1. Render dashboard → **New → Blueprint**, then pick this GitHub repo.
2. Paste the Atlas connection string when Render asks for `MONGODB_URI`, then click **Apply**.
3. Find your admin password in the service's **Environment** tab, under `ADMIN_TOKEN` (Render generates it).

On the free plan the service sleeps after 15 minutes of no traffic. The first visit after that takes about 30–60 seconds to load.

### Split hosting: frontend on Vercel, backend on Railway

The repo already includes `railway.json` (backend build, start and health check) and `client/vercel.json` (frontend build and page routing).

**1. Database:** use MongoDB Atlas (free tier), or add a MongoDB service in Railway.

**2. Backend on Railway**
- **New Project → Deploy from GitHub repo**, and pick this repo. Leave the root directory as the repo root, since `railway.json` handles the build.
- Variables:

  | Variable | Value |
  | --- | --- |
  | `MONGODB_URI` | Your Atlas string, or `${{MongoDB.MONGO_URL}}` if you used Railway's MongoDB |
  | `ADMIN_TOKEN` | A long random string |
  | `TRUST_PROXY` | `true` |
  | `CORS_ORIGINS` | Your Vercel URL, e.g. `https://your-site.vercel.app` (no trailing slash) |

- Go to **Settings → Networking → Generate Domain**, and copy the URL.

**3. Frontend on Vercel**
- **Add New → Project**, pick this repo, and set **Root Directory** to `client`.
- Environment variable: set `VITE_API_URL` to the Railway URL, e.g. `https://your-api.up.railway.app`.
- Deploy. If your Vercel URL changes later, update `CORS_ORIGINS` on Railway.

`VITE_API_URL` is applied at build time, so **redeploy on Vercel** after you change it.

---

## API reference

All endpoints are under `/api`. Responses are JSON. The whole API is rate-limited to 300 requests per 15 minutes per IP.

### Public

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Health check, returns `{ "ok": true }` |
| `POST` | `/api/analytics/visit` | Records a page view and visit |
| `POST` | `/api/analytics/heartbeat` | Keeps the visitor counted as "online now" |
| `POST` | `/api/analytics/event` | Records an interaction, such as a demo use or resume click |
| `POST` | `/api/analytics/like` | Toggles the visitor's like |
| `GET` | `/api/analytics/stats` | Public counters: page views, visits, unique visitors, today, online, likes |
| `POST` | `/api/contact` | Sends a contact message (limit: 5 per hour per IP) |

### Admin

These endpoints require the header `Authorization: Bearer <ADMIN_TOKEN>`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/admin/overview?days=14` | Totals, daily traffic (1–90 days), referrers, devices, browsers, events |
| `GET` | `/api/admin/messages` | Lists contact messages |
| `PATCH` | `/api/admin/messages/:id` | Marks a message read or unread: `{ "read": true }` |
| `DELETE` | `/api/admin/messages/:id` | Deletes a message |

---

## How visitors are counted

| Metric | Meaning |
| --- | --- |
| **Page views** | Every page load |
| **Visits** | Browser sessions. Reloading in the same tab is not a new visit |
| **Unique visitors** | Distinct browsers, tracked with an anonymous random ID in `localStorage` |
| **Online now** | Visitors whose open tab checked in during the last 60 seconds |

**Privacy:** the site stores no IP addresses or personal data for visitors. It keeps only:
- a random ID
- the device type (mobile / tablet / desktop)
- the browser name
- the referring website's hostname

Bots and crawlers are not counted.

---

## Security

- Helmet sets security headers, including a Content Security Policy
- All input is validated with Zod, and request bodies are limited to 20 KB
- Rate limiting on the whole API, with a stricter limit on the contact form
- The admin token is compared in constant time, so its value can't be guessed from response timing
- Admin pages are marked `noindex` so search engines don't list them
- Secrets live only in `server/.env`, which is never committed

---

## Project structure

```
portfolio-sim/
├── client/                    # React + TypeScript frontend
│   ├── index.html             # SEO meta tags, fonts, JSON-LD
│   ├── public/                # favicon, robots.txt
│   └── src/
│       ├── components/        # Header, Hero, Experience, Projects, Skills, Awards, Contact, Footer…
│       │   └── demos/         # LoanDemo, FireDemo
│       ├── admin/             # Admin dashboard + visits chart
│       ├── context/           # Analytics + toast providers
│       ├── hooks/             # Theme, scroll effects, shared actions
│       └── lib/               # API client, profile data, loan maths, helpers
├── server/                    # Express + TypeScript backend
│   ├── .env.example           # Config template
│   └── src/
│       ├── app.ts             # Express app (middleware, routes, static site)
│       ├── index.ts           # Entry point: DB connection, graceful shutdown
│       ├── models.ts          # Mongoose models: Visitor, Visit, AnalyticsEvent, Message
│       ├── routes/            # analytics, contact, admin
│       ├── stats.ts           # Visitor counter queries
│       └── mailer.ts          # Optional email delivery
├── legacy/
│   └── original-portfolio.html  # Original single-file HTML version (reference only)
└── package.json               # npm workspaces + root scripts
```

---

## Customising

| To change… | Edit |
| --- | --- |
| Email, phone, GitHub, LinkedIn | `client/src/lib/profile.ts` (`PROFILE`) |
| Resume link | `client/src/lib/profile.ts` (`RESUME_URL`) |
| Nav sections | `client/src/lib/profile.ts` (`SECTIONS`) |
| Page title / share preview | `client/index.html` |
| Colours and theme | `client/tailwind.config.js`, `client/src/index.css` |

---

## Contact

**Simran Kumari** · [simrankumariltr@gmail.com](mailto:simrankumariltr@gmail.com) · [GitHub](https://github.com/simran043) · [LinkedIn](https://linkedin.com/in/simran-kumar043)
