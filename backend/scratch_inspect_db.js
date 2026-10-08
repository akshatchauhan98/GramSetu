import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function inspectDb() {
  console.log('Connecting to MongoDB Atlas...');
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected!');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Existing collections:', collections.map(c => c.name));

    const millsCount = await db.collection('mills').countDocuments();
    const mspCount = await db.collection('msp').countDocuments();
    const usersCount = await db.collection('users').countDocuments();
    const locationsCount = await db.collection('locations').countDocuments();

    console.log(`\nCounts:`);
    console.log(` - mills: ${millsCount}`);
    console.log(` - msp: ${mspCount}`);
    console.log(` - users: ${usersCount}`);
    console.log(` - locations: ${locationsCount}`);

    const sampleMill = await db.collection('mills').findOne({});
    console.log('\nSample Mill record from gramsetu.mills:');
    console.log(JSON.stringify(sampleMill, null, 2));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Inspect DB failed:', err);
    process.exit(1);
  }
}

inspectDb();
