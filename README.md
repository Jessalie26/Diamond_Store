# 💎 DIAMOND STORE – Rice Inventory Management System

A complete, responsive, full-stack web application for managing rice inventory at a physical retail store named **Diamond Store**.

---

## 🛠️ Technology Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | HTML5 + CSS3 + JavaScript (Vanilla) |
| Styling     | Custom CSS (mobile-first, responsive)|
| Backend API | Google Apps Script (GAS)            |
| Database    | Google Sheets                       |

---

## 📁 Project Structure

```
DiamondStore/
├── index.html           # Login page
├── dashboard.html       # Dashboard & stats
├── products.html        # Rice product CRUD
├── stock-in.html        # Stock-In management
├── stock-out.html       # POS / Sales
├── suppliers.html       # Supplier management
├── spoilage.html        # Spoilage recording
├── users.html           # User management (Admin only)
├── audit-logs.html      # Audit trail (Admin only)
├── reports.html         # Business reports (Admin only)
├── css/
│   └── style.css        # All styles
├── js/
│   ├── config.js        # API URL & constants
│   ├── utils.js         # Toasts, modals, helpers
│   ├── api.js           # All API calls
│   ├── auth.js          # Login, session, RBAC
│   ├── sidebar.js       # Navigation injection
│   ├── dashboard.js
│   ├── products.js
│   ├── stock-in.js
│   ├── pos.js
│   ├── suppliers.js
│   ├── spoilage.js
│   ├── users.js
│   ├── audit.js
│   └── reports.js
└── gas/
    ├── Code.gs          # Main GAS backend API
    └── SheetSetup.gs    # Sheet initializer + seed data
```

---

## 🚀 Setup Instructions

### Step 1 – Set Up Google Sheets + GAS

1. Go to [Google Sheets](https://sheets.google.com) → create a new blank spreadsheet
2. Name it: **Diamond Store DB**
3. Go to **Extensions → Apps Script**
4. Delete the default `Code.gs` content
5. Copy the content of `gas/Code.gs` into the editor
6. Add a new script file → name it `SheetSetup` → paste `gas/SheetSetup.gs`
7. Click **Run → `setupSheets`** (authorize when prompted)
   - This creates all sheets with headers and seeds sample products, suppliers, and default accounts
8. Click **Deploy → New deployment → Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy** → copy the Web App URL

### Step 2 – Configure the Frontend

Open `js/config.js` and replace:
```javascript
API_URL: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec',
```
with your actual GAS deployment URL.

### Step 3 – Open the App

Open `index.html` in a web browser (or host on GitHub Pages, Netlify, etc.)

**Default Accounts:**
| Role    | Username | Password    |
|---------|----------|-------------|
| Admin   | admin    | Admin@123   |
| Cashier | cashier  | Cashier@123 |

---

## 📋 Google Sheets Structure

| Sheet       | Description                        |
|-------------|------------------------------------|
| `Users`     | System accounts with hashed passwords |
| `Products`  | Rice product catalog               |
| `StockIn`   | All stock-in transactions          |
| `Sales`     | All POS sales                      |
| `Suppliers` | Supplier records                   |
| `Spoilage`  | Damaged/lost stock records         |
| `AuditLogs` | System activity trail              |

---

## 🔐 Role-Based Access Control (RBAC)

| Feature              | Admin | Cashier |
|----------------------|-------|---------|
| Dashboard            | ✅    | ✅      |
| Rice Products (View) | ✅    | ✅      |
| Rice Products (CRUD) | ✅    | ❌      |
| Stock-In             | ✅    | ✅      |
| POS / Sales          | ✅    | ✅      |
| Suppliers            | ✅    | ❌      |
| Spoilage             | ✅    | ❌      |
| Users                | ✅    | ❌      |
| Reports              | ✅    | ❌      |
| Audit Logs           | ✅    | ❌      |

---

## 📱 Mobile Responsive

Tested breakpoints:
- 320px (small phones)
- 375px / 390px / 430px (modern iPhones)
- 768px (tablets)
- 1024px (iPad landscape)
- 1366px+ (laptops & desktops)

On mobile:
- Sidebar becomes a hamburger menu
- Dashboard cards stack vertically
- Tables scroll horizontally
- Forms use single-column layout
- POS panel stacks below product grid

---

## ⚡ Features Summary

1. **Dashboard** – live stats, low-stock alerts, recent sales, inventory summary
2. **Products** – full CRUD, search, filter, stock badges
3. **Stock-In** – record deliveries, auto-updates inventory
4. **POS / Sales** – product tiles, auto-calculate, receipt modal, stock prevention
5. **Suppliers** – full CRUD with search/filter
6. **Spoilage** – record and track damaged stock, auto-reduces inventory
7. **Users** – RBAC, add/edit/delete, password reset, account locking after 5 failures
8. **Audit Logs** – every action logged, exportable as CSV
9. **Reports** – date-filtered sales summary, stock-in summary, spoilage report, gross profit

---

## 🔒 Security

- Passwords hashed with SHA-256 (via Google Apps Script `Utilities.computeDigest`)
- Sessions stored in `sessionStorage` (cleared on browser close)
- Account locked after 5 failed login attempts
- All API calls include a session token verified server-side
- Role enforcement on both frontend (hidden UI) and backend (API checks)

---

## 📦 Sample Products Seeded

| Product          | Brand        | Grade   | Price/kg |
|-----------------|--------------|---------|----------|
| Princess Bea    | Diamond Brand | Premium | ₱63      |
| Jasmine         | Diamond Brand | Special | ₱58      |
| Sinandomeng     | Diamond Brand | Regular | ₱50      |
| Dinorado Special| Diamond Brand | Special | ₱70      |
| Dinorado Premium| Diamond Brand | Premium | ₱78      |
| Milagrosa       | Diamond Brand | Regular | ₱48      |

---

## 🌐 Hosting (Optional)

You can host this on:
- **GitHub Pages** – push to a repo, enable Pages
- **Netlify** – drag & drop the folder
- **Vercel** – import from GitHub

The app only needs static file hosting; the backend runs on Google Apps Script.

---

*© 2025 Diamond Store Rice Inventory Management System*
