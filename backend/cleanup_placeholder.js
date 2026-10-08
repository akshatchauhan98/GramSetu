import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Mill from './models/Mill.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.log(JSON.stringify({ error: 'MONGODB_URI missing from .env' }));
  process.exit(1);
}

async function run() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000
    });

    const filter = {
      name: "MILL / EXPORTER NAME",
      district: "DISTRICT NAME",
      state: "Uttar Pradesh"
    };

    const totalBefore = await Mill.countDocuments({});
    const upBefore = await Mill.countDocuments({ state: { $regex: /^Uttar Pradesh$/i } });

    const matchingDoc = await Mill.findOne(filter);
    let deletedCount = 0;

    if (matchingDoc) {
      const deleteResult = await Mill.deleteOne({ _id: matchingDoc._id });
      deletedCount = deleteResult.deletedCount;
    }

    const totalAfter = await Mill.countDocuments({});
    const upAfter = await Mill.countDocuments({ state: { $regex: /^Uttar Pradesh$/i } });
    const remainingPlaceholder = await Mill.findOne({ name: "MILL / EXPORTER NAME" });

    console.log(JSON.stringify({
      foundPlaceholder: !!matchingDoc,
      deletedCount,
      totalBefore,
      totalAfter,
      upBefore,
      upAfter,
      placeholderStillExists: !!remainingPlaceholder
    }, null, 2));

    await mongoose.disconnect();
  } catch (err) {
    console.log(JSON.stringify({ error: err.message }));
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect().catch(() => {});
    }
    process.exit(1);
  }
}

run();
