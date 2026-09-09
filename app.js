<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="theme-color" content="#1a2d5a">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Diamond Store">
  <title>Diamond Store – Rice Inventory Management</title>
  <link rel="manifest" href="manifest.json">
  <link rel="stylesheet" href="style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='18' fill='%231a2d5a'/%3E%3Cpolygon points='50,12 88,50 50,88 12,50' fill='none' stroke='%23f5c518' stroke-width='5'/%3E%3Cellipse cx='50' cy='50' rx='14' ry='22' fill='%23f5c518' transform='rotate(-45,50,50)'/%3E%3Cline x1='50' y1='30' x2='50' y2='70' stroke='%231a2d5a' stroke-width='2' transform='rotate(-45,50,50)'/%3E%3C/svg%3E">
  <link rel="apple-touch-icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='18' fill='%231a2d5a'/%3E%3Cpolygon points='50,12 88,50 50,88 12,50' fill='none' stroke='%23f5c518' stroke-width='5'/%3E%3Cellipse cx='50' cy='50' rx='14' ry='22' fill='%23f5c518' transform='rotate(-45,50,50)'/%3E%3Cline x1='50' y1='30' x2='50' y2='70' stroke='%231a2d5a' stroke-width='2' transform='rotate(-45,50,50)'/%3E%3C/svg%3E">
  <style>
    @media print {
      #appShell .sidebar, #appShell .main-header,
      .page-header .btn, .search-bar, .pagination,
      #sidebarOverlay { display: none !important; }
      .main-content { margin: 0 !important; padding: 1rem !important; }
    }
  </style>
</head>
<body>

<!-- ================================================
     TOAST CONTAINER (always visible)
     ================================================ -->
<div id="toastContainer" class="toast-container"></div>

<!-- ================================================
     LOGIN VIEW
     ================================================ -->
