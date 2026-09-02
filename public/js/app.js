const state = { user: null, services: [], orders: [] };
const $ = (s) => document.querySelector(s);
const money = (n) =>
  `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const token = () => localStorage.getItem('smm_token');
async function api(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
    },
  });

  const text = await res.text();
  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        res.ok
          ? 'Server returned an invalid response.'
          : `Server error (${res.status}). Make sure the backend is running.`
      );
    }
  }

  if (!res.ok) throw Error(data.error || 'Request failed');
  return data;
}
function toast(message) {
  const el = $('.toast');
  el.textContent = message;
  el.style.display = 'block';
  setTimeout(() => (el.style.display = 'none'), 3500);
}
function setView(view) {
  document
    .querySelectorAll('[data-view]')
    .forEach((x) => x.classList.toggle('hide', x.dataset.view !== view));
  document
    .querySelectorAll('.nav a')
    .forEach((x) => x.classList.toggle('active', x.dataset.go === view));
  const titles = {
    dashboard: ['Overview', 'Your command center for the day.'],
    orders: ['My orders', 'Track every delivery in one place.'],
    services: ['Service catalog', 'Choose the right service for your next campaign.'],
    neworder: ['New order', 'Launch a campaign with a few precise details.'],
    wallet: ['Wallet', 'Keep your working balance ready.'],
    profile: ['Profile', 'Manage your account details.'],
  };
  $('#page-title').textContent = titles[view]?.[0] || 'Overview';
  $('#page-sub').textContent = titles[view]?.[1] || '';
  if (view === 'dashboard') loadDashboard();
  if (view === 'orders') loadOrders();
  if (view === 'services') renderServices();
  if (view === 'neworder') loadOrderForm();
  if (view === 'wallet') loadWallet();
}
async function load() {
  try {
    const me = await api('/api/auth/me');
    state.user = me.user;
    $('#user-name').textContent = state.user.name;
    $('#profile-name').textContent = state.user.name;
    $('#profile-email').textContent = state.user.email;
    $('#profile-status').textContent = state.user.status || 'Active';
    setView('dashboard');
  } catch {
    localStorage.removeItem('smm_token');
    location.href = '/login.html';
  }
}
async function loadDashboard() {
  try {
    const [w, o] = await Promise.all([api('/api/wallet'), api('/api/orders')]);
    state.orders = o.orders;
    $('#balance').textContent = money(w.wallet.balance);
    $('#order-count').textContent = o.orders.length;
    $('#pending-count').textContent = o.orders.filter((x) =>
      ['Pending', 'Processing', 'In progress'].includes(x.status)
    ).length;
    $('#recent-orders').innerHTML =
      o.orders.slice(0, 5).map(row).join('') || '<tr><td colspan="4">No orders yet.</td></tr>';
  } catch (e) {
    toast(e.message);
  }
}
function row(o) {
  return `<tr><td>#${o.id}</td><td>${o.service_name_snapshot}</td><td>${money(o.customer_price)}</td><td><span class="badge ${o.status !== 'Completed' ? 'pending' : ''}">${o.status}</span></td></tr>`;
}
async function loadOrders() {
  const x = await api('/api/orders');
  state.orders = x.orders;
  $('#orders-table').innerHTML =
    x.orders.map(row).join('') || '<tr><td colspan="4">No orders found.</td></tr>';
}
async function loadWallet() {
  const [w, t] = await Promise.all([api('/api/wallet'), api('/api/wallet/transactions')]);
  $('#wallet-balance').textContent = money(w.wallet.balance);
  $('#deposited').textContent = money(w.wallet.total_deposited);
  $('#spent').textContent = money(w.wallet.total_spent);
  $('#transactions-table').innerHTML =
    t.transactions
      .map(
        (x) =>
          `<tr><td>${x.type}</td><td>${money(x.amount)}</td><td>${money(x.balance_after)}</td><td>${new Date(x.created_at).toLocaleDateString()}</td></tr>`
      )
      .join('') || '<tr><td colspan="4">No transactions yet.</td></tr>';
}
async function loadServices() {
  const x = await api('/api/services');
  state.services = x.services;
}
function renderServices() {
  loadServices()
    .then(
      () => {
        $('#service-grid').innerHTML = state.services.length
          ? state.services
              .map(
                (s) =>
                  `<div class="card"><div class="eyebrow">${s.category}</div><h3>${s.name}</h3><p class="sub">${s.description || 'Reliable delivery for your social growth.'}</p><div style="margin-top:20px;display:flex;justify-content:space-between;align-items:end"><div><small class="stat-label">Starting rate</small><div class="price">${money(s.selling_rate)}<small>/1k</small></div></div><button class="btn btn-dark" onclick="chooseService(${s.id})">Order</button></div></div>`
              )
              .join('')
          : '<div class="card empty-state"><h3>No services available yet</h3><p class="sub">An administrator needs to sync the SMMVault catalog before orders can be placed.</p></div>';
      }
    )
    .catch((e) => toast(e.message));
}
async function loadOrderForm() {
  await loadServices();
  $('#service-select').innerHTML =
    '<option value="">Select a service</option>' +
    state.services
      .map((s) => `<option value="${s.id}">${s.name} · ${s.category}</option>`)
      .join('');
  $('#service-select').onchange = showService;
  showService();
}
function showService() {
  const s = state.services.find((x) => String(x.id) === $('#service-select').value);
  $('#service-info').classList.toggle('hide', !s);
  if (!s) return;
  $('#service-copy').innerHTML =
    `<strong>${s.name}</strong><br>${s.description || 'No description available.'}<br><small>ID ${s.provider_service_id} · ${s.min_quantity}-${s.max_quantity} · ${s.refill_available ? 'Refill available' : 'No refill'}</small>`;
  $('#quantity').min = s.min_quantity;
  $('#quantity').max = s.max_quantity;
  calcPrice();
}
function chooseService(id) {
  setView('neworder');
  setTimeout(() => {
    $('#service-select').value = id;
    showService();
  }, 0);
}
function calcPrice() {
  const s = state.services.find((x) => String(x.id) === $('#service-select')?.value);
  $('#estimate').textContent = money(
    s ? (Number($('#quantity').value || 0) * Number(s.selling_rate)) / 1000 : 0
  );
}
async function placeOrder(e) {
  e.preventDefault();
  try {
    const order = (
      await api('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          service_id: $('#service-select').value,
          link: $('#link').value,
          quantity: Number($('#quantity').value),
        }),
      })
    ).order;
    toast(`Order #${order.id} placed`);
    setView('orders');
  } catch (x) {
    toast(x.message);
  }
}
function logout() {
  localStorage.removeItem('smm_token');
  location.href = '/login.html';
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-go]');
  if (a) {
    e.preventDefault();
    setView(a.dataset.go);
    $('.side')?.classList.remove('open');
  }
});
document.addEventListener('DOMContentLoaded', () => {
  if (location.pathname.endsWith('login.html')) return;
  load();
  $('#quantity')?.addEventListener('input', calcPrice);
  $('#order-form')?.addEventListener('submit', placeOrder);
  $('#mobile-menu')?.addEventListener('click', () => $('.side').classList.toggle('open'));
});
