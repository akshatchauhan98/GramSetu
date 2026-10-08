import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Mill from './models/Mill.js';

dotenv.config();

async function cleanUndefinedMill() {
  await mongoose.connect(process.env.MONGODB_URI);
  const res = await Mill.deleteOne({ _id: '6aaab207c4dbc35845b6cd7c' });
  console.log(`Deleted ${res.deletedCount} invalid mill record.`);
  process.exit(0);
}

cleanUndefinedMill();