<div id="loginView" style="display:flex;min-height:100vh;align-items:center;justify-content:center;padding:1.25rem;background:linear-gradient(135deg,#0f1c3a 0%,#1a2d5a 50%,#2a4580 100%)">
  <div class="login-card">

    <!-- Brand -->
    <div class="brand">
      <div class="brand-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="38" height="38">
          <!-- Diamond outline (rice grain shape) -->
          <polygon points="32,4 60,32 32,60 4,32" fill="#f5c518" opacity="0.15"/>
          <polygon points="32,4 60,32 32,60 4,32" fill="none" stroke="#f5c518" stroke-width="3.5" stroke-linejoin="round"/>
          <!-- Rice grain body inside diamond -->
          <ellipse cx="32" cy="32" rx="10" ry="16" fill="#f5c518" transform="rotate(-45 32 32)"/>
          <!-- Rice grain lines -->
          <line x1="32" y1="22" x2="32" y2="42" stroke="#1a2d5a" stroke-width="1.5" stroke-linecap="round" transform="rotate(-45 32 32)"/>
          <line x1="27" y1="30" x2="37" y2="30" stroke="#1a2d5a" stroke-width="1.2" stroke-linecap="round" transform="rotate(-45 32 32)"/>
          <line x1="27" y1="34" x2="37" y2="34" stroke="#1a2d5a" stroke-width="1.2" stroke-linecap="round" transform="rotate(-45 32 32)"/>
        </svg>
      </div>
      <h1>DIAMOND STORE</h1>
      <p>Rice Inventory Management System</p>
    </div>

    <hr class="divider">

    <!-- ── STEP 1: Username + Password ── -->
    <div id="loginStep1">

      <!-- Error alert -->
      <div id="alertError" role="alert"
           style="display:none;align-items:flex-start;gap:0.625rem;padding:0.75rem 0.875rem;border-radius:10px;font-size:0.8375rem;font-weight:500;margin-bottom:1.25rem;background:#fef2f2;border:1px solid #fecaca;color:#b91c1c">
        <span>⚠️</span>
        <span id="alertMsg">Invalid username or password.</span>
      </div>

      <!-- Cooldown banner -->
      <div id="cooldownBox"
           style="display:none;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:0.875rem 1rem;margin-bottom:1.25rem;font-size:0.85rem;color:#9a3412;text-align:center">
        🔒 Too many failed attempts. Please wait.
        <span style="display:block;font-size:1.75rem;font-weight:900;color:#ea580c;margin-top:0.125rem" id="cooldownSecs">30s</span>
      </div>

      <!-- Attempt progress bar -->
      <div id="attemptWrap" style="display:none;margin-bottom:1rem">
        <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:#6b7280;margin-bottom:0.3rem;font-weight:500">
          <span>Failed login attempts</span>
          <strong style="color:#ef4444" id="attemptText">0 / 5</strong>
        </div>
        <div style="height:4px;background:#f3f4f6;border-radius:999px;overflow:hidden">
          <div id="attemptFill" style="height:100%;background:linear-gradient(90deg,#f59e0b,#ef4444);border-radius:999px;transition:width 0.35s ease;width:0%"></div>
        </div>
      </div>

      <!-- Credentials form -->
      <form id="loginForm" novalidate autocomplete="off">
        <div style="margin-bottom:1rem">
          <label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.4rem" for="loginUsername">Username</label>
          <input type="text" id="loginUsername" placeholder="Enter your username"
                 autocomplete="username" spellcheck="false"
                 style="width:100%;padding:0.7rem 0.875rem;border:1.5px solid #e5e7eb;border-radius:10px;font-size:0.9375rem;font-family:inherit;color:#111827;background:#fafafa;transition:border-color 0.18s,box-shadow 0.18s;outline:none">
        </div>
        <div style="margin-bottom:1.25rem">
          <label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.4rem" for="loginPassword">Password</label>
          <div style="position:relative">
            <input type="password" id="loginPassword" placeholder="Enter your password"
                   autocomplete="current-password"
                   style="width:100%;padding:0.7rem 2.5rem 0.7rem 0.875rem;border:1.5px solid #e5e7eb;border-radius:10px;font-size:0.9375rem;font-family:inherit;color:#111827;background:#fafafa;transition:border-color 0.18s,box-shadow 0.18s;outline:none">
            <button type="button" id="eyeBtn" tabindex="-1"
                    style="position:absolute;right:0.75rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:1rem;color:#9ca3af;padding:0.2rem">👁️</button>
          </div>
        </div>
        <button type="submit" id="loginBtn"
                style="width:100%;padding:0.8125rem;background:linear-gradient(135deg,#1a2d5a,#2a4580);color:#fff;border:none;border-radius:10px;font-size:0.9375rem;font-weight:700;font-family:inherit;cursor:pointer;box-shadow:0 4px 14px rgba(26,45,90,0.35);display:flex;align-items:center;justify-content:center;gap:0.5rem;transition:transform 0.18s,box-shadow 0.18s">
          Sign In
        </button>
      </form>
    </div>

    <!-- ── STEP 2: Admin Security PIN ── -->
    <div id="loginStep2" style="display:none">

      <div style="text-align:center;margin-bottom:1.25rem">
        <div style="width:52px;height:52px;background:linear-gradient(135deg,#1a2d5a,#2a4580);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin:0 auto 0.75rem;box-shadow:0 4px 14px rgba(26,45,90,0.35)">🔐</div>
        <h3 style="font-size:1rem;font-weight:700;color:#111827;margin-bottom:0.25rem">Admin Security PIN</h3>
        <p style="font-size:0.8125rem;color:#6b7280">Enter your 4-digit local security PIN to continue.</p>
      </div>

      <!-- PIN error -->
      <div id="pinError"
           style="display:none;align-items:flex-start;gap:0.5rem;padding:0.65rem 0.875rem;border-radius:10px;font-size:0.8rem;font-weight:500;margin-bottom:1rem;background:#fef2f2;border:1px solid #fecaca;color:#b91c1c">
        <span>⚠️</span>
        <span id="pinErrorMsg">Incorrect PIN. Please try again.</span>
      </div>

      <!-- PIN dots display -->
      <div style="display:flex;gap:0.75rem;justify-content:center;margin-bottom:1.5rem" id="pinDots">
        <div class="pin-dot" id="dot0"></div>
        <div class="pin-dot" id="dot1"></div>
        <div class="pin-dot" id="dot2"></div>
        <div class="pin-dot" id="dot3"></div>
      </div>

      <!-- PIN numpad -->
      <div class="pin-pad" id="pinPad">
        <button class="pin-key" data-val="1">1</button>
        <button class="pin-key" data-val="2">2</button>
        <button class="pin-key" data-val="3">3</button>
        <button class="pin-key" data-val="4">4</button>
        <button class="pin-key" data-val="5">5</button>
        <button class="pin-key" data-val="6">6</button>
        <button class="pin-key" data-val="7">7</button>
        <button class="pin-key" data-val="8">8</button>
        <button class="pin-key" data-val="9">9</button>
        <button class="pin-key pin-clear" data-val="clear">✕</button>
        <button class="pin-key" data-val="0">0</button>
        <button class="pin-key pin-back" data-val="back">⌫</button>
      </div>

      <button type="button" id="backToLoginBtn"
              style="width:100%;margin-top:0.625rem;padding:0.6rem;background:none;border:1.5px solid #e5e7eb;border-radius:10px;font-size:0.875rem;font-weight:600;color:#6b7280;cursor:pointer;transition:all 0.15s">
        ← Back
      </button>

      <button type="button" id="resetPinBtn"
              style="width:100%;margin-top:0.5rem;padding:0.5rem;background:none;border:none;font-size:0.75rem;font-weight:600;color:#ef4444;cursor:pointer;opacity:0.7;transition:opacity 0.15s"
              onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">
        🔁 Forgot PIN? Reset it
      </button>
    </div>

    <!-- ── STEP 3: Set PIN (first-time Admin) ── -->
    <div id="loginStep3" style="display:none">

      <div style="text-align:center;margin-bottom:1.25rem">
        <div style="width:52px;height:52px;background:linear-gradient(135deg,#f5c518,#d4a80a);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin:0 auto 0.75rem">🔑</div>
        <h3 style="font-size:1rem;font-weight:700;color:#111827;margin-bottom:0.25rem">Set Your Security PIN</h3>
        <p style="font-size:0.8125rem;color:#6b7280">Create a 4-digit PIN for Admin verification.<br>You'll enter this every time you log in as Admin.</p>
      </div>

      <div id="setPinStage" style="font-size:0.75rem;font-weight:700;text-align:center;margin-bottom:0.75rem;color:#1a2d5a;text-transform:uppercase;letter-spacing:0.06em">Enter new PIN</div>

      <!-- SET PIN dots -->
      <div style="display:flex;gap:0.75rem;justify-content:center;margin-bottom:1.5rem" id="setPinDots">
        <div class="pin-dot" id="sdot0"></div>
        <div class="pin-dot" id="sdot1"></div>
        <div class="pin-dot" id="sdot2"></div>
        <div class="pin-dot" id="sdot3"></div>
      </div>

      <!-- SET PIN numpad -->
      <div class="pin-pad" id="setPinPad">
        <button class="pin-key" data-val="1">1</button>
        <button class="pin-key" data-val="2">2</button>
        <button class="pin-key" data-val="3">3</button>
        <button class="pin-key" data-val="4">4</button>
        <button class="pin-key" data-val="5">5</button>
        <button class="pin-key" data-val="6">6</button>
        <button class="pin-key" data-val="7">7</button>
        <button class="pin-key" data-val="8">8</button>
        <button class="pin-key" data-val="9">9</button>
        <button class="pin-key pin-clear" data-val="clear">✕</button>
        <button class="pin-key" data-val="0">0</button>
        <button class="pin-key pin-back" data-val="back">⌫</button>
      </div>
    </div>

  </div>
</div>

<!-- ================================================
     APP SHELL (shown after login)
     ================================================ -->
