import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Mill from './models/Mill.js';

dotenv.config();

async function inspectMills() {
  await mongoose.connect(process.env.MONGODB_URI);
  const mills = await Mill.find({}).limit(10).lean();
  console.log(`Found ${mills.length} mills in DB:`);
  mills.forEach(m => {
    console.log(`- ID: ${m._id} | Name: ${m.name} | District: ${m.district} | State: ${m.state}`);
  });
  process.exit(0);
}

inspectMills();
