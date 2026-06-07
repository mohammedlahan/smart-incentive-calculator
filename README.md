# 🚗 Toyota Dealership Smart Incentive Calculator

An enterprise-ready vehicle dealership incentive management dashboard featuring **Role-Based Access Control (RBAC)**, dynamic incentive slab configuring, real-time commission tracking, dynamic staff management, and structured performance analytics.

Built using **Next.js 14 (App Router)**, **Prisma ORM**, **Tailwind CSS**, and **TypeScript**, with data persistence hosted on **Neon PostgreSQL**.

---

## ⚡ Core Features

### 👤 1. Admin Management Suite (`/admin/*`)
* **Incentive Slabs Manager**: Set, update, and remove commission rate tiers with integrated overlap validation to prevent clashing slabs.
* **Vehicle Fleet Configurator**: Add and configure Toyota car models, variants (Petrol, Hybrid, EV), and suffix levels.
* **Staff Access Center (User CRUD)**: Create, edit, or delete user accounts (Admins & Sales Officers) directly from the UI with password encryption. Includes self-deletion prevention.
* **Analytics Center**: Visual charts powered by Recharts mapping monthly performance metrics, top-performing sales reps, and model popularity.

### 💼 2. Sales Officer Dashboard (`/sales/*`)
* **Real-Time Calculator Widget**: Interactive vehicle log input that calculates running commissions instantly.
* **Target Milestone Tracker**: Progress bar indicating how many more cars are required to reach the next commission slab.
* **Historical Logs**: Tabular logs of monthly sales performance.
* **Report Exports**: Download formatted **CSV statements** or print-ready **PDF reports** of commission logs.

### 🛡️ 3. Security & Access Control
* **JWT Cookie Authentication**: Secure Edge-compatible session storage using JSON Web Tokens.
* **Middleware Route Guarding**: Server-level route protection that automatically blocks unauthorized role access and redirects to safe pages.

---

## 🔑 Demo & Testing Credentials

The system seeds two standard accounts with preset roles. Use these to log in and test different dashboard interfaces:

| Portal Role | Username / Email | Password | Allowed Router Scope |
| :--- | :--- | :--- | :--- |
| **Admin Portal** | `admin@dealership.com` | `admin123` | `/admin/*` only |
| **Sales Officer Portal** | `sales@dealership.com` | `sales123` | `/sales/*` only |

---

## 🛠️ Technical Stack

* **Framework**: Next.js 14 (App Router)
* **Styling**: Tailwind CSS
* **Database Host**: Neon PostgreSQL
* **Database ORM**: Prisma Client
* **Password Encryption**: bcryptjs
* **Visualizations**: Recharts
* **Authentication**: jose (Edge compatible JWT)

---

## ⚙️ Quick Start Installation

Follow these steps to launch the project locally:

### 1. Install System Dependencies
Make sure you have Node.js (v18.17+ or higher) installed. Run:
```bash
npm install
```

### 2. Configure Database Variables
Create a `.env` file in the root directory and add the connection string variables:
```env
DATABASE_URL="postgresql://postgres:password@db.supabase.co:5432/postgres?schema=public"
JWT_SECRET="smart_incentive_calculator_jwt_secret_key_2026_vehicle_dealership"
```

### 3. Sync Database Tables
Deploy the tables directly to your database instance:
```bash
npx prisma db push
```

### 4. Seed Default Database Records
Populate default vehicle models, default commission slabs, and the demo logins:
```bash
npx prisma db seed
```

### 5. Launch the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📐 Key Core Logic

### Flat-Tier Incentive Matcher (`src/lib/incentive.ts`)
Matches the total number of cars sold across all models for the given month:
1. Sorts active slabs in ascending order.
2. Checks if `min_range <= total_sales <= max_range` (a null max_range represents infinity).
3. Multiplies the matched rate by the total number of cars.

### Slab Overlap Validation (`src/lib/slabs.ts`)
Ensures no two active incentive slabs overlap. Two ranges `A` and `B` intersect if:
$$\text{A.min} \le \text{B.max} \quad \text{AND} \quad \text{A.max} \ge \text{B.min}$$

---

## 🗂️ Database Layout

```
                        ┌───────────────┐
                        │     users     │
                        └───────┬───────┘
                                │ 1
                                │
                                │ 0..*
                        ┌───────▼───────┐
                        │  sales_logs   │
                        └───────┬───────┘
                                │ 1
                                │
                                │ 0..*
  ┌───────────────┐     ┌───────▼───────┐
  │  car_models   ├─────►  sales_items  │
  └───────────────┘ 1   └───────────────┘ 0..*
```