<div id="appShell" style="display:none;min-height:100vh">

  <!-- Sidebar Overlay (mobile) -->
  <div id="sidebarOverlay" class="sidebar-overlay"></div>

  <!-- Sidebar -->
  <aside id="sidebar" class="sidebar">
    <div class="sidebar-brand">
      <div class="brand-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="30" height="30">
          <polygon points="32,4 60,32 32,60 4,32" fill="#f5c518" opacity="0.2"/>
          <polygon points="32,4 60,32 32,60 4,32" fill="none" stroke="#f5c518" stroke-width="3.5" stroke-linejoin="round"/>
          <ellipse cx="32" cy="32" rx="10" ry="16" fill="#f5c518" transform="rotate(-45 32 32)"/>
          <line x1="32" y1="22" x2="32" y2="42" stroke="#1a2d5a" stroke-width="1.5" stroke-linecap="round" transform="rotate(-45 32 32)"/>
          <line x1="27" y1="30" x2="37" y2="30" stroke="#1a2d5a" stroke-width="1.2" stroke-linecap="round" transform="rotate(-45 32 32)"/>
          <line x1="27" y1="34" x2="37" y2="34" stroke="#1a2d5a" stroke-width="1.2" stroke-linecap="round" transform="rotate(-45 32 32)"/>
        </svg>
      </div>
      <div class="brand-name">DIAMOND STORE</div>
      <div class="brand-sub">Rice Inventory Management System</div>
    </div>

    <div class="nav-section-label">Main</div>
    <a class="nav-item" data-section="dashboard">
      <span class="nav-icon">📊</span> Dashboard
    </a>

    <div class="nav-section-label" data-admin-only>Inventory</div>
    <a class="nav-item" data-section="products" data-admin-only>
      <span class="nav-icon">🌾</span> Rice Products
    </a>
    <a class="nav-item" data-section="stock-in" data-admin-only>
      <span class="nav-icon">📦</span> Stock-In
    </a>

    <div class="nav-section-label">Sales</div>
    <a class="nav-item" data-section="pos">
      <span class="nav-icon">🛒</span> POS / Sales
    </a>

    <div class="nav-section-label" data-admin-only>Management</div>
    <a class="nav-item" data-section="suppliers" data-admin-only>
      <span class="nav-icon">🏪</span> Suppliers
    </a>
    <a class="nav-item" data-section="spoilage" data-admin-only>
      <span class="nav-icon">🗑️</span> Spoilage
    </a>

    <div class="nav-section-label" data-admin-only>Admin</div>
    <a class="nav-item" data-section="users" data-admin-only>
      <span class="nav-icon">👥</span> Users
    </a>
    <a class="nav-item" data-section="reports" data-admin-only>
      <span class="nav-icon">📈</span> Reports
    </a>
    <a class="nav-item" data-section="audit" data-admin-only>
      <span class="nav-icon">📋</span> Audit Logs
    </a>

    <div class="sidebar-footer">
      <div class="sidebar-user">
        <div class="avatar" id="sidebarAvatar">A</div>
        <div class="user-info">
          <div class="user-name" id="sidebarUserName">User</div>
          <div class="user-role" id="sidebarUserRole">Role</div>
        </div>
      </div>
      <button id="logoutBtn" class="btn btn-ghost btn-full" style="margin-top:0.5rem;color:rgba(255,255,255,0.6);justify-content:center">
        🚪 Sign Out
      </button>
    </div>
  </aside>

  <!-- Top Header -->
  <header class="main-header">
    <button id="hamburgerBtn" class="hamburger-btn" aria-label="Toggle menu">☰</button>
    <div class="header-title" id="headerTitle">Dashboard</div>
    <div class="header-actions">
      <span style="font-size:0.8125rem;color:var(--text-light)" id="headerUserName"></span>
    </div>
  </header>

  <!-- Main Content Area -->
  <main class="main-content">

    <!-- ============================
         DASHBOARD VIEW
         ============================ -->
    <section id="dashboardView" style="display:none">
      <div class="page-header">
        <div class="page-header-left">
          <h2>Dashboard</h2>
          <p>Welcome back! Here's what's happening at Diamond Store today.</p>
        </div>
        <button class="btn btn-primary" id="dashRefreshBtn">🔄 Refresh</button>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background:#d1fae5">🌾</div>
          <div class="stat-info">
            <div class="stat-label">Total Rice Products</div>
            <div class="stat-value" id="statTotalProducts">—</div>
            <div class="stat-sub">Active products</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#dbeafe">⚖️</div>
          <div class="stat-info">
            <div class="stat-label">Total Stock</div>
            <div class="stat-value" id="statTotalStock">—</div>
            <div class="stat-sub">Total kg available</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#fef3c7">🛒</div>
          <div class="stat-info">
            <div class="stat-label">Today's Sales</div>
            <div class="stat-value" id="statTodaySales">—</div>
            <div class="stat-sub">Transactions today</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#fce7f3">💰</div>
          <div class="stat-info">
            <div class="stat-label">Today's Revenue</div>
            <div class="stat-value" id="statTodayRevenue">—</div>
            <div class="stat-sub">Total sales today</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#ecfdf5">📦</div>
          <div class="stat-info">
            <div class="stat-label">Today's Stock-In</div>
            <div class="stat-value" id="statTodayStockIn">—</div>
            <div class="stat-sub">kg received today</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#fff1f2">🗑️</div>
          <div class="stat-info">
            <div class="stat-label">Today's Spoilage</div>
            <div class="stat-value" id="statTodaySpoil">—</div>
            <div class="stat-sub">kg spoiled today</div>
          </div>
        </div>
      </div>

      <!-- Low Stock Alert -->
      <div style="margin-bottom:1.5rem">
        <div class="card">
          <div class="card-header">
            <div style="display:flex;align-items:center;gap:0.5rem">
              <span>⚠️</span>
              <span class="card-title">Low Stock Alerts</span>
              <span id="statLowStock" style="background:#fee2e2;color:#dc2626;padding:2px 8px;border-radius:999px;font-size:0.75rem;font-weight:700">0</span>
            </div>
            <button class="btn btn-sm btn-outline" onclick="navigateTo('products')">View All Products</button>
          </div>
          <div id="lowStockList"><div style="text-align:center;padding:2rem"><div class="spinner"></div></div></div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="content-grid">
        <div class="card">
          <div class="card-header">
            <span class="card-title">Recent Sales</span>
            <button class="btn btn-sm btn-outline" onclick="navigateTo('pos')">View All</button>
          </div>
          <div class="table-wrapper">
            <table class="table">
              <thead><tr><th>ID</th><th>Product</th><th>Qty</th><th>Amount</th><th>Date &amp; Time</th></tr></thead>
              <tbody id="recentSalesBody"><tr><td colspan="5" style="text-align:center;padding:2rem"><div class="spinner"></div></td></tr></tbody>
            </table>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <span class="card-title">Inventory Summary</span>
            <button class="btn btn-sm btn-outline" onclick="navigateTo('products')">Manage</button>
          </div>
          <div class="table-wrapper">
            <table class="table">
              <thead><tr><th>Product</th><th>Stock (kg)</th><th>Price/kg</th><th>Stock Status</th><th>Active Status</th></tr></thead>
              <tbody id="inventorySummaryBody"><tr><td colspan="5" style="text-align:center;padding:2rem"><div class="spinner"></div></td></tr></tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card" style="margin-top:1.25rem">
        <div class="card-header"><span class="card-title">Quick Actions</span></div>
        <div style="display:flex;gap:0.75rem;flex-wrap:wrap">
          <button class="btn btn-primary" onclick="navigateTo('pos')">🛒 New Sale (POS)</button>
          <button class="btn btn-success" onclick="navigateTo('stock-in')">📦 Record Stock-In</button>
          <button class="btn btn-info" onclick="navigateTo('products')">🌾 Manage Products</button>
          <button class="btn btn-warning" onclick="navigateTo('reports')" data-admin-only>📈 View Reports</button>
          <button class="btn btn-danger" onclick="navigateTo('spoilage')" data-admin-only>🗑️ Record Spoilage</button>
        </div>
      </div>
    </section>

    <!-- ============================
         POS / STOCK OUT VIEW
         ============================ -->
    <section id="posView" style="display:none">
      <div class="page-header">
        <div class="page-header-left">
          <h2>POS / Sales</h2>
          <p>Process rice sales transactions.</p>
        </div>
        <button id="refreshProductsBtn" class="btn btn-ghost btn-sm">🔄 Refresh Products</button>
      </div>

      <div class="pos-layout">
        <!-- Product Grid -->
        <div>
          <div class="card" style="margin-bottom:1rem">
            <div class="card-header">
              <span class="card-title">🌾 Select Rice Product</span>
              <span class="text-sm text-muted">Tap a product to select</span>
            </div>
            <div id="posProductGrid" class="product-grid">
              <div style="text-align:center;padding:2rem;grid-column:1/-1"><div class="spinner"></div></div>
            </div>
          </div>

          <!-- Sales History -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">📋 Sales History</span>
              <span style="font-weight:700;color:var(--success)" id="totalSalesRevenue">₱0.00</span>
            </div>
            <div class="search-bar" style="margin-bottom:0.75rem">
              <div class="search-input-wrapper">
                <span class="search-icon">🔍</span>
                <input type="text" id="salesSearch" placeholder="Search sales…">
              </div>
              <input type="date" id="salesDateFrom" class="form-control" style="max-width:140px">
              <input type="date" id="salesDateTo" class="form-control" style="max-width:140px">
            </div>
            <div class="table-wrapper">
              <table class="table">
                <thead>
                  <tr>
                    <th>Sale ID</th><th>Product</th><th>Qty</th><th>Price/kg</th>
                    <th>Subtotal</th><th>Payment</th><th>Change</th><th>Cashier</th>
                    <th>Date &amp; Time</th><th id="salesActionsHeader" data-admin-only>Actions</th>
                  </tr>
                </thead>
                <tbody id="salesTableBody">
                  <tr><td colspan="10" style="text-align:center;padding:2rem"><div class="spinner"></div></td></tr>
                </tbody>
              </table>
            </div>
            <div id="salesPagination" class="pagination"></div>
          </div>
        </div>

        <!-- POS Panel -->
        <div class="pos-panel">
          <h3 style="margin-bottom:1rem;text-align:center">🛒 Sale Panel</h3>
          <div style="background:var(--bg);border-radius:8px;padding:0.875rem;margin-bottom:1rem">
            <div style="font-size:0.75rem;color:var(--text-light);margin-bottom:0.25rem">Selected Product</div>
            <div style="font-weight:800;font-size:1rem" id="posProductName">Select a product</div>
            <div style="font-size:0.875rem;color:var(--primary);font-weight:600" id="posPricePerKg">—</div>
            <div style="font-size:0.75rem;color:var(--text-light);margin-top:0.25rem">Available: <span id="posAvailableStock">—</span></div>
          </div>
          <div class="form-group">
            <label class="form-label">Quantity (kg) <span class="required">*</span></label>
            <div class="input-group">
              <input type="number" id="posQuantity" placeholder="0.00" step="0.5" min="0.01" style="font-size:1.25rem;font-weight:700">
              <span class="input-addon right">kg</span>
            </div>
            <div id="posInsufficientMsg" style="display:none;color:var(--danger);font-size:0.75rem;margin-top:0.25rem">⚠️ Exceeds available stock!</div>
          </div>
          <div class="pos-receipt">
            <div class="receipt-row"><span>Price per kg</span><span id="posPriceDisplay">—</span></div>
            <div class="receipt-row total"><span>SUBTOTAL</span><span id="posSubtotal">₱0.00</span></div>
          </div>
          <div class="form-group">
            <label class="form-label">Cash Payment (₱)</label>
            <div class="input-group">
              <span class="input-addon">₱</span>
              <input type="number" id="posPayment" placeholder="0.00" step="1" min="0" style="font-size:1.125rem;font-weight:700">
            </div>
          </div>
          <div style="background:#f0fdf4;border-radius:8px;padding:0.875rem;margin-bottom:1rem;display:flex;justify-content:space-between;align-items:center">
            <span style="font-weight:600">CHANGE</span>
            <span style="font-size:1.5rem;font-weight:900;color:var(--success)" id="posChange">₱0.00</span>
          </div>
          <div class="form-group">
            <label class="form-label">Remarks (optional)</label>
            <input type="text" id="posRemarks" class="form-control" placeholder="Notes…">
          </div>
          <button id="processSaleBtn" class="btn btn-success btn-full btn-lg" style="font-size:1rem;margin-bottom:0.5rem">✅ Process Sale</button>
          <button id="clearPosBtn" class="btn btn-ghost btn-full">🗑️ Clear</button>
        </div>
      </div>

      <!-- Receipt Modal -->
      <div id="receiptModal" class="modal-overlay">
        <div class="modal modal-sm">
          <div class="modal-header">
            <h3 class="modal-title">🧾 Sales Receipt</h3>
            <button class="modal-close" data-close-modal>✕</button>
          </div>
          <div class="modal-body" id="receiptContent"></div>
          <div class="modal-footer">
            <button class="btn btn-ghost" data-close-modal>Close</button>
            <button id="printReceiptBtn" class="btn btn-primary">🖨️ Print</button>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================
         PRODUCTS VIEW
         ============================ -->
    <section id="productsView" style="display:none">
      <div class="page-header">
        <div class="page-header-left">
          <h2>Rice Products</h2>
          <p>Manage your rice product catalog. <span id="productCount" class="text-muted text-sm"></span></p>
        </div>
        <button id="addProductBtn" class="btn btn-primary" data-admin-only>+ Add Product</button>
      </div>

      <div class="card" style="margin-bottom:1rem">
        <div class="search-bar">
          <div class="search-input-wrapper" style="flex:2">
            <span class="search-icon">🔍</span>
            <input type="text" id="productSearch" placeholder="Search by name, brand, grade…">
          </div>
          <select id="productStatusFilter" class="form-control" style="max-width:160px">
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button class="btn btn-ghost btn-sm refresh-btn" onclick="loadProducts()">🔄 Refresh</button>
        </div>
        <div style="font-size:0.8rem;color:var(--text-light)" id="filteredCount"></div>
      </div>

      <div class="card">
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr><th>ID</th><th>Rice Name</th><th>Brand</th><th>Grade</th><th>Packaging</th>
              <th>Cost/kg</th><th>Price/kg</th><th>Stock</th><th>Threshold</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody id="productsTableBody">
              <tr><td colspan="11" style="text-align:center;padding:2rem"><div class="spinner"></div></td></tr>
            </tbody>
          </table>
        </div>
        <div id="productPagination" class="pagination"></div>
      </div>

      <!-- Add/Edit Product Modal -->
      <div id="productModal" class="modal-overlay">
        <div class="modal modal-lg">
          <div class="modal-header">
            <h3 class="modal-title" id="productModalTitle">Add Rice Product</h3>
            <button class="modal-close" data-close-modal>✕</button>
          </div>
          <div class="modal-body">
            <form id="productForm" novalidate>
              <input type="hidden" id="productID">
              <div class="form-grid form-grid-2">
                <div class="form-group">
                  <label class="form-label">Rice Type / Name <span class="required">*</span></label>
                  <input type="text" id="productRiceName" class="form-control" placeholder="e.g. Princess Bea">
                  <div id="errRiceName" class="form-error"></div>
                </div>
                <div class="form-group">
                  <label class="form-label">Brand</label>
                  <input type="text" id="productBrand" class="form-control" placeholder="e.g. Diamond Brand">
                </div>
                <div class="form-group">
                  <label class="form-label">Grade</label>
                  <select id="productGrade" class="form-control">
                    <option value="">-- Select Grade --</option>
                    <option>Premium</option><option>Special</option><option>Regular</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Packaging Size</label>
                  <select id="productPackaging" class="form-control">
                    <option value="">-- Select Size --</option>
                    <option value="5 kg">5 kg</option>
                    <option value="25 kg">25 kg</option>
                    <option value="50 kg">50 kg</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Cost Price per kg (₱)</label>
                  <div class="input-group">
                    <span class="input-addon">₱</span>
                    <input type="number" id="productCostPrice" placeholder="0.00" step="0.01" min="0">
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Selling Price per kg (₱) <span class="required">*</span></label>
                  <div class="input-group">
                    <span class="input-addon">₱</span>
                    <input type="number" id="productSellingPrice" placeholder="0.00" step="0.01" min="0">
                  </div>
                  <div id="errSellingPrice" class="form-error"></div>
                </div>
                <div class="form-group">
                  <label class="form-label">Current Stock (kg)</label>
                  <div class="input-group">
                    <input type="number" id="productCurrentStock" placeholder="0" step="0.01" min="0">
                    <span class="input-addon right">kg</span>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Low Stock Threshold (kg)</label>
                  <div class="input-group">
                    <input type="number" id="productLowThreshold" placeholder="10" step="0.01" min="0">
                    <span class="input-addon right">kg</span>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Status</label>
                  <select id="productStatus" class="form-control">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" data-close-modal>Cancel</button>
            <button id="saveProductBtn" class="btn btn-primary">Save Product</button>
          </div>
        </div>
      </div>

      <!-- View Product Modal -->
      <div id="viewProductModal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">Product Details</h3>
            <button class="modal-close" data-close-modal>✕</button>
          </div>
          <div class="modal-body" id="viewProductContent"></div>
          <div class="modal-footer">
            <button class="btn btn-ghost" data-close-modal>Close</button>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================
         STOCK-IN VIEW
         ============================ -->
    <section id="stockInView" style="display:none">
      <div class="page-header">
        <div class="page-header-left">
          <h2>Stock-In Management</h2>
          <p>Record incoming rice stock deliveries.</p>
        </div>
        <button id="addStockInBtn" class="btn btn-success">+ Add Stock-In</button>
      </div>

      <div class="card" style="margin-bottom:1rem">
        <div class="search-bar">
          <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input type="text" id="stockInSearch" placeholder="Search by product, supplier…">
          </div>
          <select id="stockInProductFilter" class="form-control" style="max-width:180px">
            <option value="">All Products</option>
          </select>
          <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap">
            <input type="date" id="stockInDateFrom" class="form-control" style="max-width:150px">
            <span class="text-muted text-sm">to</span>
            <input type="date" id="stockInDateTo" class="form-control" style="max-width:150px">
          </div>
          <button class="btn btn-ghost btn-sm" onclick="loadStockIns()">🔄 Refresh</button>
        </div>
      </div>

      <div class="card">
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr><th>Stock-In ID</th><th>Product</th><th>Supplier</th><th>Quantity</th>
              <th>Cost/kg</th><th>Total Cost</th><th>Date</th><th>Remarks</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody id="stockInTableBody">
              <tr><td colspan="10" style="text-align:center;padding:2rem"><div class="spinner"></div></td></tr>
            </tbody>
          </table>
        </div>
        <div id="stockInPagination" class="pagination"></div>
      </div>

      <!-- Add/Edit Stock-In Modal -->
      <div id="stockInModal" class="modal-overlay">
        <div class="modal modal-lg">
          <div class="modal-header">
            <h3 class="modal-title" id="stockInModalTitle">Add Stock-In</h3>
            <button class="modal-close" data-close-modal>✕</button>
          </div>
          <div class="modal-body">
            <form id="stockInForm" novalidate>
              <input type="hidden" id="siStockInID">
              <div class="form-grid form-grid-2">
                <div class="form-group" style="grid-column:1/-1">
                  <label class="form-label">Rice Product <span class="required">*</span></label>
                  <select id="siProductID" class="form-control"><option value="">-- Select Product --</option></select>
                  <div id="errSiProduct" class="form-error"></div>
                </div>
                <div class="form-group">
                  <label class="form-label">Supplier</label>
                  <select id="siSupplierID" class="form-control"><option value="">-- Select Supplier --</option></select>
                </div>
                <div class="form-group">
                  <label class="form-label">Date</label>
                  <input type="date" id="siDate" class="form-control">
                </div>
                <div class="form-group">
                  <label class="form-label">Quantity (kg) <span class="required">*</span></label>
                  <div class="input-group">
                    <input type="number" id="siQuantity" placeholder="0" step="0.01" min="0.01">
                    <span class="input-addon right">kg</span>
                  </div>
                  <div id="errSiQty" class="form-error"></div>
                </div>
                <div class="form-group">
                  <label class="form-label">Cost per kg (₱)</label>
                  <div class="input-group">
                    <span class="input-addon">₱</span>
                    <input type="number" id="siCostPerKg" placeholder="0.00" step="0.01" min="0">
                  </div>
                </div>
                <div class="form-group" style="grid-column:1/-1">
                  <label class="form-label">Remarks</label>
                  <textarea id="siRemarks" class="form-control" rows="2" placeholder="Optional notes…"></textarea>
                </div>
              </div>
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:0.875rem;display:flex;justify-content:space-between;align-items:center">
                <span style="font-weight:600;color:var(--primary)">Estimated Total Cost:</span>
                <span style="font-size:1.25rem;font-weight:800;color:var(--primary)" id="siTotalCost">₱0.00</span>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" data-close-modal>Cancel</button>
            <button id="saveStockInBtn" class="btn btn-success">Save</button>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================
         SUPPLIERS VIEW
         ============================ -->
    <section id="suppliersView" style="display:none">
      <div class="page-header">
        <div class="page-header-left">
          <h2>Supplier Management</h2>
          <p>Manage rice suppliers and vendors. <span id="supplierCount" class="text-muted text-sm"></span></p>
        </div>
        <button id="addSupplierBtn" class="btn btn-primary">+ Add Supplier</button>
      </div>

      <div class="card" style="margin-bottom:1rem">
        <div class="search-bar">
          <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input type="text" id="supplierSearch" placeholder="Search suppliers…">
          </div>
          <select id="supplierStatusFilter" class="form-control" style="max-width:160px">
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button class="btn btn-ghost btn-sm" onclick="loadSuppliers()">🔄 Refresh</button>
        </div>
      </div>

      <div class="card">
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr><th>ID</th><th>Supplier Name</th><th>Contact Number</th><th>Address</th>
              <th>Products Supplied</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody id="suppliersTableBody">
              <tr><td colspan="7" style="text-align:center;padding:2rem"><div class="spinner"></div></td></tr>
            </tbody>
          </table>
        </div>
        <div id="supplierPagination" class="pagination"></div>
      </div>

      <!-- Supplier Modal -->
      <div id="supplierModal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title" id="supplierModalTitle">Add Supplier</h3>
            <button class="modal-close" data-close-modal>✕</button>
          </div>
          <div class="modal-body">
            <form id="supplierForm" novalidate>
              <input type="hidden" id="supplierID">
              <div class="form-group">
                <label class="form-label">Supplier Name <span class="required">*</span></label>
                <input type="text" id="supplierName" class="form-control" placeholder="e.g. NFA Rice Depot">
                <div id="errSupplierName" class="form-error"></div>
              </div>
              <div class="form-grid form-grid-2">
                <div class="form-group">
                  <label class="form-label">Contact Number</label>
                  <input type="tel" id="supplierContact" class="form-control" placeholder="09XX-XXX-XXXX">
                </div>
                <div class="form-group">
                  <label class="form-label">Status</label>
                  <select id="supplierStatusField" class="form-control">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Address</label>
                <textarea id="supplierAddress" class="form-control" rows="2" placeholder="Complete address…"></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Rice Products Supplied</label>
                <input type="text" id="supplierProducts" class="form-control" placeholder="e.g. Princess Bea, Jasmine, Dinorado">
                <p class="form-hint">Separate multiple products with commas.</p>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" data-close-modal>Cancel</button>
            <button id="saveSupplierBtn" class="btn btn-primary">Save Supplier</button>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================
         SPOILAGE VIEW
         ============================ -->
    <section id="spoilageView" style="display:none">
      <div class="page-header">
        <div class="page-header-left">
          <h2>Spoilage / Damaged Stock</h2>
          <p>Record spoiled, damaged, or lost rice stocks.</p>
        </div>
        <button id="addSpoilageBtn" class="btn btn-danger">+ Record Spoilage</button>
      </div>

      <div class="card" style="margin-bottom:1rem;border-left:4px solid var(--danger)">
        <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap">
          <div>
            <div class="stat-label">Total Spoilage (filtered)</div>
            <div style="font-size:1.75rem;font-weight:800;color:var(--danger)" id="totalSpoilageKg">0 kg</div>
          </div>
          <div style="flex:1;min-width:200px">
            <p class="text-sm text-muted">Track all rice that could not be sold due to spoilage, damage, pest infestation, or other reasons. These records reduce inventory and are kept for auditing.</p>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom:1rem">
        <div class="search-bar">
          <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input type="text" id="spoilageSearch" placeholder="Search by product, reason…">
          </div>
          <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap">
            <input type="date" id="spoilageDateFrom" class="form-control" style="max-width:150px">
            <span class="text-muted text-sm">to</span>
            <input type="date" id="spoilageDateTo" class="form-control" style="max-width:150px">
          </div>
          <button class="btn btn-ghost btn-sm" onclick="loadSpoilage()">🔄 Refresh</button>
        </div>
      </div>

      <div class="card">
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr><th>ID</th><th>Product</th><th>Quantity</th><th>Reason</th>
              <th>Date</th><th>Remarks</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody id="spoilageTableBody">
              <tr><td colspan="8" style="text-align:center;padding:2rem"><div class="spinner"></div></td></tr>
            </tbody>
          </table>
        </div>
        <div id="spoilagePagination" class="pagination"></div>
      </div>

      <!-- Spoilage Modal -->
      <div id="spoilageModal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title" id="spoilageModalTitle">Record Spoilage</h3>
            <button class="modal-close" data-close-modal>✕</button>
          </div>
          <div class="modal-body">
            <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:0.75rem;margin-bottom:1rem;font-size:0.875rem;color:#991b1b">
              ⚠️ Recording spoilage will permanently reduce the product's stock quantity.
            </div>
            <form id="spoilageForm" novalidate>
              <input type="hidden" id="spoilageID">
              <div class="form-group">
                <label class="form-label">Rice Product <span class="required">*</span></label>
                <select id="sploProductID" class="form-control"><option value="">-- Select Product --</option></select>
                <div id="errSploProduct" class="form-error"></div>
                <p class="form-hint" id="availableStockDisplay" style="font-weight:600"></p>
              </div>
              <div class="form-grid form-grid-2">
                <div class="form-group">
                  <label class="form-label">Quantity (kg) <span class="required">*</span></label>
                  <div class="input-group">
                    <input type="number" id="sploQuantity" placeholder="0" step="0.01" min="0.01">
                    <span class="input-addon right">kg</span>
                  </div>
                  <div id="errSploQty" class="form-error"></div>
                </div>
                <div class="form-group">
                  <label class="form-label">Date</label>
                  <input type="date" id="sploDate" class="form-control">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Reason <span class="required">*</span></label>
                <select id="sploReason" class="form-control">
                  <option value="">-- Select Reason --</option>
                  <option value="Spoiled">Spoiled / Rotted</option>
                  <option value="Damaged">Damaged (bag tear, water damage)</option>
                  <option value="Pest Infestation">Pest Infestation</option>
                  <option value="Expired">Expired</option>
                  <option value="Lost">Lost / Missing</option>
                  <option value="Quality Rejection">Quality Rejection</option>
                  <option value="Other">Other</option>
                </select>
                <div id="errSploReason" class="form-error"></div>
              </div>
              <div class="form-group">
                <label class="form-label">Remarks</label>
                <textarea id="sploRemarks" class="form-control" rows="2" placeholder="Additional details…"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" data-close-modal>Cancel</button>
            <button id="saveSpoilageBtn" class="btn btn-danger">Save</button>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================
         REPORTS VIEW
         ============================ -->
    <section id="reportsView" style="display:none">
      <div class="page-header">
        <div class="page-header-left">
          <h2>Reports</h2>
          <p>Sales, inventory, and spoilage reports for a selected date range.</p>
        </div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
          <button id="exportReportBtn" class="btn btn-outline">🖨️ Print Report</button>
          <button id="generateReportBtn" class="btn btn-primary">📊 Generate</button>
        </div>
      </div>

      <div class="card" style="margin-bottom:1rem">
        <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap">
          <div style="font-weight:600">📅 Date Range:</div>
          <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap">
            <input type="date" id="reportDateFrom" class="form-control" style="max-width:170px">
            <span class="text-muted text-sm">to</span>
            <input type="date" id="reportDateTo" class="form-control" style="max-width:170px">
          </div>
        </div>
      </div>

      <div id="reportLoading" style="display:none;text-align:center;padding:3rem">
        <div class="spinner" style="margin:0 auto 1rem"></div>
        <p class="text-muted">Generating report…</p>
      </div>

      <div id="reportContent">
        <div class="stats-grid" style="margin-bottom:1.5rem">
          <div class="stat-card">
            <div class="stat-icon" style="background:#dcfce7">💰</div>
            <div class="stat-info"><div class="stat-label">Total Revenue</div><div class="stat-value text-success" id="rptTotalRevenue">₱0.00</div><div class="stat-sub">All sales</div></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#dbeafe">📦</div>
            <div class="stat-info"><div class="stat-label">Total Cost (Stock-In)</div><div class="stat-value" id="rptTotalCost">₱0.00</div><div class="stat-sub">Procurement cost</div></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#f0fdf4">📈</div>
            <div class="stat-info"><div class="stat-label">Gross Profit</div><div class="stat-value" id="rptGrossProfit">₱0.00</div><div class="stat-sub">Revenue minus cost</div></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#fef3c7">🛒</div>
            <div class="stat-info"><div class="stat-label">Sales Transactions</div><div class="stat-value" id="rptSalesCount">0</div><div class="stat-sub">In period</div></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#fee2e2">🗑️</div>
            <div class="stat-info"><div class="stat-label">Total Spoilage</div><div class="stat-value text-danger" id="rptSpoilageKg">0 kg</div><div class="stat-sub">Lost stock</div></div>
          </div>
        </div>

        <div class="card" style="margin-bottom:1.25rem">
          <div class="card-header"><span class="card-title">📊 Sales by Product</span></div>
          <div class="table-wrapper">
            <table class="table">
              <thead><tr><th>#</th><th>Product</th><th>Total Qty Sold</th><th>Transactions</th><th>Total Revenue</th><th>Avg per Transaction</th></tr></thead>
              <tbody id="salesReportBody"><tr><td colspan="6" class="text-center text-muted" style="padding:1.5rem">No data.</td></tr></tbody>
            </table>
          </div>
        </div>

        <div class="card" style="margin-bottom:1.25rem">
          <div class="card-header"><span class="card-title">📦 Stock-In Summary</span></div>
          <div class="table-wrapper">
            <table class="table">
              <thead><tr><th>#</th><th>Product</th><th>Total Qty Received</th><th>Total Cost</th><th>Avg Cost/kg</th></tr></thead>
              <tbody id="stockInReportBody"><tr><td colspan="5" class="text-center text-muted" style="padding:1.5rem">No data.</td></tr></tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><span class="card-title">🗑️ Spoilage Report</span></div>
          <div class="table-wrapper">
            <table class="table">
              <thead><tr><th>#</th><th>Product</th><th>Total Qty Lost</th><th>Incidents</th></tr></thead>
              <tbody id="spoilageReportBody"><tr><td colspan="4" class="text-center text-muted" style="padding:1.5rem">No data.</td></tr></tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================
         AUDIT LOGS VIEW
         ============================ -->
    <section id="auditLogsView" style="display:none">
      <div class="page-header">
        <div class="page-header-left">
          <h2>Audit Logs</h2>
          <p>Track all system activities. <span id="auditCount" class="text-muted text-sm"></span></p>
        </div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
          <button id="exportAuditBtn" class="btn btn-outline">⬇️ Export CSV</button>
          <button id="refreshAuditBtn" class="btn btn-primary">🔄 Refresh</button>
        </div>
      </div>

      <div class="card" style="margin-bottom:1rem">
        <div class="search-bar">
          <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input type="text" id="auditSearch" placeholder="Search by user, action, description…">
          </div>
          <select id="auditActionFilter" class="form-control" style="max-width:180px">
            <option value="">All Actions</option>
            <option value="LOGIN">LOGIN</option>
            <option value="LOGOUT">LOGOUT</option>
            <option value="FAILED_LOGIN">FAILED LOGIN</option>
            <option value="ACCOUNT_LOCKED">ACCOUNT LOCKED</option>
            <option value="ADD_PRODUCT">ADD PRODUCT</option>
            <option value="UPDATE_PRODUCT">UPDATE PRODUCT</option>
            <option value="DELETE_PRODUCT">DELETE PRODUCT</option>
            <option value="STOCK_IN">STOCK IN</option>
            <option value="SALE">SALE</option>
            <option value="SPOILAGE">SPOILAGE</option>
            <option value="ADD_USER">ADD USER</option>
            <option value="UPDATE_USER">UPDATE USER</option>
            <option value="DELETE_USER">DELETE USER</option>
            <option value="ADD_SUPPLIER">ADD SUPPLIER</option>
            <option value="CHANGE_PASSWORD">CHANGE PASSWORD</option>
            <option value="RESET_PASSWORD">RESET PASSWORD</option>
          </select>
          <select id="auditRoleFilter" class="form-control" style="max-width:130px">
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Cashier">Cashier</option>
          </select>
          <div style="display:flex;gap:0.5rem;align-items:center">
            <input type="date" id="auditDateFrom" class="form-control" style="max-width:150px">
            <span class="text-muted text-sm">to</span>
            <input type="date" id="auditDateTo" class="form-control" style="max-width:150px">
          </div>
        </div>
        <div style="font-size:0.8rem;color:var(--text-light)" id="filteredAuditCount"></div>
      </div>

      <div class="card">
        <div class="table-wrapper">
          <table class="table">
            <thead><tr><th>Log ID</th><th>User</th><th>Role</th><th>Action</th><th>Description</th><th>Date</th><th>Time</th></tr></thead>
            <tbody id="auditTableBody">
              <tr><td colspan="7" style="text-align:center;padding:2rem"><div class="spinner"></div></td></tr>
            </tbody>
          </table>
        </div>
        <div id="auditPagination" class="pagination"></div>
      </div>
    </section>

    <!-- ============================
         USERS VIEW
         ============================ -->
    <section id="usersView" style="display:none">
      <div class="page-header">
        <div class="page-header-left">
          <h2>User Management</h2>
          <p>Manage system accounts and access control. <span id="userCount" class="text-muted text-sm"></span></p>
        </div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
          <button id="openChangePasswordBtn" class="btn btn-outline">🔑 Change My Password</button>
          <button id="addUserBtn" class="btn btn-primary">+ Add User</button>
        </div>
      </div>

      <div class="card" style="margin-bottom:1rem;border-left:4px solid var(--primary)">
        <div style="display:flex;gap:2rem;flex-wrap:wrap">
          <div>
            <div style="font-weight:700;color:var(--primary);margin-bottom:0.25rem">👑 Admin</div>
            <p class="text-sm text-muted">Full system access including user management, suppliers, spoilage, audit logs, and reports.</p>
          </div>
          <div>
            <div style="font-weight:700;color:var(--info);margin-bottom:0.25rem">💼 Cashier</div>
            <p class="text-sm text-muted">Access to Dashboard, Products (view), POS/Sales, and Stock-In only.</p>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom:1rem">
        <div class="search-bar">
          <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input type="text" id="userSearch" placeholder="Search users…">
          </div>
          <select id="userRoleFilter" class="form-control" style="max-width:160px">
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Cashier">Cashier</option>
          </select>
          <button class="btn btn-ghost btn-sm" onclick="loadUsers()">🔄 Refresh</button>
        </div>
      </div>

      <div class="card">
        <div class="table-wrapper">
          <table class="table">
            <thead><tr><th>ID</th><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Failed Attempts</th><th>Actions</th></tr></thead>
            <tbody id="usersTableBody">
              <tr><td colspan="7" style="text-align:center;padding:2rem"><div class="spinner"></div></td></tr>
            </tbody>
          </table>
        </div>
        <div id="userPagination" class="pagination"></div>
      </div>

      <!-- Add/Edit User Modal -->
      <div id="userModal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title" id="userModalTitle">Add User</h3>
            <button class="modal-close" data-close-modal>✕</button>
          </div>
          <div class="modal-body">
            <form id="userForm" novalidate>
              <input type="hidden" id="editUserID">
              <div class="form-group">
                <label class="form-label">Full Name <span class="required">*</span></label>
                <input type="text" id="userFullName" class="form-control" placeholder="e.g. Maria Santos">
                <div id="errUserFullName" class="form-error"></div>
              </div>
              <div class="form-grid form-grid-2">
                <div class="form-group">
                  <label class="form-label">Username <span class="required">*</span></label>
                  <input type="text" id="userUsername" class="form-control" placeholder="e.g. mariasantos" autocomplete="off" spellcheck="false">
                  <div id="errUserUsername" class="form-error"></div>
                </div>
                <div class="form-group" id="userPasswordGroup">
                  <label class="form-label">Password <span class="required">*</span></label>
                  <input type="password" id="userPassword" class="form-control" placeholder="Min. 6 characters" autocomplete="new-password">
                  <div id="errUserPassword" class="form-error"></div>
                </div>
              </div>
              <div class="form-grid form-grid-2">
                <div class="form-group">
                  <label class="form-label">Role</label>
                  <select id="userRole" class="form-control">
                    <option value="Cashier">Cashier</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Status</label>
                  <select id="userStatus" class="form-control">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Locked">Locked</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Email (optional)</label>
                <input type="email" id="userEmail" class="form-control" placeholder="user@diamondstore.com">
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" data-close-modal>Cancel</button>
            <button id="saveUserBtn" class="btn btn-primary">Save User</button>
          </div>
        </div>
      </div>

      <!-- Reset Password Modal -->
      <div id="resetPasswordModal" class="modal-overlay">
        <div class="modal modal-sm">
          <div class="modal-header">
            <h3 class="modal-title">Reset Password</h3>
            <button class="modal-close" data-close-modal>✕</button>
          </div>
          <div class="modal-body">
            <p class="text-sm text-muted" style="margin-bottom:1rem">Resetting password for: <strong id="resetPasswordFor"></strong></p>
            <input type="hidden" id="resetUserID">
            <div class="form-group">
              <label class="form-label">New Password</label>
              <input type="password" id="newPasswordInput" class="form-control" placeholder="Min. 6 characters">
            </div>
            <div class="form-group">
              <label class="form-label">Confirm New Password</label>
              <input type="password" id="confirmNewPassword" class="form-control" placeholder="Repeat password">
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" data-close-modal>Cancel</button>
            <button id="resetPasswordBtn" class="btn btn-warning">Reset Password</button>
          </div>
        </div>
      </div>

      <!-- Change Own Password Modal -->
      <div id="changePasswordModal" class="modal-overlay">
        <div class="modal modal-sm">
          <div class="modal-header">
            <h3 class="modal-title">Change My Password</h3>
            <button class="modal-close" data-close-modal>✕</button>
          </div>
          <div class="modal-body">
            <form id="changePasswordForm" novalidate>
              <div class="form-group">
                <label class="form-label">Current Password</label>
                <input type="password" id="currentPassword" class="form-control" placeholder="Current password">
              </div>
              <div class="form-group">
                <label class="form-label">New Password</label>
                <input type="password" id="newOwnPassword" class="form-control" placeholder="Min. 6 characters">
              </div>
              <div class="form-group">
                <label class="form-label">Confirm New Password</label>
                <input type="password" id="confirmOwnPassword" class="form-control" placeholder="Repeat new password">
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" data-close-modal>Cancel</button>
            <button id="changeOwnPwdBtn" class="btn btn-primary">Change Password</button>
          </div>
        </div>
      </div>
    </section>

  </main><!-- end main-content -->
</div><!-- end appShell -->

<script src="app.js"></script>
</body>
</html>
