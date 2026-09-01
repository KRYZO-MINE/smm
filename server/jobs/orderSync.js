const provider = require('../services/smmvault');
async function syncOrders(pool) {
  const result = await pool.query(
    "SELECT id, provider_order_id FROM orders WHERE provider_order_id IS NOT NULL AND status IN ('Pending','Processing','In progress') LIMIT 100"
  );
  for (const order of result.rows) {
    try {
      const status = await provider.getOrderStatus(order.provider_order_id);
      const normalized = String(status.status || 'Pending').replace('Canceled', 'Cancelled');
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
