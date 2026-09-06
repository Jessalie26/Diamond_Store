// ============================================================
// DIAMOND STORE – app.js
// Single-Page Application – All modules consolidated
// ============================================================

// ===============================
// CONFIGURATION
// ===============================

const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbzxiGWANyCinS4dyFNT2oXQJhXni2c0wdnXudBZA2QjhdP49u2Rh-N2taNCDMePC8Scqg/exec',
  APP_NAME: 'DIAMOND STORE',
  APP_SUBTITLE: 'Rice Inventory Management System',
  VERSION: '1.0.0',
  CURRENCY: '₱',
  WEIGHT_UNIT: 'kg',
  LOW_STOCK_DEFAULT: 10,
  ITEMS_PER_PAGE: 15,
  SESSION_KEY: 'ds_session',
  TOAST_DURATION: 4000
};
Object.freeze(CONFIG);

// ===============================
// UTILITIES
// ===============================

const Toast = {
  container: null,
  init() {
    if (!this.container) {
      this.container = document.getElementById('toastContainer');
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = 'toastContainer';
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
      }
    }
  },
  show(title, message = '', type = 'info', duration = CONFIG.TOAST_DURATION) {
    this.init();
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>`;
    this.container.appendChild(toast);
    setTimeout(() => this.hide(toast), duration);
    return toast;
  },
  hide(toast) {
    toast.classList.add('hiding');
    toast.addEventListener('animationend', () => toast.remove());
  },
  success(title, msg) { return this.show(title, msg, 'success'); },
  error(title, msg)   { return this.show(title, msg, 'error'); },
  warning(title, msg) { return this.show(title, msg, 'warning'); },
  info(title, msg)    { return this.show(title, msg, 'info'); }
};

function confirmDialog(title, message, onConfirm, type = 'danger') {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay confirm-dialog';
  overlay.innerHTML = `
    <div class="modal modal-sm">
      <div class="modal-body">
        <div class="confirm-icon">${type === 'danger' ? '⚠️' : '❓'}</div>
        <h3 style="margin-bottom:0.5rem">${title}</h3>
        <p class="confirm-text">${message}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost cancel-btn">Cancel</button>
        <button class="btn btn-${type} confirm-btn">Confirm</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('open'));
  const close = () => { overlay.classList.remove('open'); setTimeout(() => overlay.remove(), 200); };
  overlay.querySelector('.cancel-btn').addEventListener('click', close);
  overlay.querySelector('.confirm-btn').addEventListener('click', () => { close(); onConfirm(); });
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
}

function formatCurrency(amount) {
  const n = parseFloat(amount) || 0;
  return CONFIG.CURRENCY + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatWeight(kg) {
  const n = parseFloat(kg) || 0;
  return n.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' ' + CONFIG.WEIGHT_UNIT;
}
function formatDate(dateStr) {
  if (!dateStr) return '—';
  try { return new Date(dateStr).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return dateStr; }
}
function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  try { return new Date(dateStr).toLocaleString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return dateStr; }
}
function todayISO() { return new Date().toISOString().split('T')[0]; }

function $(selector, parent = document) { return parent.querySelector(selector); }
function $$(selector, parent = document) { return [...parent.querySelectorAll(selector)]; }
function setHTML(selector, html, parent = document) { const el = $(selector, parent); if (el) el.innerHTML = html; }
function setText(selector, text, parent = document) { const el = $(selector, parent); if (el) el.textContent = text; }

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
}
function setupModalClose(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.querySelectorAll('[data-close-modal]').forEach(btn => btn.addEventListener('click', () => closeModal(id)));
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(id); });
}

class Paginator {
  constructor(containerId, items, perPage, renderFn) {
    this.container = document.getElementById(containerId);
    this.items = items;
    this.perPage = perPage || CONFIG.ITEMS_PER_PAGE;
    this.page = 1;
    this.renderFn = renderFn;
  }
  setItems(items) { this.items = items; this.page = 1; this.render(); }
  get totalPages() { return Math.max(1, Math.ceil(this.items.length / this.perPage)); }
  currentItems() { const start = (this.page - 1) * this.perPage; return this.items.slice(start, start + this.perPage); }
  render() { if (this.renderFn) this.renderFn(this.currentItems()); if (this.container) this.renderPager(); }
  renderPager() {
    if (this.totalPages <= 1) { this.container.innerHTML = ''; return; }
    let html = `<button class="page-btn" data-page="prev" ${this.page === 1 ? 'disabled' : ''}>‹</button>`;
    for (let i = 1; i <= this.totalPages; i++) {
      if (this.totalPages > 7 && i > 2 && i < this.totalPages - 1 && Math.abs(i - this.page) > 1) {
        if (i === 3 || i === this.totalPages - 2) html += `<span style="padding:0 4px;color:#999">…</span>`;
        continue;
      }
      html += `<button class="page-btn ${i === this.page ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    html += `<button class="page-btn" data-page="next" ${this.page === this.totalPages ? 'disabled' : ''}>›</button>`;
    this.container.innerHTML = html;
    this.container.querySelectorAll('.page-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = btn.dataset.page;
        if (p === 'prev') this.page = Math.max(1, this.page - 1);
        else if (p === 'next') this.page = Math.min(this.totalPages, this.page + 1);
        else this.page = parseInt(p);
        this.render();
      });
    });
  }
}

function filterItems(items, query, fields) {
  if (!query) return items;
  const q = query.toLowerCase().trim();
  return items.filter(item => fields.some(f => String(item[f] || '').toLowerCase().includes(q)));
}

function resetForm(formId) {
  const form = document.getElementById(formId);
  if (form) {
    form.reset();
    form.querySelectorAll('.form-error').forEach(e => e.classList.remove('show'));
    form.querySelectorAll('.form-control.error').forEach(e => e.classList.remove('error'));
  }
}

function validateRequired(fields) {
  let valid = true;
  fields.forEach(({ input, errorId, msg }) => {
    const el = typeof input === 'string' ? document.getElementById(input) : input;
    const errEl = document.getElementById(errorId);
    if (!el) return;
    if (!el.value || !el.value.trim()) {
      el.classList.add('error');
      if (errEl) { errEl.textContent = msg || 'This field is required.'; errEl.classList.add('show'); }
      valid = false;
    } else {
      el.classList.remove('error');
      if (errEl) errEl.classList.remove('show');
    }
  });
  return valid;
}

function statusBadge(status) {
  const map = { 'Active':'badge-success','Inactive':'badge-warning','Locked':'badge-danger','Deleted':'badge-gray','Low':'badge-warning','Critical':'badge-danger' };
  return `<span class="badge ${map[status] || 'badge-gray'}">${status}</span>`;
}

function stockBadge(current, threshold) {
  const c = parseFloat(current) || 0;
  const t = parseFloat(threshold) || 10;
  if (c === 0) return '<span class="badge badge-danger">Out of Stock</span>';
  if (c <= t)  return '<span class="badge badge-warning">Low Stock</span>';
  return '<span class="badge badge-success">In Stock</span>';
}

function initSidebarToggle() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const hamburger = document.getElementById('hamburgerBtn');
  if (!sidebar || !hamburger) return;
  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('open');
  });
  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });
  }
}

function debounce(fn, delay = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

function numericInput(el) {
  el.addEventListener('keypress', e => { if (!/[\d.]/.test(e.key) && e.key !== 'Backspace') e.preventDefault(); });
}

function showTableLoading(tbodyId, cols) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="${cols}" style="text-align:center;padding:2.5rem"><div class="spinner"></div></td></tr>`;
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => Toast.success('Copied', text));
}

function infoRow(label, value) {
  return `<div><div class="form-label" style="margin-bottom:0.25rem">${label}</div><div style="font-weight:600">${value}</div></div>`;
}

// ===============================
// API / GOOGLE APPS SCRIPT
// ===============================

// XHR fallback for environments where fetch is unavailable
function _xhrRequest(url, method, body) {
  return new Promise(function(resolve) {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      if (method === 'POST') {
        xhr.setRequestHeader('Content-Type', 'text/plain;charset=utf-8');
      }
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          try {
            const text = xhr.responseText;
            if (text && text.trim().charAt(0) === '{') {
              resolve(JSON.parse(text));
            } else {
              resolve(null);
            }
          } catch(e) { resolve(null); }
        }
      };
      xhr.onerror   = function() { resolve(null); };
      xhr.ontimeout = function() { resolve(null); };
      xhr.timeout = 30000;
      xhr.send(body || null);
    } catch(e) { resolve(null); }
  });
}

// MIT App Inventor bridge — resolvers waiting for response
const _mitResolvers = {};
let _mitCallId = 0;

// Called by MIT App Inventor blocks when API response arrives
function _onMITResponse(jsonStr) {
  try {
    const obj = JSON.parse(jsonStr);
    const resolver = _mitResolvers[obj._callId];
    if (resolver) {
      delete _mitResolvers[obj._callId];
      resolver(obj.result);
    }
  } catch(e) {}
}

// Detect if running inside MIT App Inventor WebView
function _isMITAppInventor() {
  return typeof window.AppInventor !== 'undefined' ||
         navigator.userAgent.indexOf('MIT-AI2App') !== -1 ||
         navigator.userAgent.indexOf('AppInventor') !== -1;
}

// Send API call via MIT App Inventor Web component
function _callViaMIT(data) {
  return new Promise(function(resolve) {
    const callId = ++_mitCallId;
    _mitResolvers[callId] = resolve;
    data._callId = callId;
    // Timeout after 30s
    setTimeout(function() {
      if (_mitResolvers[callId]) {
        delete _mitResolvers[callId];
        resolve({ success: false, message: 'Request timed out.' });
      }
    }, 30000);
    try {
      // Send to MIT App Inventor via WebViewString
      const payload = JSON.stringify({
        type: 'API_CALL',
        callId: callId,
        url: CONFIG.API_URL,
        data: JSON.stringify(data)
      });
      window.AppInventor.setWebViewString(payload);
    } catch(e) {
      delete _mitResolvers[callId];
      resolve({ success: false, message: 'MIT App Inventor bridge error: ' + e.message });
    }
  });
}

