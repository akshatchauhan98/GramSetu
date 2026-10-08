import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function inspectMspCollection() {
  console.log('Connecting with DNS override...');
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected!');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    const mspCollection = db.collection('msp');
    const count = await mspCollection.countDocuments();
    console.log(`\nFound ${count} documents in 'msp' collection.`);

    const records = await mspCollection.find({}).toArray();
    console.log('\n--- MSP Records Summary ---');
    records.forEach((r, i) => {
      console.log(`${i+1}. Crop: "${r.crop}" | Aliases: [${(r.cropAliases||[]).join(', ')}] | MSP: ₹${r.mspPerQuintal}/${r.unit||'quintal'} | Season: ${r.season||''} (${r.marketingSeason||''})`);
    });

    console.log('\nSample record 1 raw structure:');
    console.log(JSON.stringify(records[0], null, 2));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Inspection failed:', err);
    process.exit(1);
  }
}

inspectMspCollection();
