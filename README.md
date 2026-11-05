# Pyxis (front-pyxis)

Personal finance frontend for tracking **expenses**, **income**, and money **borrowed from / lent to** other people.

Built for my own day-to-day money tracking: where cash goes, what I still owe, and what others still owe me — with balances and history in one place.

This repo is the **web UI**. It talks to a Pyxis REST backend over HTTP (Bearer auth).

---

## What it does

After login, you get a small dashboard app to:

- Organize money into **accounts** (wallets, categories, people you lend to / borrow from, etc.)
- Record **moves** (transactions) between accounts — spending, income, loans, repayments
- See **balances** (solde), how they evolve over time, and refresh them when needed
- Inspect an account’s detail view: balance, sub-accounts, move history, and tendency charts
- Filter accounts, paginate long histories, and switch light / dark / system theme

### Typical personal use

| Need | How Pyxis models it |
|------|---------------------|
| Track spending | Expense / movement accounts + dated moves out of a cash/bank account |
| Track income | Income accounts + moves into them |
| Money I lent to someone | An account for that person; move money *to* them when I lend; reverse when they repay |
| Money I borrowed | An account for the lender; move money *from* them when I borrow; reverse when I repay |
| “What’s left?” | Welcome dashboard + per-account solde / evolution |

The core idea: **everything is a move between accounts**. Lending and borrowing are not special features — they are just accounts + transfers, so history and balances stay consistent.

---

## Domain logic

### Accounts

An **account** is a bucket of money or a counterparty (yourself, a category, a friend, a lender).

Accounts can have:

- **Name** — e.g. “Cash”, “Food”, “Alice (lent)”
- **Account type** — classification used for filtering / badges
- **Move type** — how the account behaves in flows (e.g. income vs movement)
- **Super-account / sub-accounts** — optional hierarchy (group related accounts)

### Moves (transactions)

A **move** transfers an amount from one account to another on a given date, with description/detail.

Examples:

- Buy groceries → move from `Cash` → `Food`
- Lend 50 000 MGA to Alice → move from `Cash` → `Alice`
- Alice pays you back → move from `Alice` → `Cash`
- Borrow from Bob → move from `Bob` → `Cash`
- Repay Bob → move from `Cash` → `Bob`

So outstanding loans are readable from account balances / history, not a separate “loan module”.

### Balances (solde)

- Overview balances on **Welcome** (`/solde`)
- Evolution over a date range (`/solde/evolution`)
- Manual recalculation via **Refresh** (`/solde/refresh`)
- Per-account balance + monthly / weekly / daily **tendency charts** on the account page

Currency display is standardized as **Malagasy Ariary (MGA)** (`fr-FR`, whole units).

### Auth

1. Login → backend returns a session token + user profile  
2. Token stored client-side and sent as `Authorization: Bearer …`  
3. Unauthenticated users are redirected to `/login`  
4. HTTP **401** clears the session and sends you back to login  
5. Logout calls the backend, then clears local session  

---

## App map

| Route | Purpose |
|-------|---------|
| `/login` | Sign in |
| `/welcome` | Balances dashboard, evolution, refresh |
| `/accounts` | List / filter / create / edit / delete accounts |
| `/account/[id]` | Account detail, charts, move history |
| `/transactions` | Global move list (paginated CRUD) |
| `/parameters` | Theme (light / dark / system) |

---

## Stack

- **Next.js** (App Router) · **React** · **TypeScript**
- **Tailwind CSS** · **Lucide** icons · **Recharts**
- **Axios** (API client + 401 interceptor)
- **Docker** / **Docker Compose** for production packaging

---

## Setup

### Requirements

- Node.js 20+
- A running Pyxis API (default Compose expectation: `http://localhost:8001`)

### Environment

Set the backend base URL (no trailing slash required; the client trims it):

```bash
NEXT_PUBLIC_PYXIS_HOST=http://localhost:8001
```

### Local development

```bash
npm install
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)

### Production (Docker)

```bash
docker compose up --build
```

Serves the frontend on port **3000**, with `NEXT_PUBLIC_PYXIS_HOST` and `pyxis-network` configured in `docker-compose.yml`.

---

## Project layout (high level)

```
src/
  app/           # Routes (login, welcome, accounts, transactions, …)
  components/    # UI: sidebar, modals, tables, theme, auth guard
  lib/           # Session, Axios client, accounts & transactions API helpers
```

API contract reference: `Pyxis.postman_collection.json`.

---

## Why this exists

I wanted a simple tool for **my own money**: daily expenses, and a clear record of who I lent to or borrowed from — without spreadsheets drifting out of date. Pyxis keeps that as accounts and moves, so balances and history stay tied to the same logic.