const API = {
  async call(action, payload = {}) {
    const session = Auth.getSession();
    const data = {
      action,
      token: session ? session.token : undefined,
      ...payload
    };
    const jsonBody = JSON.stringify(data);

    // ── MIT App Inventor bridge (only if Web component is wired) ─
    // _isMITAppInventor() alone is not enough — the bridge only
    // works if the MIT App Inventor project has a Web component
    // with blocks that handle API_CALL messages.
    // For plain WebViewer usage, skip the bridge and use fetch/XHR.
    if (_isMITAppInventor() && typeof window._mitBridgeEnabled !== 'undefined' && window._mitBridgeEnabled === true) {
      return await _callViaMIT(data);
    }

    // ── Strategy 1: fetch GET (most compatible — works in Android
    //    WebView, MIT WebViewer, Chrome, Safari, all browsers) ────
    if (typeof fetch !== 'undefined') {
      try {
        const url = CONFIG.API_URL + '?payload=' + encodeURIComponent(jsonBody);
        const res = await fetch(url, { method: 'GET', redirect: 'follow' });
        const text = await res.text();
        if (text && text.trim().charAt(0) === '{') {
          return JSON.parse(text);
        }
      } catch(e) {
        console.warn('fetch GET failed:', e.message);
      }
    }

    // ── Strategy 2: fetch POST ──────────────────────────────────
    if (typeof fetch !== 'undefined') {
      try {
        const res = await fetch(CONFIG.API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: jsonBody,
          redirect: 'follow'
        });
        const text = await res.text();
        if (text && text.trim().charAt(0) === '{') {
          return JSON.parse(text);
        }
      } catch(e) {
        console.warn('fetch POST failed:', e.message);
      }
    }

    // ── Strategy 3: XHR GET ─────────────────────────────────────
    const getUrl = CONFIG.API_URL + '?payload=' + encodeURIComponent(jsonBody);
    const xhrGet = await _xhrRequest(getUrl, 'GET', null);
    if (xhrGet) return xhrGet;

    // ── Strategy 4: XHR POST ────────────────────────────────────
    const xhrPost = await _xhrRequest(CONFIG.API_URL, 'POST', jsonBody);
    if (xhrPost) return xhrPost;

    const ua = navigator.userAgent || '';
    return {
      success: false,
      message: 'Cannot reach server. Check internet connection. UA: ' + ua.substring(0, 60)
    };
  },
  login: (username, password) => API.call('login', { username, password }),
  logout: (userId, username, role) => API.call('logout', { userId, username, role }),
  changePassword: (userId, currentPassword, newPassword) => API.call('changePassword', { userId, currentPassword, newPassword }),
  getDashboardStats: () => API.call('getDashboardStats'),
  getProducts: () => API.call('getProducts'),
  addProduct: (product) => API.call('addProduct', { product }),
  updateProduct: (product) => API.call('updateProduct', { product }),
  deleteProduct: (productID) => API.call('deleteProduct', { productID }),
  getStockIns: () => API.call('getStockIns'),
  addStockIn: (stockIn) => API.call('addStockIn', { stockIn }),
  updateStockIn: (stockIn, oldQuantity) => API.call('updateStockIn', { stockIn, oldQuantity }),
  deleteStockIn: (stockInID, productID, quantity) => API.call('deleteStockIn', { stockInID, productID, quantity }),
  getSales: () => API.call('getSales'),
  addSale: (sale) => API.call('addSale', { sale }),
  deleteSale: (saleID, productID, quantity) => API.call('deleteSale', { saleID, productID, quantity }),
  getSuppliers: () => API.call('getSuppliers'),
  addSupplier: (supplier) => API.call('addSupplier', { supplier }),
  updateSupplier: (supplier) => API.call('updateSupplier', { supplier }),
  deleteSupplier: (supplierID) => API.call('deleteSupplier', { supplierID }),
  getSpoilage: () => API.call('getSpoilage'),
  addSpoilage: (spoilage) => API.call('addSpoilage', { spoilage }),
  updateSpoilage: (spoilage, oldQuantity) => API.call('updateSpoilage', { spoilage, oldQuantity }),
  deleteSpoilage: (spoilageID, productID, quantity) => API.call('deleteSpoilage', { spoilageID, productID, quantity }),
  getUsers: () => API.call('getUsers'),
  addUser: (newUser) => API.call('addUser', { newUser }),
  updateUser: (editUser) => API.call('updateUser', { editUser }),
  deleteUser: (userID) => API.call('deleteUser', { userID }),
  resetUserPassword: (userID, newPassword) => API.call('resetUserPassword', { userID, newPassword }),
  getAuditLogs: () => API.call('getAuditLogs'),
  getReports: (reportType, dateFrom, dateTo) => API.call('getReports', { reportType, dateFrom, dateTo })
};

// ===============================
// AUTHENTICATION
// ===============================

const Auth = {
  getSession() {
    try {
      // Use localStorage — sessionStorage is blocked in MIT App Inventor WebView
      const raw = localStorage.getItem(CONFIG.SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.token || !parsed.user) return null;
      return parsed;
    } catch { return null; }
  },
  setSession(data) {
    try { localStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(data)); } catch(e) {}
  },
  clearSession() {
    try { localStorage.removeItem(CONFIG.SESSION_KEY); } catch(e) {}
  },
  isLoggedIn() { return !!this.getSession(); },
  getUser() { const s = this.getSession(); return s ? s.user : null; },
  getToken() { const s = this.getSession(); return s ? s.token : null; },
  isAdmin() { const user = this.getUser(); return user && user.role === 'Admin'; },
  isCashier() { const user = this.getUser(); return user && user.role === 'Cashier'; },
  requireAuth() {
    if (!this.isLoggedIn()) { showLoginView(); return false; }
    return true;
  },
  requireAdmin() {
    if (!this.isLoggedIn()) { showLoginView(); return false; }
    if (!this.isAdmin()) {
      Toast.error('Access Denied', 'This section is restricted to administrators.');
      setTimeout(() => navigateTo('dashboard'), 1200);
      return false;
    }
    return true;
  },
  async logout() {
    const user = this.getUser();
    if (user) { await API.logout(user.userID, user.username, user.role); }
    this.clearSession();
    showLoginView();
  }
};

// ===============================
// ROLE-BASED ACCESS CONTROL
// ===============================

function populateSidebarUser() {
  const user = Auth.getUser();
  if (!user) return;
  const nameEl   = document.getElementById('sidebarUserName');
  const roleEl   = document.getElementById('sidebarUserRole');
  const avatarEl = document.getElementById('sidebarAvatar');
  const hNameEl  = document.getElementById('headerUserName');
  if (nameEl)   nameEl.textContent   = user.fullName || user.username;
  if (roleEl)   roleEl.textContent   = user.role;
  if (avatarEl) avatarEl.textContent = (user.fullName || user.username)[0].toUpperCase();
  if (hNameEl)  hNameEl.textContent  = user.fullName || user.username;
}

function applyRBAC() {
  const user = Auth.getUser();
  if (!user) return;
  if (user.role === 'Cashier') {
    document.querySelectorAll('[data-admin-only]').forEach(el => el.style.display = 'none');
  } else {
    document.querySelectorAll('[data-admin-only]').forEach(el => el.style.display = '');
  }
}

function initLogoutButton() {
  const btn = document.getElementById('logoutBtn');
  if (btn && !btn._logoutBound) {
    btn._logoutBound = true;
    btn.addEventListener('click', () => {
      confirmDialog('Sign Out', 'Are you sure you want to sign out?', () => Auth.logout(), 'danger');
    });
  }
}

function initProtectedPage() {
  populateSidebarUser();
  applyRBAC();
  initLogoutButton();
  initSidebarToggle();
}

// ===============================
// NAVIGATION (SPA Router)
// ===============================

const VIEWS = ['loginView','dashboardView','posView','productsView','stockInView','suppliersView','spoilageView','reportsView','auditLogsView','usersView'];

// Map view IDs to page titles
const VIEW_TITLES = {
  dashboardView:  'Dashboard',
  posView:        'POS / Sales',
  productsView:   'Rice Products',
  stockInView:    'Stock-In Management',
  suppliersView:  'Supplier Management',
  spoilageView:   'Spoilage Management',
  reportsView:    'Reports',
  auditLogsView:  'Audit Logs',
  usersView:      'User Management'
};

// Map section names to viewIDs
const SECTION_MAP = {
  dashboard:   'dashboardView',
  pos:         'posView',
  products:    'productsView',
  'stock-in':  'stockInView',
  suppliers:   'suppliersView',
  spoilage:    'spoilageView',
  reports:     'reportsView',
  audit:       'auditLogsView',
  users:       'usersView'
};

// Map viewIDs to nav item data-section
const VIEW_TO_SECTION = {
  dashboardView:  'dashboard',
  posView:        'pos',
  productsView:   'products',
  stockInView:    'stock-in',
  suppliersView:  'suppliers',
  spoilageView:   'spoilage',
  reportsView:    'reports',
  auditLogsView:  'audit',
  usersView:      'users'
};

// Admin-only sections – cashiers cannot access
const ADMIN_ONLY_SECTIONS = new Set(['products','stock-in','suppliers','spoilage','reports','audit','users']);

// Paginator state reset on navigation
// Pending session – stored after password OK, before PIN OK (declared early for showLoginView)
let _pendingSession = null;

const paginators = {};

function showLoginView() {
  document.getElementById('appShell').style.display = 'none';
  document.getElementById('loginView').style.display = 'flex';
  // Always reset to step 1, clear form, clear errors on every logout/show
  showStep(1);
  const uEl = document.getElementById('loginUsername');
  const pEl = document.getElementById('loginPassword');
  if (uEl) uEl.value = '';
  if (pEl) pEl.value = '';
  document.getElementById('alertError')?.style && (document.getElementById('alertError').style.display = 'none');
  document.getElementById('loginUsername')?.classList.remove('err');
  document.getElementById('loginPassword')?.classList.remove('err');
  _pendingSession = null;
  setTimeout(() => document.getElementById('loginUsername')?.focus(), 80);
}

function showAppShell() {
  document.getElementById('loginView').style.display = 'none';
  document.getElementById('appShell').style.display = 'block';
}

function navigateTo(section) {
  if (!Auth.isLoggedIn()) { showLoginView(); return; }

  // RBAC guard
  if (ADMIN_ONLY_SECTIONS.has(section) && !Auth.isAdmin()) {
    Toast.error('Access Denied', 'This section is restricted to administrators.');
    section = 'dashboard';
  }

  const viewId = SECTION_MAP[section] || 'dashboardView';

  // Hide all views, show target
  VIEWS.forEach(id => {
    const el = document.getElementById(id);
    if (el && id !== 'loginView') el.style.display = 'none';
  });
  const target = document.getElementById(viewId);
  if (target) target.style.display = 'block';

  // Update header title
  const headerTitle = document.getElementById('headerTitle');
  if (headerTitle) headerTitle.textContent = VIEW_TITLES[viewId] || '';

  // Update active nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.section === section);
  });

  // Close sidebar on mobile
  if (window.innerWidth < 1024) {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
  }

  // Run module initializer
  initModule(section);
}

// Track which modules have been initialized to attach event listeners once
const _moduleInitialized = {};

function initModule(section) {
  switch (section) {
    case 'dashboard':  loadDashboard(); break;
    case 'pos':        initPOS(); break;
    case 'products':   initProducts(); break;
    case 'stock-in':   initStockIn(); break;
    case 'suppliers':  initSuppliers(); break;
    case 'spoilage':   initSpoilage(); break;
    case 'reports':    initReports(); break;
    case 'audit':      initAudit(); break;
    case 'users':      initUsers(); break;
  }
}

// ===============================
// DASHBOARD
// ===============================

async function loadDashboard() {
  showDashboardSkeleton();
  const result = await API.getDashboardStats();
  if (!result.success) { Toast.error('Error', result.message); return; }
  const d = result.data;
  renderStatCards(d);
  renderLowStockAlerts(d.lowStockProducts);
  renderRecentSales(d.recentSales);
  renderInventorySummary(d.inventorySummary);
}

function showDashboardSkeleton() {
  ['statTotalProducts','statTotalStock','statTodaySales','statTodayRevenue','statTodayStockIn','statTodaySpoil'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '…';
  });
}

function renderStatCards(d) {
  setText('#statTotalProducts', d.totalProducts || 0);
  setText('#statTotalStock', formatWeight(d.totalStockKg));
  setText('#statTodaySales', d.todaySalesCount || 0);
  setText('#statTodayRevenue', formatCurrency(d.todayRevenue));
  setText('#statLowStock', d.lowStockCount || 0);

  // New stats
  const siEl = document.getElementById('statTodayStockIn');
  if (siEl) siEl.textContent = formatWeight(d.todayStockInKg || 0);
  const spEl = document.getElementById('statTodaySpoil');
  if (spEl) {
    spEl.textContent = formatWeight(d.todaySpoilKg || 0);
    if ((d.todaySpoilKg || 0) > 0) spEl.style.color = 'var(--danger)';
  }

  const lowEl = document.getElementById('statLowStock');
  if (lowEl && d.lowStockCount > 0) lowEl.style.color = 'var(--danger)';
}

function renderLowStockAlerts(products) {
  const container = document.getElementById('lowStockList');
  if (!container) return;
  if (!products || products.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">✅</div><p>All products are well-stocked.</p></div>';
    return;
  }
  container.innerHTML = products.map(p => `
    <div style="display:flex;align-items:center;gap:0.75rem;padding:0.625rem 0;border-bottom:1px solid var(--border)">
      <span style="width:36px;height:36px;background:#fee2e2;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0">🌾</span>
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;font-size:0.875rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}</div>
        <div class="stock-indicator" style="margin-top:4px">
          <div class="stock-bar" style="flex:1">
            <div class="stock-bar-fill" style="width:${Math.min(100, (p.stock/p.threshold)*100)}%;background:${p.stock === 0 ? 'var(--danger)' : 'var(--warning)'}"></div>
          </div>
          <span style="font-size:0.7rem;color:var(--text-light);white-space:nowrap">${formatWeight(p.stock)} / ${formatWeight(p.threshold)}</span>
        </div>
      </div>
      <span class="badge ${p.stock === 0 ? 'badge-danger' : 'badge-warning'}">${p.stock === 0 ? 'Out' : 'Low'}</span>
    </div>`).join('');
}

