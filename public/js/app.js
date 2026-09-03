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
    location.href = '/login';
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
const platformOrder = ['Instagram', 'Telegram', 'Facebook', 'TikTok', 'YouTube', 'WhatsApp', 'Twitter', 'Threads', 'LinkedIn', 'Discord'];
const serviceTypeOrder = ['Followers', 'Likes', 'Comments', 'Views', 'Members', 'Subscribers', 'Shares', 'Reactions', 'Story views', 'Other services'];
function escapeHtml(value) {
  return String(value || '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}
function cleanServiceText(value) {
  return String(value || '')
    .replace(/[^\p{L}\p{N}\s|()[\]{}:/.&,+#%_-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s*([|:/-])\s*/g, ' $1 ')
    .trim();
}
function platformFor(service) {
  const source = `${service.category || ''} ${service.name || ''}`.toLowerCase();
  return platformOrder.find((platform) => source.includes(platform.toLowerCase())) || 'Other platforms';
}
function serviceTypeFor(service) {
  const source = `${service.category || ''} ${service.name || ''}`.toLowerCase();
  const types = [
    ['Story views', ['story view', 'story views']],
    ['Followers', ['follower', 'followers']],
    ['Likes', ['like', 'likes']],
    ['Comments', ['comment', 'comments']],
    ['Views', ['view', 'views', 'watch']],
    ['Members', ['member', 'members', 'group join']],
    ['Subscribers', ['subscriber', 'subscribers']],
    ['Shares', ['share', 'shares']],
    ['Reactions', ['reaction', 'reactions']],
  ];
  return types.find(([, keywords]) => keywords.some((keyword) => source.includes(keyword)))?.[0] || 'Other services';
}
function serviceName(service) {
  return cleanServiceText(service.name) || 'Social media service';
}
function serviceTime(service) {
  const source = serviceName(service);
  const match = source.match(/(?:start|speed|delivery)\s*([\w/ -]+?)(?=\s*[|]|$)/i);
  return match ? cleanServiceText(match[1]) : 'Based on recent orders';
}
function serviceLinkHint(service) {
  const type = serviceTypeFor(service);
  return ['Comments', 'Likes', 'Views', 'Shares', 'Story views'].includes(type)
    ? 'Public post or reel link'
    : ['Members', 'Subscribers'].includes(type)
      ? 'Public group or channel link'
      : 'Public profile or post link';
}
function sortServices(services) {
  return [...services].sort((first, second) => {
    const firstPlatform = platformFor(first);
    const secondPlatform = platformFor(second);
    const firstIndex = platformOrder.indexOf(firstPlatform);
    const secondIndex = platformOrder.indexOf(secondPlatform);
    return (firstIndex === -1 ? platformOrder.length : firstIndex) - (secondIndex === -1 ? platformOrder.length : secondIndex) ||
      String(first.category || '').localeCompare(String(second.category || '')) ||
      serviceName(first).localeCompare(serviceName(second));
  });
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
  state.services = sortServices(x.services);
}
function renderServices() {
  loadServices()
    .then(
      () => {
        $('#service-grid').innerHTML = state.services.length
          ? state.services
              .map(
                (s) =>
                  `<div class="card"><div class="eyebrow">${escapeHtml(platformFor(s))}</div><h3>${escapeHtml(serviceName(s))}</h3><p class="sub">${escapeHtml(s.description || 'Reliable delivery for your social growth.')}</p><div style="margin-top:20px;display:flex;justify-content:space-between;align-items:end"><div><small class="stat-label">Starting rate</small><div class="price">${money(s.selling_rate)}<small>/1k</small></div></div><button class="btn btn-dark" onclick="chooseService(${s.id})">Order</button></div></div>`
              )
              .join('')
          : '<div class="card empty-state"><h3>No services available yet</h3><p class="sub">An administrator needs to sync the SMMVault catalog before orders can be placed.</p></div>';
      }
    )
    .catch((e) => toast(e.message));
}
async function loadOrderForm() {
  await loadServices();
  const platforms = [...new Set(state.services.map(platformFor))];
  $('#platform-select').innerHTML =
    '<option value="">Select a platform</option>' +
    platforms
      .sort((first, second) => (platformOrder.indexOf(first) === -1 ? platformOrder.length : platformOrder.indexOf(first)) - (platformOrder.indexOf(second) === -1 ? platformOrder.length : platformOrder.indexOf(second)))
      .map((platform) => `<option value="${escapeHtml(platform)}">${escapeHtml(platform)}</option>`)
      .join('');
  $('#platform-select').onchange = populateServiceTypes;
  $('#service-type-select').onchange = populatePackages;
  populateServiceTypes();
}
function populateServiceTypes() {
  const platform = $('#platform-select').value;
  const types = [...new Set(state.services.filter((service) => !platform || platformFor(service) === platform).map(serviceTypeFor))];
  $('#service-type-select').innerHTML =
    '<option value="">Select a service type</option>' +
    types
      .sort((first, second) => (serviceTypeOrder.indexOf(first) === -1 ? serviceTypeOrder.length : serviceTypeOrder.indexOf(first)) - (serviceTypeOrder.indexOf(second) === -1 ? serviceTypeOrder.length : serviceTypeOrder.indexOf(second)))
      .map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`)
      .join('');
  $('#service-type-select').disabled = !platform;
  $('#service-select').innerHTML = '<option value="">Select a package</option>';
  $('#service-select').disabled = true;
  $('#service-info').classList.add('hide');
  calcPrice();
}
function populatePackages() {
  const platform = $('#platform-select').value;
  const type = $('#service-type-select').value;
  const services = sortServices(state.services.filter((service) => platformFor(service) === platform && serviceTypeFor(service) === type));
  $('#service-select').innerHTML =
    '<option value="">Select a package</option>' +
    services
      .map((s) => `<option value="${s.id}">${escapeHtml(serviceName(s))} · ${money(s.selling_rate)} / 1k</option>`)
      .join('');
  $('#service-select').disabled = !type || !services.length;
  $('#service-select').onchange = showService;
  showService();
}
function showService() {
  const s = state.services.find((x) => String(x.id) === $('#service-select').value);
  $('#service-info').classList.toggle('hide', !s);
  if (!s) return;
  $('#service-name').textContent = serviceName(s);
  $('#service-id').textContent = `ID ${s.provider_service_id}`;
  $('#service-rate').textContent = `${money(s.selling_rate)} / 1k`;
  $('#service-time').textContent = serviceTime(s);
  $('#service-range').textContent = `${s.min_quantity} - ${s.max_quantity}`;
  $('#service-link-hint').textContent = serviceLinkHint(s);
  $('#service-description').textContent = s.description || `${serviceTypeFor(s)} service for ${platformFor(s)} with ${s.refill_available ? 'refill support' : 'standard delivery'}.`;
  $('#quantity').min = s.min_quantity;
  $('#quantity').max = s.max_quantity;
  $('#quantity-help').textContent = `Min: ${s.min_quantity} · Max: ${s.max_quantity}`;
  calcPrice();
}
function chooseService(id) {
  setView('neworder');
  setTimeout(() => {
    const service = state.services.find((item) => String(item.id) === String(id));
    if (!service) return;
    $('#platform-select').value = platformFor(service);
    populateServiceTypes();
    $('#service-type-select').value = serviceTypeFor(service);
    populatePackages();
    $('#service-select').value = String(service.id);
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
  location.href = '/login';
}
function toggleFundsForm() {
  $('#funds-form')?.classList.toggle('hide');
}
async function startCashfreePayment(event) {
  event.preventDefault();
  const button = $('#pay-button');
  button.disabled = true;
  button.textContent = 'Opening checkout...';
  try {
    const response = await api('/api/payments/create', {
      method: 'POST',
      body: JSON.stringify({ amount: Number($('#fund-amount').value), phone: $('#fund-phone').value }),
    });
    if (!window.Cashfree) throw new Error('Cashfree checkout could not load. Refresh and try again.');
    const cashfree = Cashfree({ mode: response.mode });
    await cashfree.checkout({ paymentSessionId: response.payment_session_id, redirectTarget: '_self' });
  } catch (error) {
    toast(error.message);
    button.disabled = false;
    button.textContent = 'Pay securely';
  }
}
function closeNavigation() {
  $('.side')?.classList.remove('open');
  $('#nav-backdrop')?.classList.remove('visible');
  $('#mobile-menu')?.setAttribute('aria-expanded', 'false');
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-go]');
  if (a) {
    e.preventDefault();
    setView(a.dataset.go);
    closeNavigation();
  }
});
document.addEventListener('DOMContentLoaded', () => {
  if (location.pathname.endsWith('login.html')) return;
  load();
  $('#quantity')?.addEventListener('input', calcPrice);
  $('#order-form')?.addEventListener('submit', placeOrder);
  $('#mobile-menu')?.addEventListener('click', () => {
    const isOpen = $('.side').classList.toggle('open');
    $('#nav-backdrop')?.classList.toggle('visible', isOpen);
    $('#mobile-menu').setAttribute('aria-expanded', String(isOpen));
  });
  $('#nav-backdrop')?.addEventListener('click', closeNavigation);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNavigation();
  });
});
