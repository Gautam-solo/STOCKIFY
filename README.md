# Stockify — AI-Powered Stock Market Dashboard

A full-stack market platform: live quotes and candles, an AI research assistant, portfolio
tracking, paper trading with virtual capital, price alerts, and a multi-factor stock
screener — behind email authentication with per-user persistence.

**Stack:** Next.js 14 (App Router) · React 18 · MongoDB · Google Gemini · Finnhub ·
Tailwind CSS · shadcn/ui (Radix) · Lightweight Charts · Recharts · Framer Motion

---

## Features

### Market data
- **Live quotes** with change, percentage move and multi-currency display (10 currencies)
- **OHLC candles** across multiple timeframes, rendered with TradingView's Lightweight Charts
- **Market indices**, top **movers**, and **sector performance** breakdowns
- **Symbol search** and **trending tickers**
- **News feed**, both general market and per-symbol

### AI layer
- **Oracle** — `POST /oracle/analyze` runs a Gemini-backed analysis of a symbol, and
  `POST /oracle/scan` sweeps a set of tickers for opportunities
- **JENNIE** — a conversational assistant (`/ai/chat`) that holds context across turns so
  users can ask follow-up questions about a position
- **`/ai/analyze`** for one-shot narrative analysis of a chart or holding

### Portfolio & trading
- **Portfolio tracking** with add/remove, historical valuation, and **CSV export**
- **Paper trading** — virtual balance, buy/sell execution, resulting positions, and a full
  trade history, so strategies can be tested without risking money
- **Watchlist** persisted per user

### Alerts & screening
- **Price alerts** — create, list and delete threshold triggers
- **Screener** — filter the universe on multiple criteria

### Platform
- Email **registration and login**, with per-user settings
- **Currency conversion** with live FX rates
- Light/dark theming, responsive layout, animated transitions

---

## Architecture

The backend is a **single catch-all App Router handler** — `app/api/[[...path]]/route.js` —
that dispatches on pathname and method across ~30 endpoints. All five verbs share one
`handleRoute` entry point:

```js
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
```

This keeps cross-cutting concerns — CORS, error shape, auth checks — in one place instead
of duplicated across route files.

```
app/
├── api/[[...path]]/route.js   # ~30 endpoints behind one dispatcher
├── page.js                    # Dashboard client application
├── layout.js
└── globals.css
components/ui/                 # shadcn/ui — 40+ Radix-based primitives
hooks/                         # use-mobile, use-toast
backend_test.py                # Python integration tests against the API
```

### API surface

| Group | Endpoints |
|---|---|
| Auth | `/auth/register`, `/auth/login`, `/user/:id`, `/user/settings` |
| Market | `/market/indices`, `/market/movers`, `/market/sectors` |
| Stocks | `/stocks/quote/:symbol`, `/stocks/candles/:symbol`, `/stocks/search`, `/stocks/trending`, `/stocks/news` |
| Watchlist | `/watchlist/:id`, `/watchlist/add`, `/watchlist/remove` |
| Portfolio | `/portfolio/:id`, `/portfolio/add`, `/portfolio/remove`, `/portfolio/history/:id`, `/portfolio/export/:id` |
| Paper trading | `/paper-trading/balance/:id`, `/paper-trading/trade`, `/paper-trading/portfolio/:id`, `/paper-trading/history/:id` |
| AI | `/oracle/analyze`, `/oracle/scan`, `/ai/chat`, `/ai/analyze` |
| Alerts | `/alerts/:id`, `/alerts/create`, `/alerts/delete` |
| Screener | `/screener` |
| Currency | `/currency/rates`, `/currency/convert` |

---

## Running locally

**Prerequisites:** Node 18+, a MongoDB instance, a [Finnhub](https://finnhub.io) API key,
and a [Google Gemini](https://ai.google.dev) API key. Both APIs have free tiers.

```bash
git clone https://github.com/Gautam-solo/STOCKIFY.git
cd STOCKIFY
yarn install

cp .env.example .env    # then fill in your own values
yarn dev                # http://localhost:3000
```

Environment variables — see `.env.example`:

| Variable | Purpose |
|---|---|
| `MONGO_URL` | MongoDB connection string |
| `DB_NAME` | Database name |
| `FINNHUB_API_KEY` | Market data (quotes, candles, news) |
| `GEMINI_API_KEY` | Google Gemini, powering Oracle and JENNIE |
| `NEXT_PUBLIC_BASE_URL` | Base URL for client-side API calls |
| `CORS_ORIGINS` | Comma-separated allowed origins |

> **Never commit `.env`.** It is gitignored here. Secrets belong in your local environment
> or your host's secret manager.

Integration tests:

```bash
python3 backend_test.py
```

---

## Status

A learning and portfolio project. Paper trading uses **virtual money only** — nothing here
places real orders. Market data is delayed per the provider's free tier, and none of the
AI output is investment advice.

---

## Author

**Gautam Patel** — B.Tech Information Technology, Indus University, Ahmedabad
[LinkedIn](https://www.linkedin.com/in/gautam-patel-a16394326/) · [GitHub](https://github.com/Gautam-solo)