function renderRecentSales(sales) {
  const tbody = document.getElementById('recentSalesBody');
  if (!tbody) return;
  if (!sales || sales.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted" style="padding:2rem">No recent sales today.</td></tr>';
    return;
  }
  tbody.innerHTML = sales.map(s => `
    <tr>
      <td><span style="font-size:0.75rem;color:var(--text-light)">${s.saleID}</span></td>
      <td><strong>${s.productName}</strong></td>
      <td>${formatWeight(s.quantity)}</td>
      <td><strong>${formatCurrency(s.subtotal)}</strong></td>
      <td><span style="font-size:0.75rem">${s.date} ${s.time || ''}</span></td>
    </tr>`).join('');
}

function renderInventorySummary(products) {
  const tbody = document.getElementById('inventorySummaryBody');
  if (!tbody) return;
  if (!products || products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted" style="padding:2rem">No products found.</td></tr>';
    return;
  }
  tbody.innerHTML = products.map(p => `
    <tr>
      <td><strong>${p.name}</strong><br><span class="text-xs text-muted">${p.brand}</span></td>
      <td>${formatWeight(p.stock)}</td>
      <td>${formatCurrency(p.sellingPrice)}/kg</td>
      <td>${stockBadge(p.stock, 10)}</td>
      <td>${statusBadge(p.status)}</td>
    </tr>`).join('');
}

// ===============================
// POS / STOCK OUT
// ===============================

let posProducts = [];
let selectedPosProduct = null;
let allSales = [];
let salesPaginator = null;
let _posHandlersAttached = false;

async function initPOS() {
  await Promise.all([loadPosProducts(), loadSales()]);
  setupPOSHandlers();
}

async function loadPosProducts() {
  const result = await API.getProducts();
  if (!result.success) return;
  posProducts = (result.data || []).filter(p => p.Status === 'Active');
  renderProductTiles();
}

async function loadSales() {
  showTableLoading('salesTableBody', 10);
  const result = await API.getSales();
  if (!result.success) { Toast.error('Error', result.message); return; }
  allSales = (result.data || []).sort((a, b) => new Date(b.Date + ' ' + (b.Time||'')) - new Date(a.Date + ' ' + (a.Time||'')));
  salesPaginator = null;
  filterSales();
}

function renderProductTiles() {
  const grid = document.getElementById('posProductGrid');
  if (!grid) return;
  if (posProducts.length === 0) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-icon">🌾</div><p>No active products.</p></div>';
    return;
  }
  grid.innerHTML = posProducts.map(p => {
    const outOfStock = parseFloat(p.CurrentStock) <= 0;
    return `
      <div class="product-tile ${outOfStock ? 'out-of-stock' : ''}"
           onclick="${outOfStock ? '' : `selectPosProduct('${p.ProductID}')`}"
           id="tile_${p.ProductID}">
        <div style="font-size:1.5rem;margin-bottom:0.25rem">🌾</div>
        <div class="tile-name">${p.RiceName}</div>
        <div class="tile-price">${formatCurrency(p.SellingPrice)}/kg</div>
        <div class="tile-stock">${formatWeight(p.CurrentStock)}</div>
        ${outOfStock ? '<div class="badge badge-danger" style="margin-top:4px">Out of Stock</div>' : ''}
      </div>`;
  }).join('');
}

function selectPosProduct(id) {
  selectedPosProduct = posProducts.find(p => p.ProductID === id);
  if (!selectedPosProduct) return;
  document.querySelectorAll('.product-tile').forEach(t => t.classList.remove('selected'));
  const tile = document.getElementById('tile_' + id);
  if (tile) tile.classList.add('selected');
  document.getElementById('posProductName').textContent = selectedPosProduct.RiceName;
  document.getElementById('posPricePerKg').textContent = formatCurrency(selectedPosProduct.SellingPrice) + '/kg';
  document.getElementById('posAvailableStock').textContent = formatWeight(selectedPosProduct.CurrentStock);
  document.getElementById('posQuantity').value = '';
  document.getElementById('posPayment').value = '';
  const pd = document.getElementById('posPriceDisplay');
  if (pd) pd.textContent = formatCurrency(selectedPosProduct.SellingPrice) + '/kg';
  updatePOSCalculation();
  document.getElementById('posQuantity').focus();
}

function updatePOSCalculation() {
  if (!selectedPosProduct) return;
  const qty = parseFloat(document.getElementById('posQuantity')?.value) || 0;
  const payment = parseFloat(document.getElementById('posPayment')?.value) || 0;
  const price = parseFloat(selectedPosProduct.SellingPrice) || 0;
  const subtotal = qty * price;
  const change = payment - subtotal;
  const pd = document.getElementById('posPriceDisplay');
  if (pd) pd.textContent = formatCurrency(price) + '/kg';
  document.getElementById('posSubtotal').textContent = formatCurrency(subtotal);
  const changeEl = document.getElementById('posChange');
  if (changeEl) { changeEl.textContent = formatCurrency(Math.max(0, change)); changeEl.style.color = change < 0 ? 'var(--danger)' : 'var(--success)'; }
  const insuf = document.getElementById('posInsufficientMsg');
  if (insuf) insuf.style.display = qty > parseFloat(selectedPosProduct.CurrentStock) ? 'block' : 'none';
}

async function processSale() {
  if (!selectedPosProduct) { Toast.warning('No Product', 'Please select a product first.'); return; }
  const qty = parseFloat(document.getElementById('posQuantity').value) || 0;
  const payment = parseFloat(document.getElementById('posPayment').value) || 0;
  const price = parseFloat(selectedPosProduct.SellingPrice) || 0;
  const subtotal = qty * price;
  if (qty <= 0) { Toast.warning('Invalid', 'Please enter a valid quantity.'); return; }
  if (qty > parseFloat(selectedPosProduct.CurrentStock)) { Toast.error('Insufficient Stock', 'Not enough stock available.'); return; }
  if (payment < subtotal) { Toast.warning('Insufficient Payment', 'Payment must be at least ' + formatCurrency(subtotal)); return; }

  const confirmMsg = `<strong>${selectedPosProduct.RiceName}</strong><br>Quantity: ${formatWeight(qty)}<br>Subtotal: ${formatCurrency(subtotal)}<br>Payment: ${formatCurrency(payment)}<br>Change: ${formatCurrency(payment - subtotal)}`;
  confirmDialog('Confirm Sale', confirmMsg, async () => {
    const session = Auth.getUser();
    const sale = {
      productID: selectedPosProduct.ProductID, productName: selectedPosProduct.RiceName,
      quantity: qty, pricePerKg: price, payment: payment,
      cashierID: session?.userID || '', cashierName: session?.username || '',
      remarks: document.getElementById('posRemarks')?.value || ''
    };
    const btn = document.getElementById('processSaleBtn');
    btn.disabled = true; btn.textContent = 'Processing…';
    const result = await API.addSale(sale);
    btn.disabled = false; btn.textContent = '✅ Process Sale';
    if (result.success) {
      Toast.success('Sale Complete', `Change: ${formatCurrency(result.change)}`);
      showReceiptModal(selectedPosProduct.RiceName, qty, price, subtotal, payment, result.change, result.id);
      clearPOS();
      await loadPosProducts();
      await loadSales();
    } else { Toast.error('Error', result.message); }
  }, 'success');
}

function clearPOS() {
  selectedPosProduct = null;
  document.querySelectorAll('.product-tile').forEach(t => t.classList.remove('selected'));
  const ids = ['posProductName','posPricePerKg','posAvailableStock'];
  const defaults = ['Select a product','—','—'];
  ids.forEach((id, i) => { const el = document.getElementById(id); if (el) el.textContent = defaults[i]; });
  ['posQuantity','posPayment','posRemarks'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('posSubtotal').textContent = formatCurrency(0);
  document.getElementById('posChange').textContent = formatCurrency(0);
  const pd = document.getElementById('posPriceDisplay');
  if (pd) pd.textContent = '—';
  const ins = document.getElementById('posInsufficientMsg');
  if (ins) ins.style.display = 'none';
}

function showReceiptModal(name, qty, price, subtotal, payment, change, saleId) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-PH');
  const user = Auth.getUser();
  document.getElementById('receiptContent').innerHTML = `
    <div style="text-align:center;margin-bottom:1rem">
      <div style="font-size:1.25rem;font-weight:800;color:var(--primary)">${CONFIG.APP_NAME}</div>
      <div style="font-size:0.75rem;color:var(--text-light)">${CONFIG.APP_SUBTITLE}</div>
      <hr class="divider">
      <div style="font-size:0.75rem;color:var(--text-light)">${dateStr} | ${timeStr}</div>
      <div style="font-size:0.75rem;color:var(--text-light)">Cashier: ${user?.fullName || user?.username || 'N/A'}</div>
      <div style="font-size:0.75rem;color:var(--text-light)">OR#: ${saleId}</div>
    </div>
    <div class="pos-receipt">
      <div class="receipt-row"><span>${name}</span><span></span></div>
      <div class="receipt-row"><span>${formatWeight(qty)} x ${formatCurrency(price)}/kg</span><span>${formatCurrency(subtotal)}</span></div>
    </div>
    <div class="receipt-row total"><span>TOTAL</span><span>${formatCurrency(subtotal)}</span></div>
    <div class="receipt-row"><span>CASH</span><span>${formatCurrency(payment)}</span></div>
    <div class="receipt-row change"><span>CHANGE</span><span>${formatCurrency(change)}</span></div>
    <hr class="divider">
    <div style="text-align:center;font-size:0.75rem;color:var(--text-light)">Thank you for shopping at<br><strong>Diamond Store</strong></div>`;
  openModal('receiptModal');
}

function filterSales() {
  const query    = document.getElementById('salesSearch')?.value || '';
  const dateFrom = document.getElementById('salesDateFrom')?.value || '';
  const dateTo   = document.getElementById('salesDateTo')?.value || '';
  let filtered = allSales;
  if (query) filtered = filterItems(filtered, query, ['ProductName', 'SaleID', 'CashierName']);
  if (dateFrom) filtered = filtered.filter(r => r.Date >= dateFrom);
  if (dateTo)   filtered = filtered.filter(r => r.Date <= dateTo);
  if (!salesPaginator) salesPaginator = new Paginator('salesPagination', filtered, CONFIG.ITEMS_PER_PAGE, renderSalesTable);
  else salesPaginator.setItems(filtered);
  const totalRev = filtered.reduce((s, r) => s + (parseFloat(r.Subtotal) || 0), 0);
  const revEl = document.getElementById('totalSalesRevenue');
  if (revEl) revEl.textContent = formatCurrency(totalRev);
}

