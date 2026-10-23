# AgriGenius Admin Portal & Neon DB User Management

> Streamlined Admin Portal for User Management & Database Operations, powered by Neon Serverless PostgreSQL and FastAPI.

The Admin Portal runs independently on port **`5174`** and connects to the FastAPI backend (`:8000`) for all Neon database operations.

---

## 🌟 Key Features

1. **User Management Module**:
   - **View Users**: Real-time table of registered farmers, agronomists, and administrators.
   - **Add User**: Modal form to enter username, email, password, and role.
   - **Edit User**: Modify user credentials, update passwords, and reassign system roles.
   - **Delete User**: Delete user records from database with confirmation.
   - **Search & Filter**: Search by username or email; filter by role (`Farmer`, `Agronomist`, `Admin`).

2. **Neon Serverless PostgreSQL Integration**:
   - Live database status indicator (green when connected to Neon, amber for local fallback).
   - Real-time round-trip database ping latency monitoring.
   - Auto-creates the `users` table on startup:
     ```sql
     CREATE TABLE IF NOT EXISTS users (
         id SERIAL PRIMARY KEY,
         username VARCHAR(255) UNIQUE NOT NULL,
         email VARCHAR(255) UNIQUE NOT NULL,
         password_hash VARCHAR(255) NOT NULL,
         role VARCHAR(50) DEFAULT 'farmer',
         created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
         updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
     );
     ```

3. **Zero Bloat & Unnecessary Features**:
   - Removed mock query simulators, huge fake crop matrices, and extraneous navigation tabs.
   - Focused strictly on **User Details Management** and **Database/System Health**.

---

## 🔌 Connecting Your Neon Database

1. Create a free PostgreSQL database at [neon.tech](https://neon.tech).
2. Copy your connection string from the Neon console (select "Pooled connection" or direct connection string).
3. Open `.env` in the root of the project:
   ```env
   DATABASE_URL=postgresql://username:password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Start or restart the FastAPI backend:
   ```bash
   uvicorn backend.server:app --host 127.0.0.1 --port 8000
   ```
5. The Admin Portal will immediately detect your Neon database and display:
   `🟢 Neon PostgreSQL (ep-***.neon.tech)` with live latency!

---

## 🚀 Running the Apps

| Application | Port | Command |
| :--- | :--- | :--- |
| **Admin Portal** | `5174` | `cd admin && npm run dev` |
| **Farmer Web App** | `5173` | `cd frontend && npm run dev` |
| **FastAPI Backend** | `8000` | `uvicorn backend.server:app --host 127.0.0.1 --port 8000` |
