# Smart Incentive Calculator with Dynamic Slab Admin Panel

An enterprise-ready vehicle dealership incentive management dashboard featuring **Role-Based Access Control (RBAC)**, dynamic incentive slab configuring, real-time client calculations, and structured performance analytics.

Built using the **Next.js 14 App Router**, **Prisma ORM**, **Tailwind CSS**, and **TypeScript**, and designed to integrate seamlessly with **Supabase PostgreSQL**.

---

## 🛠️ Technical Stack

- **Frontend:** Next.js 14 (App Router), Tailwind CSS, TypeScript, Lucide Icons.
- **Backend:** Next.js API Routes (Serverless Handler Runtime).
- **Database ORM:** Prisma Client 5.x.
- **Authentication:** Custom JWT-cookie based session verification using `jose` (Edge runtime compatible).
- **Analytics Visualization:** Recharts.
- **Report Exports:** Native client-side CSV spreadsheet compilation and Print-optimized PDF layouts.

---

## 🔑 Demo & Testing Credentials

The system seeds two standard accounts with preset roles. Use these to log in and test different dashboard interfaces:

| Portal Role | Username / Email | Password | Allowed Path Router |
| :--- | :--- | :--- | :--- |
| **Admin Portal** | `admin@dealership.com` | `admin123` | `/admin/*` only |
| **Sales Officer Portal** | `sales@dealership.com` | `sales123` | `/sales/*` only |

> [!NOTE]
> **Server-Side RBAC Guarding:**
> Route access is protected at the server-level using Next.js Edge Middleware. Trying to access `/admin/*` routes as a Sales Officer, or `/sales/*` as an Admin, will trigger a redirect to `/unauthorized` (403 Access Denied).

---

## ⚙️ Quick Start Installation

Follow these steps to launch the project locally:

### 1. Install System Dependencies
Make sure you have Node.js (v18.17+ or higher) installed. Run:
```bash
npm install
```

### 2. Configure Database Variables
Open the generated `.env` file in the root directory and update the `DATABASE_URL` string to connect your database (e.g. Supabase PostgreSQL or local Postgres):
```env
DATABASE_URL="postgresql://postgres:password@db.supabase.co:5432/postgres?schema=public"
JWT_SECRET="smart_incentive_calculator_jwt_secret_key_2026_vehicle_dealership"
```

### 3. Apply Schema Migrations
Deploy the tables (users, car_models, incentive_slabs, sales_logs, sales_items) directly to the database:
```bash
npx prisma db push
```

### 4. Seed Default Database Records
Populate default vehicle models, default slab benchmarks, and the demo accounts:
```bash
npx prisma db seed
```

### 5. Launch the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📐 Key Architectures

### Real-Time Incentive Calculator (`src/lib/incentive.ts`)
Calculates monthly incentive payouts using the **Flat-Tier Model**:
1. Checks the total number of cars sold across all models for the given month.
2. Evaluates the sorted list of configured slabs to find the matching range:
   - `min_range <= total_sales <= max_range` (where a null max_range means infinity, e.g. `8+`).
3. Multiplies the matched rate by the total number of cars.
4. Identifies the *next* milestone level and calculates how many more cars are needed to reach it.

### Slab Overlap Protection (`src/lib/slabs.ts`)
Admins can adjust slab ranges anytime. Overlap validation ensures that no two active slabs clash, preventing double-payout calculations. 
Two ranges `A` and `B` intersect if:
$$\text{A.min} \le \text{B.max} \quad \text{AND} \quad \text{A.max} \ge \text{B.min}$$
*(where a null max range represents infinity)*

---

## 🗂️ Database Tables Layout

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

1. **users:** Email login, password hash, and authorization role (`ADMIN`, `SALES_OFFICER`).
2. **car_models:** Vehicle specs (Camry, Corolla, RAV4, Prius, Tundra) with suffixes and fuel types (Petrol, Hybrid, EV).
3. **incentive_slabs:** Dynamic thresholds defining payout multipliers.
4. **sales_logs:** Main monthly performance logs storing overall sales and incentives.
5. **sales_items:** Details of quantities sold per car model for a specific month.