function renderSalesTable(records) {
  const tbody = document.getElementById('salesTableBody');
  if (!tbody) return;
  const isAdmin = Auth.isAdmin();
  if (records.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${isAdmin ? 10 : 9}"><div class="empty-state"><div class="empty-icon">🛒</div><p>No sales found.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = records.map(r => `
    <tr>
      <td><span class="text-xs text-muted">${r.SaleID}</span></td>
      <td><strong>${r.ProductName}</strong></td>
      <td>${formatWeight(r.Quantity)}</td>
      <td>${formatCurrency(r.PricePerKg)}/kg</td>
      <td><strong>${formatCurrency(r.Subtotal)}</strong></td>
      <td>${formatCurrency(r.Payment)}</td>
      <td>${formatCurrency(r.Change)}</td>
      <td>${r.CashierName}</td>
      <td>${r.Date} ${r.Time || ''}</td>
      ${isAdmin ? `<td><button class="btn btn-danger btn-sm" onclick="voidSale('${r.SaleID}','${r.ProductID}',${r.Quantity})">🚫 Void</button></td>` : ''}
    </tr>`).join('');
}

function setupPOSHandlers() {
  if (_posHandlersAttached) return;
  _posHandlersAttached = true;
  document.getElementById('posQuantity')?.addEventListener('input', updatePOSCalculation);
  document.getElementById('posPayment')?.addEventListener('input', updatePOSCalculation);
  document.getElementById('processSaleBtn')?.addEventListener('click', processSale);
  document.getElementById('clearPosBtn')?.addEventListener('click', clearPOS);
  document.getElementById('refreshProductsBtn')?.addEventListener('click', loadPosProducts);
  document.getElementById('salesSearch')?.addEventListener('input', debounce(filterSales, 300));
  document.getElementById('salesDateFrom')?.addEventListener('change', filterSales);
  document.getElementById('salesDateTo')?.addEventListener('change', filterSales);
  setupModalClose('receiptModal');
  document.getElementById('printReceiptBtn')?.addEventListener('click', () => window.print());
}

async function voidSale(saleID, productID, quantity) {
  confirmDialog('Void Sale', 'Are you sure you want to void this sale? Stock will be restored.', async () => {
    const result = await API.deleteSale(saleID, productID, quantity);
    if (result.success) {
      Toast.success('Voided', 'Sale voided and stock restored.');
      await loadPosProducts();
      await loadSales();
    } else { Toast.error('Error', result.message); }
  });
}

// ===============================
// PRODUCTS
// ===============================

let allProducts = [];
let editingProduct = null;
let productPaginator = null;
let _productHandlersAttached = false;

async function initProducts() {
  if (!Auth.requireAdmin()) return;
  await loadProducts();
  if (!_productHandlersAttached) {
    _productHandlersAttached = true;
    setupProductModals();
    document.getElementById('productSearch')?.addEventListener('input', debounce(filterProducts, 300));
    document.getElementById('productStatusFilter')?.addEventListener('change', filterProducts);
    document.getElementById('addProductBtn')?.addEventListener('click', () => { if (Auth.isAdmin()) openAddProduct(); });
    document.querySelector('#productsView .refresh-btn')?.addEventListener('click', loadProducts);
  }
}

async function loadProducts() {
  showTableLoading('productsTableBody', 11);
  allProducts = [];
  const result = await API.getProducts();
  if (!result.success) { Toast.error('Error', result.message); return; }
  allProducts = result.data || [];
  productPaginator = null;
  filterProducts();
  updateProductCount();
}

function updateProductCount() {
  const el = document.getElementById('productCount');
  if (el) el.textContent = allProducts.length + ' products';
}

function filterProducts() {
  const query  = document.getElementById('productSearch')?.value || '';
  const status = document.getElementById('productStatusFilter')?.value || '';
  let filtered = filterItems(allProducts, query, ['RiceName', 'Brand', 'Grade', 'PackagingSize', 'ProductID']);
  if (status) filtered = filtered.filter(p => p.Status === status);
  if (!productPaginator) productPaginator = new Paginator('productPagination', filtered, CONFIG.ITEMS_PER_PAGE, renderProductsTable);
  else productPaginator.setItems(filtered);
  const countEl = document.getElementById('filteredCount');
  if (countEl) countEl.textContent = `Showing ${filtered.length} of ${allProducts.length}`;
}

function renderProductsTable(products) {
  const tbody = document.getElementById('productsTableBody');
  if (!tbody) return;
  if (!products || products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" style="padding:0"><div class="empty-state"><div class="empty-icon">🌾</div><p>No products found.</p></div></td></tr>`;
    return;
  }
  try {
    const isAdmin = Auth.isAdmin();
    tbody.innerHTML = products.map(p => `
      <tr>
        <td><span class="text-xs text-muted">${p.ProductID || '—'}</span></td>
        <td><strong>${p.RiceName || '—'}</strong></td>
        <td>${p.Brand || '—'}</td>
        <td>${p.Grade || '—'}</td>
        <td>${p.PackagingSize || '—'}</td>
        <td>${formatCurrency(p.CostPrice)}</td>
        <td><strong>${formatCurrency(p.SellingPrice)}</strong></td>
        <td>
          <div class="stock-indicator">
            <span style="font-weight:600">${formatWeight(p.CurrentStock)}</span>
          </div>
          ${stockBadge(p.CurrentStock, p.LowStockThreshold)}
        </td>
        <td>${formatWeight(p.LowStockThreshold)}</td>
        <td>${statusBadge(p.Status)}</td>
        <td>
          <div class="action-btns">
            <button class="btn btn-info btn-sm" onclick="viewProduct('${p.ProductID}')">👁️</button>
            ${isAdmin ? `
            <button class="btn btn-warning btn-sm" onclick="editProduct('${p.ProductID}')">✏️</button>
            <button class="btn btn-danger btn-sm" onclick="deleteProduct('${p.ProductID}','${(p.RiceName||'').replace(/'/g,"\\'")}')">🗑️</button>
            ` : ''}
          </div>
        </td>
      </tr>`).join('');
  } catch(err) {
    console.error('renderProductsTable error:', err);
    tbody.innerHTML = `<tr><td colspan="11"><div class="empty-state"><div class="empty-icon">⚠️</div><p>Error rendering products. Check console.</p></div></td></tr>`;
  }
}

function openAddProduct() {
  editingProduct = null;
  resetForm('productForm');
  document.getElementById('productModalTitle').textContent = 'Add Rice Product';
  document.getElementById('productID').value = '';
  document.getElementById('productStatus').value = 'Active';
  openModal('productModal');
}

function editProduct(id) {
  const p = allProducts.find(x => x.ProductID === id);
  if (!p) return;
  editingProduct = p;
  document.getElementById('productModalTitle').textContent = 'Edit Rice Product';
  document.getElementById('productID').value = p.ProductID;
  document.getElementById('productRiceName').value = p.RiceName;
  document.getElementById('productBrand').value = p.Brand;
  document.getElementById('productGrade').value = p.Grade;
  document.getElementById('productPackaging').value = p.PackagingSize;
  document.getElementById('productCostPrice').value = p.CostPrice;
  document.getElementById('productSellingPrice').value = p.SellingPrice;
  document.getElementById('productCurrentStock').value = p.CurrentStock;
  document.getElementById('productLowThreshold').value = p.LowStockThreshold;
  document.getElementById('productStatus').value = p.Status;
  openModal('productModal');
}

function viewProduct(id) {
  const p = allProducts.find(x => x.ProductID === id);
  if (!p) return;
  document.getElementById('viewProductContent').innerHTML = `
    <div class="form-grid form-grid-2" style="gap:1rem">
      ${infoRow('Product ID', p.ProductID)}
      ${infoRow('Rice Name', p.RiceName)}
      ${infoRow('Brand', p.Brand)}
      ${infoRow('Grade', p.Grade)}
      ${infoRow('Packaging Size', p.PackagingSize)}
      ${infoRow('Cost Price/kg', formatCurrency(p.CostPrice))}
      ${infoRow('Selling Price/kg', formatCurrency(p.SellingPrice))}
      ${infoRow('Current Stock', formatWeight(p.CurrentStock))}
      ${infoRow('Low Stock Threshold', formatWeight(p.LowStockThreshold))}
      ${infoRow('Status', statusBadge(p.Status))}
    </div>`;
  openModal('viewProductModal');
}

async function saveProduct() {
  const valid = validateRequired([
    { input: 'productRiceName', errorId: 'errRiceName', msg: 'Rice name is required.' },
    { input: 'productSellingPrice', errorId: 'errSellingPrice', msg: 'Selling price is required.' }
  ]);
  if (!valid) return;

  // Extra numeric validations
  const sellingPrice = parseFloat(document.getElementById('productSellingPrice').value) || 0;
  const costPrice    = parseFloat(document.getElementById('productCostPrice').value) || 0;
  const currentStock = parseFloat(document.getElementById('productCurrentStock').value) || 0;
  const threshold    = parseFloat(document.getElementById('productLowThreshold').value) || 0;
  if (sellingPrice <= 0) {
    const errEl = document.getElementById('errSellingPrice');
    if (errEl) { errEl.textContent = 'Selling price must be greater than zero.'; errEl.classList.add('show'); }
    return;
  }
  if (costPrice < 0) { Toast.warning('Invalid', 'Cost price cannot be negative.'); return; }
  if (currentStock < 0) { Toast.warning('Invalid', 'Current stock cannot be negative.'); return; }
  if (threshold < 0) { Toast.warning('Invalid', 'Low stock threshold cannot be negative.'); return; }
  const product = {
    productID: document.getElementById('productID').value,
    riceName: document.getElementById('productRiceName').value.trim(),
    brand: document.getElementById('productBrand').value.trim(),
    grade: document.getElementById('productGrade').value.trim(),
    packagingSize: document.getElementById('productPackaging').value.trim(),
    costPrice: parseFloat(document.getElementById('productCostPrice').value) || 0,
    sellingPrice: parseFloat(document.getElementById('productSellingPrice').value) || 0,
    currentStock: parseFloat(document.getElementById('productCurrentStock').value) || 0,
    lowStockThreshold: parseFloat(document.getElementById('productLowThreshold').value) || 10,
    status: document.getElementById('productStatus').value
  };
  const btn = document.getElementById('saveProductBtn');
  btn.disabled = true; btn.textContent = 'Saving…';
  const result = editingProduct ? await API.updateProduct(product) : await API.addProduct(product);
  btn.disabled = false; btn.textContent = 'Save Product';
  if (result.success) { Toast.success('Success', result.message); closeModal('productModal'); await loadProducts(); }
  else Toast.error('Error', result.message);
}

async function deleteProduct(id, name) {
  confirmDialog('Delete Product', `Are you sure you want to delete <strong>${name}</strong>?`, async () => {
    const result = await API.deleteProduct(id);
    if (result.success) { Toast.success('Deleted', `${name} has been removed.`); await loadProducts(); }
    else Toast.error('Error', result.message);
  });
}

function setupProductModals() {
  setupModalClose('productModal');
  setupModalClose('viewProductModal');
  document.getElementById('saveProductBtn')?.addEventListener('click', saveProduct);
}

// ===============================
// STOCK IN
// ===============================

let allStockIns = [];
let allProductsForStockIn = [];
let allSuppliersForStockIn = [];
let editingStockIn = null;
let stockInPaginator = null;
let _stockInHandlersAttached = false;

async function initStockIn() {
  if (!Auth.requireAdmin()) return;
  await Promise.all([loadStockIns(), loadProductsForStockInDropdown(), loadSuppliersForStockInDropdown()]);
  if (!_stockInHandlersAttached) {
    _stockInHandlersAttached = true;
    setupStockInModals();
    document.getElementById('stockInSearch')?.addEventListener('input', debounce(filterStockIns, 300));
    document.getElementById('stockInDateFrom')?.addEventListener('change', filterStockIns);
    document.getElementById('stockInDateTo')?.addEventListener('change', filterStockIns);
    document.getElementById('stockInProductFilter')?.addEventListener('change', filterStockIns);
    document.getElementById('addStockInBtn')?.addEventListener('click', openAddStockIn);
  }
}

async function loadStockIns() {
  showTableLoading('stockInTableBody', 10);
  allStockIns = [];
  const result = await API.getStockIns();
  if (!result.success) { Toast.error('Error', result.message); return; }
  allStockIns = (result.data || []).sort((a, b) => new Date(b.Date) - new Date(a.Date));
  stockInPaginator = null;
  filterStockIns();
}

async function loadProductsForStockInDropdown() {
  const result = await API.getProducts();
  if (!result.success) return;
  allProductsForStockIn = (result.data || []).filter(p => p.Status === 'Active');
  populateProductDropdown('siProductID', allProductsForStockIn);
  populateProductDropdown('stockInProductFilter', allProductsForStockIn, true);
}

async function loadSuppliersForStockInDropdown() {
  const result = await API.getSuppliers();
  if (!result.success) return;
  allSuppliersForStockIn = (result.data || []).filter(s => s.Status === 'Active');
  const sel = document.getElementById('siSupplierID');
  if (!sel) return;
  sel.innerHTML = '<option value="">-- Select Supplier --</option>' +
    allSuppliersForStockIn.map(s => `<option value="${s.SupplierID}" data-name="${s.SupplierName}">${s.SupplierName}</option>`).join('');
}

function populateProductDropdown(id, products, addAll = false) {
  const sel = document.getElementById(id);
  if (!sel) return;
  const prefix = addAll ? '<option value="">All Products</option>' : '<option value="">-- Select Product --</option>';
  sel.innerHTML = prefix + products.map(p =>
    `<option value="${p.ProductID}" data-name="${p.RiceName}" data-price="${p.SellingPrice}" data-stock="${p.CurrentStock}">${p.RiceName} (${formatWeight(p.CurrentStock)})</option>`
  ).join('');
}

