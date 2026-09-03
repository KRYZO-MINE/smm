const provider = require('../services/smmvault');
function normalizeStatus(value) {
  const status = String(value || 'Pending').trim().toLowerCase();
  const aliases = {
    complete: 'Completed',
    completed: 'Completed',
    processing: 'Processing',
    'in progress': 'In progress',
    pending: 'Pending',
    partial: 'Partial',
    canceled: 'Cancelled',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  };
  return aliases[status] || String(value || 'Pending').trim();
}
async function syncOrders(pool, userId = null) {
  const userFilter = userId ? ' AND user_id=$1' : '';
  const result = await pool.query(
    `SELECT id, provider_order_id FROM orders WHERE provider_order_id IS NOT NULL AND status IN ('Pending','Processing','In progress')${userFilter} LIMIT 100`,
    userId ? [userId] : []
  );
  for (const order of result.rows) {
    try {
      const status = await provider.getOrderStatus(order.provider_order_id);
      const normalized = normalizeStatus(status.status);
      await pool.query('UPDATE orders SET status=$1,updated_at=now() WHERE id=$2', [
        normalized,
        order.id,
      ]);
    } catch (error) {
      console.error(`Order sync ${order.id}: ${error.message}`);
    }
  }
}
module.exports = { syncOrders };
