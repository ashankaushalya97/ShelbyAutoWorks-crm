# Shelby Auto Works — Garage CRM Design Spec
**Date:** 2026-06-02
**Branch:** feature/register → feature/garage-customisation

---

## 1. Project Context

**Base:** IDURAR ERP/CRM v4.1.0 (MERN stack — Node.js/Express/MongoDB/React/Ant Design 5)
**Purpose:** Replace the physical bill book at a small 3-partner garage in Sri Lanka. Enable financial transparency so partners can track income, expenses, and monthly profit splits.

**Business structure:**
- Partner 1 (Admin): Investor, remote oversight
- Partner 2 (Admin): Investor, remote oversight
- Partner 3 (Mechanic): Day-to-day operator, 50% profit share
- 1–2 Trainees: Monthly salary, do not use the app

**Profit split:** Net Profit = Revenue − Expenses → Mechanic 50% / Investor 1: 25% / Investor 2: 25%

---

## 2. User Roles

Two roles added to the `Admin` model (replacing the single `owner` role):

### `admin`
Full access to everything.

### `mechanic`
| Permission | Access |
|---|---|
| Create invoices/bills | ✅ |
| Record payments | ✅ |
| Log expenses | ✅ |
| Manage customers & vehicles | ✅ |
| View revenue summary & P&L | ✅ |
| View profit split | ✅ |
| Delete / edit invoices (status: sent, paid, partial) | ❌ |
| Manage app settings | ❌ |
| Manage user accounts | ❌ |

Role is enforced on both backend (middleware) and frontend (UI hide + route guard).

---

## 3. New Data Models

### 3.1 Vehicle
```
Vehicle {
  customer: ObjectId → Client (required)
  make: String (required)        // e.g. Toyota
  model: String (required)       // e.g. Hilux
  year: Number
  licensePlate: String (required)
  notes: String
  createdBy: ObjectId → Admin
  created: Date
  updated: Date
  removed: Boolean
}
```

### 3.2 Expense
```
Expense {
  date: Date (required)
  amount: Number (required)
  category: enum ['parts', 'salary', 'utilities', 'tools', 'rent', 'other'] (required)
  description: String (required)
  reference: String              // receipt number or shop name
  createdBy: ObjectId → Admin
  created: Date
  updated: Date
  removed: Boolean
}
```

### 3.3 Staff
```
Staff {
  name: String (required)
  role: String                   // e.g. Trainee
  monthlySalary: Number (required)
  startDate: Date
  active: Boolean (default: true)
  createdBy: ObjectId → Admin
  created: Date
  removed: Boolean
}
```
Staff records are reference data only. Salaries are logged manually each month as an `Expense` with category `salary`.

---

## 4. Invoice Modifications

### 4.1 Vehicle Field
- Invoice gains a `vehicle` field: `ObjectId → Vehicle` (optional, autopopulated)
- When creating an invoice, mechanic selects a customer → vehicle dropdown populates with that customer's vehicles
- Inline "Add vehicle" available if customer's vehicle isn't listed yet

### 4.2 No Tax
- Tax rate defaults to 0, tax fields hidden from the invoice form UI
- Existing tax infrastructure left in place (backend), just not surfaced in UI

---

## 5. Expense Module

**Backend:** Standard CRUD controller + routes (`/api/expense/...`)
**Frontend:** New `ExpenseModule` page in the sidebar, accessible to both roles

Features:
- Create expense (date, category, amount, description, reference)
- List view with filters by month and category
- Edit/delete for admin only; mechanic can create but not delete
- Monthly total shown in list header

---

## 6. Staff Module

**Backend:** Simple CRUD (`/api/staff/...`)
**Frontend:** Staff list page, admin-only access

Features:
- Add/edit/deactivate staff with monthly salary
- Reference panel — admins use this to know what salary expense to log each month
- No automated entries (YAGNI — 1-2 trainees, manual is fine)

---

## 7. Monthly P&L & Profit Split Dashboard

### Calculation (per selected month)
```
Total Revenue   = sum of all invoice payments received in month
Total Expenses  = sum of all expense entries in month
Net Profit      = Total Revenue − Total Expenses

Mechanic share  = Net Profit × 50%
Partners share  = Net Profit × 50% (split equally between the 2 admin accounts)
```
Revenue is calculated on **cash basis** — the date payment was received, not invoice date.

### Dashboard additions
- Month selector (default: current month)
- Summary cards: Total Revenue / Total Expenses / Net Profit
- Profit split panel (visible to both admin and mechanic roles) — shows LKR amounts for each share
- Last 6 months summary table: Month / Revenue / Expenses / Net Profit (no extra chart library needed)
- Existing summary cards (invoices, quotes, clients) kept below

### Backend
- New `/api/dashboard/pnl?month=YYYY-MM` endpoint
- Aggregates Invoice payments (status: paid, received in month) + Expense entries (by date) for the month

---

## 8. Print Bill

**Engine:** Existing `html-pdf` package already in backend
**Template:** New Pug template `backend/src/pdf/invoice-garage.pug`

### Bill contents (Standard format)
- Shelby Auto Works logo + shop name + address + phone
- Invoice number + date
- Customer name + phone
- Vehicle: make, model, year, licence plate
- Line items table: service/part name, qty, unit price, total
- Subtotal + Grand Total (no tax)
- Payment status (Paid / Unpaid / Partial)
- Mechanic name (createdBy)
- Notes field

**Print flow:** Invoice read page → "Print Bill" button → opens PDF in new tab → browser print dialog

---

## 9. Role-Based Access Control Implementation

### Backend
- `isValidAuthToken` middleware already exists
- Add `requireRole(roles[])` middleware that checks `req.admin.role`
- Apply to routes: settings routes → `admin` only; user management → `admin` only; expense delete → `admin` only; invoice delete → `admin` only

### Frontend
- `useAuth` hook exposes `currentRole`
- `RoleGuard` component wraps restricted UI elements (hides delete buttons, settings nav item, user management)
- Route-level guard redirects mechanic away from `/settings` and `/admin/*` pages

---

## 10. What's NOT in Scope (This Phase)

- Parts inventory / stock tracking
- Automated recurring salary expenses
- Multi-currency
- Email invoices to customers
- Customer portal
- Trainee app access

---

## 11. Phased Build Order

1. **Role system** — Admin schema update, middleware, frontend guards
2. **Vehicle module** — Model, CRUD, link to invoice form
3. **Expense module** — Model, CRUD, frontend page
4. **Staff module** — Model, CRUD, admin-only page
5. **P&L dashboard** — Backend aggregation endpoint, frontend panel
6. **Print bill** — Pug template, print button on invoice read page