function filterStockIns() {
  const query    = document.getElementById('stockInSearch')?.value || '';
  const dateFrom = document.getElementById('stockInDateFrom')?.value || '';
  const dateTo   = document.getElementById('stockInDateTo')?.value || '';
  const product  = document.getElementById('stockInProductFilter')?.value || '';
  let filtered = allStockIns;
  if (query)   filtered = filterItems(filtered, query, ['ProductName', 'SupplierName', 'StockInID', 'Remarks']);
  if (dateFrom) filtered = filtered.filter(r => r.Date >= dateFrom);
  if (dateTo)   filtered = filtered.filter(r => r.Date <= dateTo);
  if (product)  filtered = filtered.filter(r => r.ProductID === product);
  if (!stockInPaginator) stockInPaginator = new Paginator('stockInPagination', filtered, CONFIG.ITEMS_PER_PAGE, renderStockInTable);
  else stockInPaginator.setItems(filtered);
}

function renderStockInTable(records) {
  const tbody = document.getElementById('stockInTableBody');
  if (!tbody) return;
  if (!records || records.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10"><div class="empty-state"><div class="empty-icon">📦</div><p>No stock-in records found.</p></div></td></tr>`;
    return;
  }
  try {
    tbody.innerHTML = records.map(r => `
      <tr>
        <td><span class="text-xs text-muted">${r.StockInID || '—'}</span></td>
        <td><strong>${r.ProductName || '—'}</strong></td>
        <td>${r.SupplierName || '—'}</td>
        <td><strong>${formatWeight(r.Quantity)}</strong></td>
        <td>${formatCurrency(r.CostPerKg)}/kg</td>
        <td><strong>${formatCurrency(r.TotalCost)}</strong></td>
        <td>${r.Date || '—'}</td>
        <td>${r.Remarks || '—'}</td>
        <td>${statusBadge(r.Status)}</td>
        <td>
          <div class="action-btns">
            <button class="btn btn-warning btn-sm" onclick="editStockIn('${r.StockInID}')">✏️</button>
            <button class="btn btn-danger btn-sm" onclick="deleteStockIn('${r.StockInID}','${r.ProductID}',${parseFloat(r.Quantity)||0})">🗑️</button>
          </div>
        </td>
      </tr>`).join('');
  } catch(err) {
    console.error('renderStockInTable error:', err);
    tbody.innerHTML = `<tr><td colspan="10"><div class="empty-state"><div class="empty-icon">⚠️</div><p>Error rendering records.</p></div></td></tr>`;
  }
}

function openAddStockIn() {
  editingStockIn = null;
  resetForm('stockInForm');
  document.getElementById('stockInModalTitle').textContent = 'Add Stock-In';
  document.getElementById('siStockInID').value = '';
  document.getElementById('siDate').value = todayISO();
  updateStockInTotal();
  openModal('stockInModal');
}

function editStockIn(id) {
  const r = allStockIns.find(x => x.StockInID === id);
  if (!r) return;
  editingStockIn = r;
  document.getElementById('stockInModalTitle').textContent = 'Edit Stock-In';
  document.getElementById('siStockInID').value = r.StockInID;
  document.getElementById('siProductID').value = r.ProductID;
  document.getElementById('siSupplierID').value = r.SupplierID || '';
  document.getElementById('siQuantity').value = r.Quantity;
  document.getElementById('siCostPerKg').value = r.CostPerKg;
  document.getElementById('siDate').value = r.Date;
  document.getElementById('siRemarks').value = r.Remarks || '';
  updateStockInTotal();
  openModal('stockInModal');
}

function updateStockInTotal() {
  const qty  = parseFloat(document.getElementById('siQuantity')?.value) || 0;
  const cost = parseFloat(document.getElementById('siCostPerKg')?.value) || 0;
  const totalEl = document.getElementById('siTotalCost');
  if (totalEl) totalEl.textContent = formatCurrency(qty * cost);
}

async function saveStockIn() {
  const valid = validateRequired([
    { input: 'siProductID', errorId: 'errSiProduct', msg: 'Please select a product.' },
    { input: 'siQuantity',  errorId: 'errSiQty',     msg: 'Quantity is required.' }
  ]);
  if (!valid) return;
  const productSel   = document.getElementById('siProductID');
  const selectedOpt  = productSel.options[productSel.selectedIndex];
  const supplierSel  = document.getElementById('siSupplierID');
  const suppOpt      = supplierSel?.options[supplierSel.selectedIndex];
  const stockIn = {
    stockInID:    document.getElementById('siStockInID').value,
    productID:    productSel.value,
    productName:  selectedOpt?.dataset.name || selectedOpt?.text || '',
    supplierID:   supplierSel?.value || '',
    supplierName: suppOpt?.dataset.name || suppOpt?.text || '',
    quantity:     parseFloat(document.getElementById('siQuantity').value) || 0,
    costPerKg:    parseFloat(document.getElementById('siCostPerKg').value) || 0,
    date:         document.getElementById('siDate').value,
    remarks:      document.getElementById('siRemarks').value.trim()
  };
  const btn = document.getElementById('saveStockInBtn');
  btn.disabled = true; btn.textContent = 'Saving…';
  const result = editingStockIn ? await API.updateStockIn(stockIn, editingStockIn.Quantity) : await API.addStockIn(stockIn);
  btn.disabled = false; btn.textContent = 'Save';
  if (result.success) {
    Toast.success('Success', result.message);
    closeModal('stockInModal');
    await loadStockIns();
    await loadProductsForStockInDropdown();
  } else Toast.error('Error', result.message);
}

async function deleteStockIn(id, productID, quantity) {
  confirmDialog('Delete Stock-In', 'This will reverse the stock quantity. Are you sure?', async () => {
    const result = await API.deleteStockIn(id, productID, quantity);
    if (result.success) { Toast.success('Deleted', result.message); await loadStockIns(); }
    else Toast.error('Error', result.message);
  });
}

function setupStockInModals() {
  setupModalClose('stockInModal');
  document.getElementById('saveStockInBtn')?.addEventListener('click', saveStockIn);
  document.getElementById('siQuantity')?.addEventListener('input', updateStockInTotal);
  document.getElementById('siCostPerKg')?.addEventListener('input', updateStockInTotal);
}

// ===============================
// SUPPLIERS
// ===============================

let allSuppliers = [];
let editingSupplier = null;
let supplierPaginator = null;
let _supplierHandlersAttached = false;

async function initSuppliers() {
  if (!Auth.requireAdmin()) return;
  await loadSuppliers();
  if (!_supplierHandlersAttached) {
    _supplierHandlersAttached = true;
    setupSupplierModals();
    document.getElementById('supplierSearch')?.addEventListener('input', debounce(filterSuppliers, 300));
    document.getElementById('supplierStatusFilter')?.addEventListener('change', filterSuppliers);
    document.getElementById('addSupplierBtn')?.addEventListener('click', openAddSupplier);
  }
}

async function loadSuppliers() {
  showTableLoading('suppliersTableBody', 7);
  const result = await API.getSuppliers();
  if (!result.success) { Toast.error('Error', result.message); return; }
  allSuppliers = result.data || [];
  supplierPaginator = null;
  filterSuppliers();
  updateSupplierCount();
}

function updateSupplierCount() {
  const el = document.getElementById('supplierCount');
  if (el) el.textContent = allSuppliers.length + ' suppliers';
}

function filterSuppliers() {
  const query  = document.getElementById('supplierSearch')?.value || '';
  const status = document.getElementById('supplierStatusFilter')?.value || '';
  let filtered = filterItems(allSuppliers, query, ['SupplierName', 'ContactNumber', 'Address', 'ProductsSupplied', 'SupplierID']);
  if (status) filtered = filtered.filter(s => s.Status === status);
  if (!supplierPaginator) supplierPaginator = new Paginator('supplierPagination', filtered, CONFIG.ITEMS_PER_PAGE, renderSuppliersTable);
  else supplierPaginator.setItems(filtered);
}

