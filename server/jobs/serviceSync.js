const provider = require('../services/smmvault');
async function syncServices(pool) {
  const services = await provider.getServices();
  const ids = [];
  for (const service of services) {
    ids.push(String(service.service));
    await pool.query(
      `INSERT INTO services(provider_service_id,category,name,description,type,provider_rate,selling_rate,min_quantity,max_quantity,refill_available,cancel_available) VALUES($1,$2,$3,$4,$5,$6,$6,$7,$8,$9,$10) ON CONFLICT(provider_service_id) DO UPDATE SET category=EXCLUDED.category,name=EXCLUDED.name,description=EXCLUDED.description,type=EXCLUDED.type,provider_rate=EXCLUDED.provider_rate,min_quantity=EXCLUDED.min_quantity,max_quantity=EXCLUDED.max_quantity,refill_available=EXCLUDED.refill_available,cancel_available=EXCLUDED.cancel_available,status='active',updated_at=now()`,
      [
        String(service.service),
        service.category,
        service.name,
        service.description || '',
        service.type || 'default',
        Number(service.rate) || 0,
        Number(service.min) || 1,
        Number(service.max) || 100000,
        Boolean(service.refill),
        Boolean(service.cancel),
      ]
    );
  }
  if (ids.length)
    await pool.query(
      "UPDATE services SET status='inactive',updated_at=now() WHERE provider_service_id <> ALL($1::text[])",
      [ids]
    );
  return ids.length;
}
module.exports = { syncServices };
