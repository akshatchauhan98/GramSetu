import { syncMandiPrices } from './sync_mandi_prices.js';

async function run() {
  console.log('Running syncMandiPrices()...');
  const res = await syncMandiPrices();
  console.log('Sync Result:', res);
}

run().catch(console.error);