function renderSuppliersTable(suppliers) {
  const tbody = document.getElementById('suppliersTableBody');
  if (!tbody) return;
  if (suppliers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">🏪</div><p>No suppliers found.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = suppliers.map(s => `
    <tr>
      <td><span class="text-xs text-muted">${s.SupplierID}</span></td>
      <td><strong>${s.SupplierName}</strong></td>
      <td>${s.ContactNumber || '—'}</td>
      <td>${s.Address || '—'}</td>
      <td><span class="text-sm">${s.ProductsSupplied || '—'}</span></td>
      <td>${statusBadge(s.Status)}</td>
      <td>
        <div class="action-btns">
          <button class="btn btn-warning btn-sm" onclick="editSupplier('${s.SupplierID}')">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="deleteSupplier('${s.SupplierID}','${s.SupplierName}')">🗑️</button>
        </div>
      </td>
    </tr>`).join('');
}

function openAddSupplier() {
  editingSupplier = null;
  resetForm('supplierForm');
  document.getElementById('supplierModalTitle').textContent = 'Add Supplier';
  document.getElementById('supplierID').value = '';
  document.getElementById('supplierStatusField').value = 'Active';
  openModal('supplierModal');
}

function editSupplier(id) {
  const s = allSuppliers.find(x => x.SupplierID === id);
  if (!s) return;
  editingSupplier = s;
  document.getElementById('supplierModalTitle').textContent = 'Edit Supplier';
  document.getElementById('supplierID').value = s.SupplierID;
  document.getElementById('supplierName').value = s.SupplierName;
  document.getElementById('supplierContact').value = s.ContactNumber;
  document.getElementById('supplierAddress').value = s.Address;
  document.getElementById('supplierProducts').value = s.ProductsSupplied;
  document.getElementById('supplierStatusField').value = s.Status;
  openModal('supplierModal');
}

async function saveSupplier() {
  const valid = validateRequired([{ input: 'supplierName', errorId: 'errSupplierName', msg: 'Supplier name is required.' }]);
  if (!valid) return;
  const supplier = {
    supplierID:       document.getElementById('supplierID').value,
    name:             document.getElementById('supplierName').value.trim(),
    contactNumber:    document.getElementById('supplierContact').value.trim(),
    address:          document.getElementById('supplierAddress').value.trim(),
    productsSupplied: document.getElementById('supplierProducts').value.trim(),
    status:           document.getElementById('supplierStatusField').value
  };
  const btn = document.getElementById('saveSupplierBtn');
  btn.disabled = true; btn.textContent = 'Saving…';
  const result = editingSupplier ? await API.updateSupplier(supplier) : await API.addSupplier(supplier);
  btn.disabled = false; btn.textContent = 'Save Supplier';
  if (result.success) { Toast.success('Success', result.message); closeModal('supplierModal'); await loadSuppliers(); }
  else Toast.error('Error', result.message);
}

async function deleteSupplier(id, name) {
  confirmDialog('Delete Supplier', `Remove <strong>${name}</strong> from the system?`, async () => {
    const result = await API.deleteSupplier(id);
    if (result.success) { Toast.success('Deleted', result.message); await loadSuppliers(); }
    else Toast.error('Error', result.message);
  });
}

function setupSupplierModals() {
  setupModalClose('supplierModal');
  document.getElementById('saveSupplierBtn')?.addEventListener('click', saveSupplier);
}

// ===============================
// SPOILAGE
// ===============================

let allSpoilage = [];
let editingSpoilage = null;
let allProductsForSpoilage = [];
let spoilagePaginator = null;
let _spoilageHandlersAttached = false;

async function initSpoilage() {
  if (!Auth.requireAdmin()) return;
  await Promise.all([loadSpoilage(), loadProductsForSpoilageDropdown()]);
  if (!_spoilageHandlersAttached) {
    _spoilageHandlersAttached = true;
    setupSpoilageModals();
    document.getElementById('spoilageSearch')?.addEventListener('input', debounce(filterSpoilage, 300));
    document.getElementById('spoilageDateFrom')?.addEventListener('change', filterSpoilage);
    document.getElementById('spoilageDateTo')?.addEventListener('change', filterSpoilage);
    document.getElementById('addSpoilageBtn')?.addEventListener('click', openAddSpoilage);
  }
}

async function loadSpoilage() {
  showTableLoading('spoilageTableBody', 8);
  const result = await API.getSpoilage();
  if (!result.success) { Toast.error('Error', result.message); return; }
  allSpoilage = (result.data || []).sort((a, b) => new Date(b.Date) - new Date(a.Date));
  spoilagePaginator = null;
  filterSpoilage();
}

async function loadProductsForSpoilageDropdown() {
  const result = await API.getProducts();
  if (!result.success) return;
  allProductsForSpoilage = (result.data || []).filter(p => p.Status === 'Active');
  const sel = document.getElementById('sploProductID');
  if (!sel) return;
  sel.innerHTML = '<option value="">-- Select Product --</option>' +
    allProductsForSpoilage.map(p =>
      `<option value="${p.ProductID}" data-name="${p.RiceName}" data-stock="${p.CurrentStock}">${p.RiceName} (${formatWeight(p.CurrentStock)})</option>`
    ).join('');
}

function filterSpoilage() {
  const query    = document.getElementById('spoilageSearch')?.value || '';
  const dateFrom = document.getElementById('spoilageDateFrom')?.value || '';
  const dateTo   = document.getElementById('spoilageDateTo')?.value || '';
  let filtered = allSpoilage;
  if (query)    filtered = filterItems(filtered, query, ['ProductName', 'Reason', 'SpoilageID']);
  if (dateFrom) filtered = filtered.filter(r => r.Date >= dateFrom);
  if (dateTo)   filtered = filtered.filter(r => r.Date <= dateTo);
  if (!spoilagePaginator) spoilagePaginator = new Paginator('spoilagePagination', filtered, CONFIG.ITEMS_PER_PAGE, renderSpoilageTable);
  else spoilagePaginator.setItems(filtered);
  const totalEl = document.getElementById('totalSpoilageKg');
  if (totalEl) { const total = filtered.reduce((s, r) => s + (parseFloat(r.Quantity) || 0), 0); totalEl.textContent = formatWeight(total); }
}

function renderSpoilageTable(records) {
  const tbody = document.getElementById('spoilageTableBody');
  if (!tbody) return;
  if (records.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">🗑️</div><p>No spoilage records found.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = records.map(r => `
    <tr>
      <td><span class="text-xs text-muted">${r.SpoilageID}</span></td>
      <td><strong>${r.ProductName}</strong></td>
      <td><strong style="color:var(--danger)">${formatWeight(r.Quantity)}</strong></td>
      <td>${r.Reason || '—'}</td>
      <td>${r.Date}</td>
      <td>${r.Remarks || '—'}</td>
      <td>${statusBadge(r.Status)}</td>
      <td>
        <div class="action-btns">
          <button class="btn btn-warning btn-sm" onclick="editSpoilage('${r.SpoilageID}')">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="deleteSpoilage('${r.SpoilageID}','${r.ProductID}',${r.Quantity})">🗑️</button>
        </div>
      </td>
    </tr>`).join('');
}

function openAddSpoilage() {
  editingSpoilage = null;
  resetForm('spoilageForm');
  document.getElementById('spoilageModalTitle').textContent = 'Record Spoilage';
  document.getElementById('spoilageID').value = '';
  document.getElementById('sploDate').value = todayISO();
  document.getElementById('availableStockDisplay').textContent = '';
  openModal('spoilageModal');
}

function editSpoilage(id) {
  const r = allSpoilage.find(x => x.SpoilageID === id);
  if (!r) return;
  editingSpoilage = r;
  document.getElementById('spoilageModalTitle').textContent = 'Edit Spoilage Record';
  document.getElementById('spoilageID').value = r.SpoilageID;
  document.getElementById('sploProductID').value = r.ProductID;
  document.getElementById('sploQuantity').value = r.Quantity;
  document.getElementById('sploReason').value = r.Reason;
  document.getElementById('sploDate').value = r.Date;
  document.getElementById('sploRemarks').value = r.Remarks || '';
  const sel = document.getElementById('sploProductID');
  updateAvailableStockDisplay(sel.options[sel.selectedIndex]);
  openModal('spoilageModal');
}

function updateAvailableStockDisplay(option) {
  const displayEl = document.getElementById('availableStockDisplay');
  if (!displayEl) return;
  if (option && option.value) {
    const stock = option.dataset.stock || 0;
    displayEl.textContent = 'Available: ' + formatWeight(stock);
    displayEl.style.color = parseFloat(stock) <= 0 ? 'var(--danger)' : 'var(--success)';
  } else { displayEl.textContent = ''; }
}

async function saveSpoilage() {
  const valid = validateRequired([
    { input: 'sploProductID', errorId: 'errSploProduct', msg: 'Please select a product.' },
    { input: 'sploQuantity',  errorId: 'errSploQty',     msg: 'Quantity is required.' },
    { input: 'sploReason',    errorId: 'errSploReason',  msg: 'Reason is required.' }
  ]);
  if (!valid) return;
  const productSel = document.getElementById('sploProductID');
  const opt = productSel.options[productSel.selectedIndex];
  const spoilage = {
    spoilageID:  document.getElementById('spoilageID').value,
    productID:   productSel.value,
    productName: opt?.dataset.name || '',
    quantity:    parseFloat(document.getElementById('sploQuantity').value) || 0,
    reason:      document.getElementById('sploReason').value,
    date:        document.getElementById('sploDate').value,
    remarks:     document.getElementById('sploRemarks').value.trim()
  };
  const btn = document.getElementById('saveSpoilageBtn');
  btn.disabled = true; btn.textContent = 'Saving…';
  const result = editingSpoilage ? await API.updateSpoilage(spoilage, editingSpoilage.Quantity) : await API.addSpoilage(spoilage);
  btn.disabled = false; btn.textContent = 'Save';
  if (result.success) {
    Toast.success('Recorded', result.message);
    closeModal('spoilageModal');
    await loadSpoilage();
    await loadProductsForSpoilageDropdown();
  } else Toast.error('Error', result.message);
}

async function deleteSpoilage(id, productID, quantity) {
  confirmDialog('Delete Spoilage Record', 'This will restore the stock quantity. Continue?', async () => {
    const result = await API.deleteSpoilage(id, productID, quantity);
    if (result.success) { Toast.success('Deleted', result.message); await loadSpoilage(); }
    else Toast.error('Error', result.message);
  });
}

function setupSpoilageModals() {
  setupModalClose('spoilageModal');
  document.getElementById('saveSpoilageBtn')?.addEventListener('click', saveSpoilage);
  document.getElementById('sploProductID')?.addEventListener('change', function() {
    updateAvailableStockDisplay(this.options[this.selectedIndex]);
  });
}

// ===============================
// REPORTS
// ===============================

let reportGenerated = false;
let _reportsHandlersAttached = false;

async function initReports() {
  if (!Auth.requireAdmin()) return;
  if (!_reportsHandlersAttached) {
    _reportsHandlersAttached = true;
    const today = todayISO();
    const firstOfMonth = today.substring(0, 7) + '-01';
    const fromEl = document.getElementById('reportDateFrom');
    const toEl   = document.getElementById('reportDateTo');
    if (fromEl && !fromEl.value) fromEl.value = firstOfMonth;
    if (toEl && !toEl.value) toEl.value = today;
    document.getElementById('generateReportBtn')?.addEventListener('click', loadReports);
    document.getElementById('exportReportBtn')?.addEventListener('click', exportReport);
  }
  await loadReports();
}

async function loadReports() {
  const dateFrom = document.getElementById('reportDateFrom')?.value || '';
  const dateTo   = document.getElementById('reportDateTo')?.value || '';
  const loadingEl = document.getElementById('reportLoading');
  const contentEl = document.getElementById('reportContent');
  if (loadingEl) loadingEl.style.display = 'block';
  if (contentEl) contentEl.style.display = 'none';
  const result = await API.getReports('all', dateFrom, dateTo);
  if (loadingEl) loadingEl.style.display = 'none';
  if (contentEl) contentEl.style.display = 'block';
  if (!result.success) { Toast.error('Error', result.message); return; }
  reportGenerated = true;
  const d = result.data;
  renderReportSummary(d.summary);
  renderSalesReport(d.sales);
  renderStockInReport(d.stockIns);
  renderSpoilageReport(d.spoilage);
}

function renderReportSummary(s) {
  setText('#rptTotalRevenue', formatCurrency(s.totalRevenue));
  setText('#rptTotalCost',    formatCurrency(s.totalCost));
  setText('#rptGrossProfit',  formatCurrency(s.grossProfit));
  setText('#rptSalesCount',   s.salesCount + ' transactions');
  setText('#rptSpoilageKg',   formatWeight(s.totalSpoilageKg));
  const profitEl = document.getElementById('rptGrossProfit');
  if (profitEl) profitEl.style.color = s.grossProfit >= 0 ? 'var(--success)' : 'var(--danger)';
}

function renderSalesReport(sales) {
  const tbody = document.getElementById('salesReportBody');
  if (!tbody) return;
  if (!sales || sales.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted" style="padding:1.5rem">No sales in this period.</td></tr>';
    return;
  }
  const grouped = {};
  sales.forEach(s => {
    if (!grouped[s.ProductName]) grouped[s.ProductName] = { qty: 0, revenue: 0, count: 0 };
    grouped[s.ProductName].qty     += parseFloat(s.Quantity) || 0;
    grouped[s.ProductName].revenue += parseFloat(s.Subtotal) || 0;
    grouped[s.ProductName].count++;
  });
  tbody.innerHTML = Object.entries(grouped).sort((a, b) => b[1].revenue - a[1].revenue).map(([name, data], i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${name}</strong></td>
      <td>${formatWeight(data.qty)}</td>
      <td>${data.count}</td>
      <td><strong>${formatCurrency(data.revenue)}</strong></td>
      <td>${formatCurrency(data.count > 0 ? data.revenue / data.count : 0)}</td>
    </tr>`).join('');
}

