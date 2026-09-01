const axios = require('axios');
const config = {
  url: process.env.SMMVAULT_API_URL || 'https://smmvault.in/api/v2',
  key: process.env.SMMVAULT_API_KEY,
};
const demoServices = [
  {
    service: '101',
    name: 'Real & Active Followers',
    rate: '250.00',
    min: '100',
    max: '100000',
    category: 'Instagram Followers',
    type: 'default',
    description: 'Real audience delivery with gradual start.',
    refill: true,
    cancel: true,
  },
  {
    service: '205',
    name: 'Instagram Likes | Fast Delivery',
    rate: '42.00',
    min: '50',
    max: '50000',
    category: 'Instagram Likes',
    type: 'default',
    description: 'Fast, stable likes for public posts.',
    refill: false,
    cancel: false,
  },
];
async function request(action, params = {}) {
  if (!config.key) {
    if (process.env.DEMO_MODE === 'true') return demoResponse(action, params);
    throw new Error('SMM Vault is not configured');
  }
  const { data } = await axios.post(
    config.url,
    new URLSearchParams({ key: config.key, action, ...params }).toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 15000 }
  );
  if (data?.error) throw new Error(data.error);
  return data;
}
function demoResponse(action, params) {
  if (action === 'services') return demoServices;
  if (action === 'balance') return { balance: '1000', currency: 'INR' };
  if (action === 'add') return { order: `DEMO-${Date.now()}` };
  if (action === 'status') return { status: 'In progress', remains: params.order ? '0' : '0' };
  return { success: 'Demo mode' };
}
module.exports = {
  getServices: () => request('services'),
  getBalance: () => request('balance'),
  createOrder: (p) => request('add', p),
  getOrderStatus: (order) => request('status', { order }),
  getMultipleOrderStatus: (orders) => request('status', { orders: orders.join(',') }),
  createRefill: (order) => request('refill', { order }),
  getRefillStatus: (refill) => request('refill_status', { refill }),
  cancelOrder: (order) => request('cancel', { order }),
};
