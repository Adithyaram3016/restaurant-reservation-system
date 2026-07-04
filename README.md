# TableMaster — Restaurant Reservation Management System

TableMaster is a modern, full-stack web application designed for dining establishments to automate reservation workflows, optimize seating utilization, and provide distinct portal experiences for guests and administration staff.

---

## 🍽️ The Problem We Solve

In the restaurant industry, managing reservation sheets manually often leads to operational friction:
* **Double-Bookings & Overlaps:** Manual entry errors result in multiple parties assigned to the same table at the same time.
* **Underutilized Table Seating:** Parties of two are frequently seated at tables of six or eight due to a lack of structural tracking, wasting premium seating capacity.
* **No Access Controls:** Staff and customers sharing a cluttered booking sheet leads to accidental modifications and data leakage.
* **Poor Guest Visibility:** Guests lack real-time confirmation on their bookings, table numbers, or cancellation states.

TableMaster resolves these issues by implementing an **intelligent, automated seating engine** that auto-allocates the smallest suitable table, guarantees conflict-free scheduling, separates client/admin workflows securely, and provides clear visual feedback.

---

## 🛠️ Setup Instructions

### 1. Prerequisite
Ensure you have **Node.js** and **MongoDB** installed and running on your local machine.

### 2. Installation
Install project dependencies in both the root directory and the backend directory:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### 3. Database & Environment Configuration
Set up your backend secrets in `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/tablemaster
JWT_SECRET=super_secret_tablemaster_key_2026
```
Then, seed the database with the pre-configured admin account and 12 tables:
```bash
cd backend
node scripts/seed.js
```

### 4. Running the Application
Start both dev servers:

**Start Backend Server:**
```bash
cd backend
npm run dev
```

**Start Frontend Server:**
```bash
# In the project root directory
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 5. Running the Validation Test
Verify reservation checks, capacity boundaries, and double-booking avoidance scripts automatically:
```bash
cd backend
node scripts/test-validation.js
```

---

## 🔑 Demo Credentials for Evaluators

* **Admin Console Login:**
  * **Portal:** `http://localhost:3000/admin/login`
  * **Email:** `admin@tablemaster.com`
  * **Password:** `admin123`
* **Customer Sign-in:**
  * **Portal:** `http://localhost:3000/login`
  * **Credentials:** Register a new customer on the signup screen, or use any standard email.

---

## 📋 Assumptions Made

* **Single Restaurant:** The platform represents a single physical restaurant branch with a centralized floor plan.
* **Fixed Predefined Time Slots:** Bookings are made for preset time slots (e.g. 7:00 PM, 7:30 PM, 8:00 PM) rather than dynamic, custom duration queries (e.g. "1 hour and 15 minutes starting from 7:18 PM").
* **Static Table Assets:** Tables are seeded or created with fixed physical seating capacities. Tables cannot be dynamically split (e.g., splitting a table of 4 into two tables of 2).
* **Local Date Boundaries:** The date limits on the frontend and backend are calculated using the server's local timezone.

---

## 🧠 Explanation of Reservation & Availability Logic

The core allocation and conflict checking engine is implemented securely in the backend (`backend/routes/reservations.js`):

```
             [Customer Booking Attempt]
                         │
                         ▼
             Filter tables: capacity >= guests
                         │
                         ▼
          Check active slot reservations 
           (excludes 'cancelled' bookings)
                         │
                         ▼
          Identify and skip occupied tables
                         │
                         ▼
         Sort available tables by capacity (ASC)
             and tableNumber (ASC)
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
[Tables Available]                 [No Tables Left]
Assign smallest table               Return 400 Error:
to maximize occupancy                 "Fully booked"
```

1. **Table Matching:** The query filters tables where `table.capacity >= partySize` to ensure guests sit comfortably.
2. **Occupancy Verification:** Searches active reservations for the selected date and time slot with status `'confirmed'` or `'pending'`. Any table linked to these active reservations is flagged as occupied.
3. **Smart Sorting (Best-Fit):** Remaining open tables are sorted by capacity in ascending order (and then by table number). This means a party of 2 is assigned a table of 2 rather than taking up a table of 8, optimizing seat occupancy.
4. **Conflict Resolution:** If all suitable tables are occupied, the backend returns a `400 Bad Request` explaining that the service slot is fully booked.

---

## 🔒 Explanation of Role-Based Access Control (RBAC)

The system isolates standard customer capabilities from administrative operations:

* **Roles:** Users possess either a `'customer'` or `'admin'` role flag stored securely in the database.
* **Backend Authorization:** Critical endpoints (e.g., Table CRUD, Users list, reservation modifications) are protected using the `requireRole('admin')` middleware. Non-admins receive a `403 Forbidden` response.
* **Frontend Layout Guards:** 
  * The Admin Layout (`app/admin/layout.tsx`) checks the session role. Standard customer accounts are immediately blocked and redirected to the customer portal (`/dashboard`).
  * The Dashboard Layout (`app/dashboard/layout.tsx`) redirects admin users to `/admin`.
* **Isolated Logins:**
  * Customers login at `/login` and are blocked from submitting admin credentials.
  * Admins login at `/admin/login` and are blocked from submitting customer credentials.

---

## ⚠️ Known Limitations

* **No Table Combining:** The system cannot combine two adjacent tables (e.g., putting two tables of 2 together to accommodate a party of 4) if no single table of size 4 is available.
* **Rigid Reservation Durations:** Reservations are assumed to occupy the specific time slot selected. The system does not calculate overlapping durations (e.g. a 7:30 PM booking overlapping a 6:00 PM booking that stays for 2 hours).
* **Local Transaction Locks:** The database checks occupancy in a standard read-then-write style. On heavy concurrent traffic, it could experience race conditions.

---

## 📈 Areas for Improvement with Additional Time

* **Dynamic Table Combining Algorithm:** Implement a graph or grouping algorithm that checks adjacent table layouts and combines them dynamically to fit larger parties.
* **Distributed Locks (Concurrency):** Use Redis-based locks (like Redlock) on the backend to guarantee absolute transactional safety under highly concurrent booking spikes.
* **Custom Service Settings:** Allow admins to customize service hours, block holidays, define custom table turnover times, and configure custom layouts.
* **Notification Subsystem:** Integrate Twilio or SendGrid to send automated SMS/Email booking confirmations and cancellation receipts.