function renderStockInReport(stockIns) {
  const tbody = document.getElementById('stockInReportBody');
  if (!tbody) return;
  if (!stockIns || stockIns.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted" style="padding:1.5rem">No stock-in in this period.</td></tr>';
    return;
  }
  const grouped = {};
  stockIns.forEach(s => {
    if (!grouped[s.ProductName]) grouped[s.ProductName] = { qty: 0, cost: 0 };
    grouped[s.ProductName].qty  += parseFloat(s.Quantity) || 0;
    grouped[s.ProductName].cost += parseFloat(s.TotalCost) || 0;
  });
  tbody.innerHTML = Object.entries(grouped).sort((a, b) => b[1].cost - a[1].cost).map(([name, data], i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${name}</strong></td>
      <td>${formatWeight(data.qty)}</td>
      <td><strong>${formatCurrency(data.cost)}</strong></td>
      <td>${formatCurrency(data.qty > 0 ? data.cost / data.qty : 0)}/kg</td>
    </tr>`).join('');
}

function renderSpoilageReport(spoilage) {
  const tbody = document.getElementById('spoilageReportBody');
  if (!tbody) return;
  if (!spoilage || spoilage.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted" style="padding:1.5rem">No spoilage in this period.</td></tr>';
    return;
  }
  const grouped = {};
  spoilage.forEach(s => {
    if (!grouped[s.ProductName]) grouped[s.ProductName] = { qty: 0, count: 0 };
    grouped[s.ProductName].qty += parseFloat(s.Quantity) || 0;
    grouped[s.ProductName].count++;
  });
  tbody.innerHTML = Object.entries(grouped).sort((a, b) => b[1].qty - a[1].qty).map(([name, data], i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${name}</strong></td>
      <td style="color:var(--danger);font-weight:700">${formatWeight(data.qty)}</td>
      <td>${data.count}</td>
    </tr>`).join('');
}

function exportReport() {
  if (!reportGenerated) { Toast.warning('No Report', 'Please generate a report first.'); return; }
  window.print();
}

// ===============================
// AUDIT LOGS
// ===============================

let allAuditLogs = [];
let auditPaginator = null;
let _auditHandlersAttached = false;

async function initAudit() {
  if (!Auth.requireAdmin()) return;
  await loadAuditLogs();
  if (!_auditHandlersAttached) {
    _auditHandlersAttached = true;
    document.getElementById('auditSearch')?.addEventListener('input', debounce(filterAudit, 300));
    document.getElementById('auditActionFilter')?.addEventListener('change', filterAudit);
    document.getElementById('auditRoleFilter')?.addEventListener('change', filterAudit);
    document.getElementById('auditDateFrom')?.addEventListener('change', filterAudit);
    document.getElementById('auditDateTo')?.addEventListener('change', filterAudit);
    document.getElementById('refreshAuditBtn')?.addEventListener('click', loadAuditLogs);
    document.getElementById('exportAuditBtn')?.addEventListener('click', exportAuditCSV);
  }
}

async function loadAuditLogs() {
  showTableLoading('auditTableBody', 7);
  const result = await API.getAuditLogs();
  if (!result.success) { Toast.error('Error', result.message); return; }
  allAuditLogs = result.data || [];
  auditPaginator = null;
  filterAudit();
  setText('#auditCount', allAuditLogs.length + ' records');
}

function filterAudit() {
  const query    = document.getElementById('auditSearch')?.value || '';
  const action   = document.getElementById('auditActionFilter')?.value || '';
  const role     = document.getElementById('auditRoleFilter')?.value || '';
  const dateFrom = document.getElementById('auditDateFrom')?.value || '';
  const dateTo   = document.getElementById('auditDateTo')?.value || '';
  let filtered = allAuditLogs;
  if (query)    filtered = filterItems(filtered, query, ['Username', 'Action', 'Description', 'LogID']);
  if (action)   filtered = filtered.filter(l => l.Action === action);
  if (role)     filtered = filtered.filter(l => l.Role === role);
  if (dateFrom) filtered = filtered.filter(l => String(l.Date) >= dateFrom);
  if (dateTo)   filtered = filtered.filter(l => String(l.Date) <= dateTo);
  if (!auditPaginator) auditPaginator = new Paginator('auditPagination', filtered, 20, renderAuditTable);
  else auditPaginator.setItems(filtered);
  setText('#filteredAuditCount', `Showing ${filtered.length} of ${allAuditLogs.length}`);
}

function renderAuditTable(logs) {
  const tbody = document.getElementById('auditTableBody');
  if (!tbody) return;
  if (logs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📋</div><p>No audit records found.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = logs.map(l => `
    <tr>
      <td><span class="text-xs text-muted">${l.LogID}</span></td>
      <td><div style="font-weight:600">${l.Username}</div><div class="text-xs text-muted">${l.UserID}</div></td>
      <td><span class="badge ${l.Role === 'Admin' ? 'badge-primary' : 'badge-info'}">${l.Role}</span></td>
      <td>${getActionBadge(l.Action)}</td>
      <td class="text-sm">${l.Description}</td>
      <td class="text-sm">${l.Date}</td>
      <td class="text-sm">${l.Time}</td>
    </tr>`).join('');
}

function getActionBadge(action) {
  const dangerActions  = ['DELETE_PRODUCT','DELETE_SALE','DELETE_USER','DELETE_SUPPLIER','DELETE_SPOILAGE','DELETE_STOCK_IN','ACCOUNT_LOCKED'];
  const successActions = ['LOGIN','ADD_PRODUCT','STOCK_IN','SALE','ADD_USER','ADD_SUPPLIER'];
  const warningActions = ['FAILED_LOGIN','UPDATE_PRODUCT','UPDATE_USER','SPOILAGE'];
  const infoActions    = ['LOGOUT','CHANGE_PASSWORD','RESET_PASSWORD'];
  let cls = 'badge-gray';
  if (dangerActions.includes(action))  cls = 'badge-danger';
  else if (successActions.includes(action)) cls = 'badge-success';
  else if (warningActions.includes(action)) cls = 'badge-warning';
  else if (infoActions.includes(action)) cls = 'badge-info';
  return `<span class="badge ${cls}" style="font-size:0.65rem">${action.replace(/_/g,' ')}</span>`;
}

function exportAuditCSV() {
  if (allAuditLogs.length === 0) { Toast.warning('No Data', 'No audit logs to export.'); return; }
  const headers = ['LogID','UserID','Username','Role','Action','Description','Date','Time'];
  const rows = allAuditLogs.map(l => [
    l.LogID, l.UserID, l.Username, l.Role, l.Action,
    '"' + String(l.Description).replace(/"/g,'""') + '"',
    l.Date, l.Time
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `diamond-store-audit-${todayISO()}.csv`; a.click();
  URL.revokeObjectURL(url);
  Toast.success('Exported', 'Audit logs downloaded as CSV.');
}

// ===============================
// USERS
// ===============================

let allUsers = [];
let editingUser = null;
let userPaginator = null;
let _userHandlersAttached = false;

async function initUsers() {
  if (!Auth.requireAdmin()) return;
  await loadUsers();
  if (!_userHandlersAttached) {
    _userHandlersAttached = true;
    setupUserModals();
    document.getElementById('userSearch')?.addEventListener('input', debounce(filterUsers, 300));
    document.getElementById('userRoleFilter')?.addEventListener('change', filterUsers);
    document.getElementById('addUserBtn')?.addEventListener('click', openAddUser);
    document.getElementById('openChangePasswordBtn')?.addEventListener('click', () => openModal('changePasswordModal'));
  }
}

async function loadUsers() {
  showTableLoading('usersTableBody', 7);
  const result = await API.getUsers();
  if (!result.success) { Toast.error('Error', result.message); return; }
  allUsers = result.data || [];
  userPaginator = null;
  filterUsers();
  setText('#userCount', allUsers.length + ' users');
}

function filterUsers() {
  const query = document.getElementById('userSearch')?.value || '';
  const role  = document.getElementById('userRoleFilter')?.value || '';
  let filtered = filterItems(allUsers, query, ['Username', 'FullName', 'Email', 'Role', 'UserID']);
  if (role) filtered = filtered.filter(u => u.Role === role);
  if (!userPaginator) userPaginator = new Paginator('userPagination', filtered, CONFIG.ITEMS_PER_PAGE, renderUsersTable);
  else userPaginator.setItems(filtered);
}

function renderUsersTable(users) {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;
  const currentUser = Auth.getUser();
  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">👥</div><p>No users found.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = users.map(u => {
    const isSelf = u.UserID === currentUser?.userID;
    return `
      <tr ${isSelf ? 'style="background:#f0fdf4"' : ''}>
        <td><span class="text-xs text-muted">${u.UserID}</span></td>
        <td>
          <div style="display:flex;align-items:center;gap:0.5rem">
            <div style="width:32px;height:32px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;flex-shrink:0">${(u.FullName || u.Username)[0].toUpperCase()}</div>
            <div><div style="font-weight:600">${u.FullName}</div><div class="text-xs text-muted">@${u.Username}</div></div>
          </div>
        </td>
        <td>${u.Email || '—'}</td>
        <td>
          <span class="badge ${u.Role === 'Admin' ? 'badge-primary' : 'badge-info'}">${u.Role}</span>
          ${isSelf ? '<span class="badge badge-gray" style="margin-left:4px">You</span>' : ''}
        </td>
        <td>${statusBadge(u.Status)}</td>
        <td>${u.FailedAttempts || 0}</td>
        <td>
          <div class="action-btns">
            <button class="btn btn-warning btn-sm" onclick="editUser('${u.UserID}')">✏️</button>
            <button class="btn btn-info btn-sm" onclick="openResetPassword('${u.UserID}','${u.Username}')">🔑</button>
            ${!isSelf ? `<button class="btn btn-danger btn-sm" onclick="deleteUser('${u.UserID}','${u.Username}')">🗑️</button>` : ''}
          </div>
        </td>
      </tr>`;
  }).join('');
}

function openAddUser() {
  editingUser = null;
  resetForm('userForm');
  document.getElementById('userModalTitle').textContent = 'Add User';
  document.getElementById('editUserID').value = '';
  document.getElementById('userPasswordGroup').style.display = 'block';
  document.getElementById('userPassword').required = true;
  openModal('userModal');
}

function editUser(id) {
  const u = allUsers.find(x => x.UserID === id);
  if (!u) return;
  editingUser = u;
  document.getElementById('userModalTitle').textContent = 'Edit User';
  document.getElementById('editUserID').value = u.UserID;
  document.getElementById('userFullName').value = u.FullName;
  document.getElementById('userUsername').value = u.Username;
  document.getElementById('userEmail').value = u.Email || '';
  document.getElementById('userRole').value = u.Role;
  document.getElementById('userStatus').value = u.Status;
  document.getElementById('userPasswordGroup').style.display = 'none';
  document.getElementById('userPassword').required = false;
  openModal('userModal');
}

async function saveUser() {
  const fields = [
    { input: 'userFullName', errorId: 'errUserFullName', msg: 'Full name is required.' },
    { input: 'userUsername', errorId: 'errUserUsername', msg: 'Username is required.' }
  ];
  if (!editingUser) fields.push({ input: 'userPassword', errorId: 'errUserPassword', msg: 'Password is required.' });
  if (!validateRequired(fields)) return;
  const btn = document.getElementById('saveUserBtn');
  btn.disabled = true; btn.textContent = 'Saving…';
  let result;
  if (editingUser) {
    result = await API.updateUser({
      userID:   document.getElementById('editUserID').value,
      fullName: document.getElementById('userFullName').value.trim(),
      role:     document.getElementById('userRole').value,
      email:    document.getElementById('userEmail').value.trim(),
      status:   document.getElementById('userStatus').value
    });
  } else {
    result = await API.addUser({
      username: document.getElementById('userUsername').value.trim(),
      password: document.getElementById('userPassword').value,
      fullName: document.getElementById('userFullName').value.trim(),
      role:     document.getElementById('userRole').value,
      email:    document.getElementById('userEmail').value.trim()
    });
  }
  btn.disabled = false; btn.textContent = 'Save User';
  if (result.success) { Toast.success('Success', result.message); closeModal('userModal'); await loadUsers(); }
  else Toast.error('Error', result.message);
}

function openResetPassword(id, username) {
  document.getElementById('resetUserID').value = id;
  document.getElementById('resetPasswordFor').textContent = username;
  document.getElementById('newPasswordInput').value = '';
  document.getElementById('confirmNewPassword').value = '';
  openModal('resetPasswordModal');
}

async function resetPassword() {
  const newPwd    = document.getElementById('newPasswordInput').value;
  const confirmPwd = document.getElementById('confirmNewPassword').value;
  if (!newPwd || newPwd.length < 6) { Toast.warning('Invalid', 'Password must be at least 6 characters.'); return; }
  if (newPwd !== confirmPwd) { Toast.warning('Mismatch', 'Passwords do not match.'); return; }
  const btn = document.getElementById('resetPasswordBtn');
  btn.disabled = true; btn.textContent = 'Resetting…';
  const result = await API.resetUserPassword(document.getElementById('resetUserID').value, newPwd);
  btn.disabled = false; btn.textContent = 'Reset Password';
  if (result.success) { Toast.success('Done', result.message); closeModal('resetPasswordModal'); await loadUsers(); }
  else Toast.error('Error', result.message);
}

async function deleteUser(id, username) {
  confirmDialog('Delete User', `Remove user <strong>${username}</strong>? They will no longer be able to log in.`, async () => {
    const result = await API.deleteUser(id);
    if (result.success) { Toast.success('Deleted', result.message); await loadUsers(); }
    else Toast.error('Error', result.message);
  });
}

async function changeOwnPassword() {
  const current = document.getElementById('currentPassword').value;
  const newPwd  = document.getElementById('newOwnPassword').value;
  const confirm = document.getElementById('confirmOwnPassword').value;
  if (!current || !newPwd) { Toast.warning('Required', 'All fields are required.'); return; }
  if (newPwd.length < 6)   { Toast.warning('Invalid', 'New password must be at least 6 characters.'); return; }
  if (newPwd !== confirm)  { Toast.warning('Mismatch', 'Passwords do not match.'); return; }
  const user = Auth.getUser();
  const btn = document.getElementById('changeOwnPwdBtn');
  btn.disabled = true; btn.textContent = 'Saving…';
  const result = await API.changePassword(user.userID, current, newPwd);
  btn.disabled = false; btn.textContent = 'Change Password';
  if (result.success) { Toast.success('Done', result.message); closeModal('changePasswordModal'); document.getElementById('changePasswordForm')?.reset(); }
  else Toast.error('Error', result.message);
}

function setupUserModals() {
  setupModalClose('userModal');
  setupModalClose('resetPasswordModal');
  setupModalClose('changePasswordModal');
  document.getElementById('saveUserBtn')?.addEventListener('click', saveUser);
  document.getElementById('resetPasswordBtn')?.addEventListener('click', resetPassword);
  document.getElementById('changeOwnPwdBtn')?.addEventListener('click', changeOwnPassword);
}

// ===============================
// SPA BOOTSTRAP
// ===============================

document.addEventListener('DOMContentLoaded', function () {
  // Login form handlers
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Eye toggle
  document.getElementById('eyeBtn')?.addEventListener('click', function () {
    const f = document.getElementById('loginPassword');
    const show = f.type === 'password';
    f.type = show ? 'text' : 'password';
    this.textContent = show ? '🙈' : '👁️';
  });

  // Sidebar nav items
  document.querySelectorAll('.nav-item[data-section]').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.section));
  });

  // Dashboard quick action buttons
  document.getElementById('dashRefreshBtn')?.addEventListener('click', loadDashboard);

  // Sync attempt bar from storage
  syncBar();

  // Start on step 1
  showStep(1);

  // Route on load
  if (Auth.isLoggedIn()) {
    showAppShell();
    initProtectedPage();
    navigateTo('dashboard');
  } else {
    showLoginView();
    document.getElementById('loginUsername')?.focus();
    if (isLocked()) startCooldown();
  }
});

