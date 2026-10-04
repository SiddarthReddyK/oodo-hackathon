# StockSense IMS

A modular, real-time Inventory Management System (IMS) designed to digitize stock-related operations, replace manual spreadsheets, and streamline warehouse workflows. Built for Odoo Hackathon 2026.

## Features

- **Product Management**: Create, update, and track items with SKU codes, categories, units of measure, and safety stock reordering rules.
- **Operations Engine**: Handle incoming receipts, outgoing delivery orders, internal warehouse transfers, and physical stock count adjustments.
- **Audit-Grade Stock Ledger**: Every inventory movement is logged with sequential tracking for full auditability.
- **Real-Time Dashboard**: High-contrast KPI cards, inbound/outbound logistics stream, and low-stock alerts.
- **Role-Based Authentication**: Built-in support for Inventory Managers (full control) and Warehouse Staff (floor execution) with secure bcrypt password hashing.

## Tech Stack

- **Runtime & Package Manager**: [Bun](https://bun.sh/)
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Motion
- **Backend**: Express on Node.js / Bun (`server/server.ts`)
- **Database**: SQLite (via `sql.js` with persistent disk storage in `server/db/`)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+)

### Local Development

1. **Clone and install dependencies**:
   ```bash
   bun install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```

3. **Start the development server**:
   ```bash
   bun run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Production Build**:
   ```bash
   bun run build
   bun run start
   ```

### Running with Docker

Run the entire application in a container with persistent SQLite database storage:

```bash
docker compose up --build
```

The database file is stored in a named Docker volume (`stocksense-data`) mounted to `/app/server/db`, keeping SQLite storage isolated and untracked by git.

## Project Structure

```text
├── server/
│   ├── db/               # SQLite data store & auto-seeding logic (*.sqlite untracked)
│   ├── middleware/       # JWT authentication & authorization
│   ├── routes/           # Auth, Dashboard, Operations, Products, and Stock APIs
│   ├── validators/       # Zod schemas for payload validation
│   └── server.ts         # Single canonical server entry point (Express + Vite)
├── src/
│   ├── components/       # Modular views (Dashboard, Receipts, Deliveries, Transfers, Adjustments)
│   ├── context/          # State management (Auth, Inventory, Theme)
│   ├── data/             # Initial demo catalog & bcrypt-seeded accounts
│   ├── services/         # API client & fetch wrappers
│   └── types/            # TypeScript domain interfaces
├── Dockerfile            # Multi-stage Bun-based container build
├── docker-compose.yml    # Container orchestration with volume persistence
└── package.json          # Project scripts and dependencies
```
