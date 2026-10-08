import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function checkUserDb() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  console.log('Connected to Database:', mongoose.connection.name);

  const totalUsers = await User.countDocuments({});
  console.log(`Total users in gramsetu.users: ${totalUsers}`);

  const users = await User.find({}).select('_id name email phone role village district state createdAt').lean();
  console.log('User Accounts Summary (safely masked):');
  users.forEach((u, idx) => {
    console.log(`${idx + 1}. ID: ${u._id} | Name: "${u.name}" | Email: "${u.email || ''}" | Phone: "${u.phone || ''}" | Role: "${u.role}" | Location: "${u.village || ''}, ${u.district || ''}, ${u.state || ''}"`);
  });

  await mongoose.disconnect();
}

checkUserDb().catch(console.error);