// ===============================
// LOGIN PAGE LOGIC
// ===============================

// ── Brute-force protection (localStorage = survives page reload) ──
const MAX_ATTEMPTS = 5;
const COOLDOWN_MS  = 30 * 1000;
const BF_KEY       = 'ds_bf';

function getBF()   { try { return JSON.parse(localStorage.getItem(BF_KEY)) || {n:0,until:0}; } catch { return {n:0,until:0}; } }
function saveBF(s) { localStorage.setItem(BF_KEY, JSON.stringify(s)); }
function isLocked()  { return getBF().until > Date.now(); }
function secsLeft()  { return Math.max(0, Math.ceil((getBF().until - Date.now()) / 1000)); }

function recordFail() {
  const s = getBF(); s.n++;
  if (s.n >= MAX_ATTEMPTS) s.until = Date.now() + COOLDOWN_MS;
  saveBF(s); syncBar();
}
function resetBF() { saveBF({n:0,until:0}); syncBar(); }

function syncBar() {
  const s    = getBF();
  const wrap = document.getElementById('attemptWrap');
  const fill = document.getElementById('attemptFill');
  const txt  = document.getElementById('attemptText');
  if (s.n > 0) {
    if (wrap) wrap.style.display = 'block';
    if (fill) fill.style.width = Math.min(100, (s.n / MAX_ATTEMPTS) * 100) + '%';
    if (txt)  txt.textContent  = s.n + ' / ' + MAX_ATTEMPTS;
  } else {
    if (wrap) wrap.style.display = 'none';
  }
}

let cooldownTimer = null;
function startCooldown() {
  const box = document.getElementById('cooldownBox');
  const sec = document.getElementById('cooldownSecs');
  const btn = document.getElementById('loginBtn');
  if (box) box.style.display = 'block';
  if (btn) btn.disabled = true;
  clearInterval(cooldownTimer);
  cooldownTimer = setInterval(function () {
    const s = secsLeft();
    if (sec) sec.textContent = s + 's';
    if (s <= 0) {
      clearInterval(cooldownTimer);
      if (box) box.style.display = 'none';
      if (btn) btn.disabled = false;
      resetBF();
    }
  }, 400);
}

function showLoginErr(msg) {
  const alertMsg = document.getElementById('alertMsg');
  const alertErr = document.getElementById('alertError');
  if (alertMsg) alertMsg.textContent = msg;
  if (alertErr) { alertErr.style.display = 'flex'; }
  document.getElementById('loginUsername')?.classList.add('err');
  document.getElementById('loginPassword')?.classList.add('err');
}
function hideLoginErr() {
  const alertErr = document.getElementById('alertError');
  if (alertErr) alertErr.style.display = 'none';
  document.getElementById('loginUsername')?.classList.remove('err');
  document.getElementById('loginPassword')?.classList.remove('err');
}

// ── Step management ───────────────────────────────────────────
function showStep(n) {
  document.getElementById('loginStep1').style.display = n === 1 ? 'block' : 'none';
  document.getElementById('loginStep2').style.display = n === 2 ? 'block' : 'none';
  document.getElementById('loginStep3').style.display = n === 3 ? 'block' : 'none';
}

async function handleLogin(e) {
  if (e) e.preventDefault();
  hideLoginErr();
  if (isLocked()) { startCooldown(); return; }

  const u = document.getElementById('loginUsername').value.trim();
  const p = document.getElementById('loginPassword').value;
  if (!u || !p) { showLoginErr('Please enter your username and password.'); return; }

  const btn = document.getElementById('loginBtn');
  btn.disabled = true;
  btn.innerHTML = '<div class="spin"></div> Connecting…';

  // Show visible status on mobile for debugging
  let res;
  try {
    btn.innerHTML = '<div class="spin"></div> Reaching server…';
    res = await API.login(u, p);
  } catch(err) {
    btn.disabled = false;
    btn.innerHTML = 'Sign In';
    showLoginErr('Connection error: ' + err.message);
    return;
  }

  if (!res) {
    btn.disabled = false;
    btn.innerHTML = 'Sign In';
    showLoginErr('No response from server. Check internet connection.');
    return;
  }

  if (res.success) {
    resetBF();
    btn.innerHTML = 'Sign In';
    btn.disabled = false;

    // Cashier → straight in (no PIN required)
    if (res.user.role === 'Cashier') {
      Auth.setSession({ token: res.token, user: res.user });
      _launchApp();
      return;
    }

    // Admin → require PIN as 2nd factor
    _pendingSession = { token: res.token, user: res.user };

    const PIN_KEY = 'ds_apin_' + res.user.userID;
    const stored  = localStorage.getItem(PIN_KEY);

    if (!stored) {
      // First login – no PIN set yet → go to setup step
      showStep(3);
      initSetPinPad(PIN_KEY);
    } else {
      // PIN exists → ask for it
      showStep(2);
      initPinPad(PIN_KEY);
    }

  } else {
    btn.disabled = false;
    btn.innerHTML = 'Sign In';
    recordFail();
    if (isLocked()) {
      startCooldown();
      showLoginErr('Too many failed attempts. Please wait 30 seconds.');
    } else {
      const left = MAX_ATTEMPTS - getBF().n;
      const hint = left > 0 && getBF().n > 1
        ? ' (' + left + ' attempt' + (left === 1 ? '' : 's') + ' left)' : '';
      showLoginErr((res.message || 'Invalid username or password.') + hint);
    }
  }
}

function _launchApp() {
  showAppShell();
  initProtectedPage();
  navigateTo('dashboard');
  _pendingSession = null;
}

// ── PIN hash – pure JS, works on HTTP/WebView/MIT App Inventor ─
function hashPIN(pin) {
  // Simple but consistent hash: djb2 + salt, returned as hex string
  // Not cryptographic-grade but sufficient for a local 4-digit PIN
  const str = pin + 'ds_diamond_salt_2025';
  let h1 = 0x6A4C3B2D, h2 = 0xD3E2F1A0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x9E3779B9);
    h1 = (h1 << 13) | (h1 >>> 19);
    h2 = Math.imul(h2 ^ c, 0x85EBCA77);
    h2 = (h2 << 7)  | (h2 >>> 25);
  }
  h1 ^= h2; h2 ^= h1;
  h1 = Math.imul(h1 ^ (h1 >>> 16), 0x45D9F3B);
  h1 = Math.imul(h1 ^ (h1 >>> 16), 0x45D9F3B);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 0x45D9F3B);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 0x45D9F3B);
  const toHex = n => (n >>> 0).toString(16).padStart(8, '0');
  return toHex(h1) + toHex(h2);
}

// ── PIN Pad: Verify ───────────────────────────────────────────
function initPinPad(storageKey) {
  let entered = '';

  const dots  = [0,1,2,3].map(i => document.getElementById('dot' + i));
  const pad   = document.getElementById('pinPad');
  const errEl = document.getElementById('pinError');
  const errMsg= document.getElementById('pinErrorMsg');

  function updateDots() {
    dots.forEach((d, i) => {
      d.classList.toggle('filled', i < entered.length);
      d.classList.remove('error');
    });
  }

  let pinAttempts = 0;

  function showPinErr(msg) {
    pinAttempts++;
    dots.forEach(d => d.classList.add('error'));
    if (errEl)  { errEl.style.display = 'flex'; }
    // After 3 wrong attempts → auto-clear PIN so they can reset
    const fullMsg = pinAttempts >= 3
      ? msg + ' (PIN reset — set a new one)'
      : msg;
    if (errMsg) errMsg.textContent = fullMsg;
    if (pinAttempts >= 3) {
      localStorage.removeItem(storageKey);
      setTimeout(() => {
        showStep(3);
        initSetPinPad(storageKey);
      }, 1000);
      return;
    }
    setTimeout(() => {
      dots.forEach(d => d.classList.remove('error'));
      entered = '';
      updateDots();
    }, 600);
  }

  function hidePinErr() {
    if (errEl) errEl.style.display = 'none';
  }

  // Remove old listeners by cloning
  const newPad = pad.cloneNode(true);
  pad.parentNode.replaceChild(newPad, pad);

  newPad.addEventListener('click', function(e) {
    const key = e.target.closest('.pin-key');
    if (!key) return;
    const val = key.dataset.val;
    hidePinErr();

    if (val === 'clear') { entered = ''; updateDots(); return; }
    if (val === 'back')  { entered = entered.slice(0, -1); updateDots(); return; }
    if (entered.length >= 4) return;

    entered += val;
    updateDots();

    if (entered.length === 4) {
      const hashed = hashPIN(entered);
      const stored = localStorage.getItem(storageKey);
      if (hashed === stored) {
        Auth.setSession(_pendingSession);
        _launchApp();
      } else {
        showPinErr('Incorrect PIN. Please try again.');
      }
    }
  });

  // Back button
  const backBtn = document.getElementById('backToLoginBtn');
  if (backBtn) {
    const nb = backBtn.cloneNode(true);
    backBtn.parentNode.replaceChild(nb, backBtn);
    nb.addEventListener('click', () => {
      _pendingSession = null;
      entered = '';
      showStep(1);
    });
  }

  // Reset PIN button
  const resetBtn = document.getElementById('resetPinBtn');
  if (resetBtn) {
    const nr = resetBtn.cloneNode(true);
    resetBtn.parentNode.replaceChild(nr, resetBtn);
    nr.addEventListener('click', () => {
      confirmDialog(
        'Reset Security PIN',
        'This will delete your current PIN. You will need to set a new one on your next login. Continue?',
        () => {
          localStorage.removeItem(storageKey);
          _pendingSession = null;
          entered = '';
          Toast.success('PIN Reset', 'Your PIN has been cleared. Please log in again to set a new one.');
          showStep(1);
        },
        'danger'
      );
    });
  }

  updateDots();
}

// ── PIN Pad: Setup (first time) ───────────────────────────────
function initSetPinPad(storageKey) {
  let firstPin  = '';
  let entered   = '';
  let confirming = false;

  const dots    = [0,1,2,3].map(i => document.getElementById('sdot' + i));
  const pad     = document.getElementById('setPinPad');
  const stageEl = document.getElementById('setPinStage');

  function updateDots() {
    dots.forEach((d, i) => d.classList.toggle('filled', i < entered.length));
  }

  function setStageText(txt) {
    if (stageEl) stageEl.textContent = txt;
  }

  // Clone to remove old listeners
  const newPad = pad.cloneNode(true);
  pad.parentNode.replaceChild(newPad, pad);

  newPad.addEventListener('click', function(e) {
    const key = e.target.closest('.pin-key');
    if (!key) return;
    const val = key.dataset.val;

    if (val === 'clear') { entered = ''; updateDots(); return; }
    if (val === 'back')  { entered = entered.slice(0,-1); updateDots(); return; }
    if (entered.length >= 4) return;

    entered += val;
    updateDots();

    if (entered.length === 4) {
      if (!confirming) {
        firstPin   = entered;
        entered    = '';
        confirming = true;
        setStageText('Confirm your PIN');
        dots.forEach(d => d.classList.remove('filled'));
      } else {
        if (entered === firstPin) {
          const hashed = hashPIN(entered);
          localStorage.setItem(storageKey, hashed);
          Auth.setSession(_pendingSession);
          _launchApp();
        } else {
          dots.forEach(d => { d.classList.add('error'); });
          setTimeout(() => {
            dots.forEach(d => d.classList.remove('error','filled'));
            firstPin   = '';
            entered    = '';
            confirming = false;
            setStageText('PINs did not match. Enter new PIN');
          }, 700);
        }
      }
    }
  });
}
