# AgriGenius Frontend 🌾

Modern, responsive web interface for the **AgriGenius** national agricultural advisory platform, powered by RAG and grounded in 347,944 verified Kisan Call Centre (KCC) records.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | **React 19** (`19.2.8`) | Latest component architecture, hooks, and responsive rendering |
| **Language** | **TypeScript** (`~6.0.2`) | Strict type checking, type safety, and interface models |
| **Bundler & Tooling** | **Vite** (`8.3.0`) | Lightning-fast HMR and optimized production bundling |
| **Styling** | **Tailwind CSS v4** (`@tailwindcss/vite`) | Utility-first styling with custom dark/light theme support |
| **Animation & 3D** | **Framer Motion** (`13.2.0`) | 3D Fan Wheel Hero, page routing transitions, physics-based UI |
| **Routing** | **React Router DOM** (`7.18.3`) | Client routing across Landing, AI Chat, Report, Team, Profile, Auth & Admin |
| **Icons** | **Lucide React** (`1.45.0`) | Clean SVG agricultural, security, and interface icons |

---

## 🚀 Key Modules & Routes

* **`/` — Landing Page**: Features the 3D **Wheel of Intelligence** (`FanWheelHero`), dynamic category inspection, quick advisory prompts, and direct navigation.
* **`/chat` — AI Agricultural Assistant**: Real-time bilingual (English/Hindi) streaming query interface grounded in verified KCC data, featuring source citation cards.
* **`/report` — Agronomic Report & Diagnostics**: Deep-dive analytics, yield insights, regional soil conditions, and pest mitigation reports.
* **`/team` — Core Team & Mission**: Team background, mission statement, and platform documentation.
* **`/profile` — Farmer Profile & Station Details**: Personal identity hub (Name, Phone, DOB, Place, Role) with initials-based avatars (no AI photos).
* **`/auth` — Authentication & Account Setup**: Secure access with Email/Password, OTP verification, and **Continue with Google** with password configuration.
* **`/admin` — Operations Dashboard**: Administrative oversight for national KCC queries, system telemetry, and audit logs.

---

## ⚙️ Development & Build

### Run Dev Server
```bash
npm run dev
```
Starts local dev server at `http://localhost:5173/`.

### Build for Production
```bash
npm run build
```
Type-checks with `tsc -b` and compiles client bundles into `dist/`.

### Linting
```bash
npm run lint
```
Performs high-speed code quality checks with `oxlint`.
