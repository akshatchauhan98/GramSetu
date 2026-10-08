import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Mill from './models/Mill.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.log(JSON.stringify({ success: false, error: 'MONGODB_URI missing from .env' }, null, 2));
  process.exit(1);
}

function escapeRegex(str) {
  return String(str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function run() {
  const report = {
    connectionSuccess: false,
    jsonPathChecked: '',
    jsonFileFound: false,
    sourceRecords: 0,
    validRecords: 0,
    invalidRecords: 0,
    jsonUpRecords: 0,
    missingName: 0,
    missingDistrict: 0,
    missingPhone: 0,
    missingEmail: 0,
    missingCrops: 0,
    jsonDuplicates: 0,
    initialTotalCount: 0,
    initialUpCount: 0,
    insertedCount: 0,
    updatedCount: 0,
    skippedDuplicates: 0,
    finalTotalCount: 0,
    finalUpCount: 0,
    apiTests: {
      getAll: false,
      getByState: false,
      getByDistrict: false,
      search: false
    },
    error: null
  };

  try {
    // 1. Locate and read JSON file
    const jsonPath = path.resolve('../gramsetu_mills.json');
    report.jsonPathChecked = jsonPath;

    if (!fs.existsSync(jsonPath)) {
      report.error = `JSON file not found at ${jsonPath}`;
      console.log(JSON.stringify(report, null, 2));
      process.exit(1);
    }
    report.jsonFileFound = true;

    const fileData = fs.readFileSync(jsonPath, 'utf-8');
    let jsonRecords;
    try {
      jsonRecords = JSON.parse(fileData);
    } catch (e) {
      report.error = `Invalid JSON syntax: ${e.message}`;
      console.log(JSON.stringify(report, null, 2));
      process.exit(1);
    }

    if (!Array.isArray(jsonRecords)) {
      report.error = 'gramsetu_mills.json must contain a JSON array of objects';
      console.log(JSON.stringify(report, null, 2));
      process.exit(1);
    }

    report.sourceRecords = jsonRecords.length;

    // 2. Validate JSON records
    const seenInJson = new Set();
    const validItems = [];

    for (let i = 0; i < jsonRecords.length; i++) {
      const item = jsonRecords[i];
      let isValid = true;

      const name = typeof item.name === 'string' ? item.name.trim() : '';
      const district = typeof item.district === 'string' ? item.district.trim() : '';
      const state = typeof item.state === 'string' ? item.state.trim() : '';

      if (!name) {
        report.missingName++;
        isValid = false;
      }
      if (!district) {
        report.missingDistrict++;
      }
      
      const phoneArr = Array.isArray(item.phone) ? item.phone : (item.phone ? [String(item.phone)] : []);
      if (phoneArr.length === 0) {
        report.missingPhone++;
      }

      const emailArr = Array.isArray(item.email) ? item.email : (item.email ? [String(item.email)] : []);
      if (emailArr.length === 0) {
        report.missingEmail++;
      }

      const cropsArr = Array.isArray(item.crops) ? item.crops : (item.crops ? [String(item.crops)] : []);
      if (cropsArr.length === 0) {
        report.missingCrops++;
      }

      if (state.toLowerCase() === 'uttar pradesh') {
        report.jsonUpRecords++;
      }

      if (isValid) {
        const jsonKey = `${name.toLowerCase()}|${district.toLowerCase()}|${state.toLowerCase()}`;
        if (seenInJson.has(jsonKey)) {
          report.jsonDuplicates++;
        } else {
          seenInJson.add(jsonKey);
          validItems.push({
            name,
            district,
            state: state || 'Uttar Pradesh',
            crops: cropsArr,
            availableQuantityMT: item.availableQuantityMT !== undefined ? item.availableQuantityMT : 'As Per Demand',
            phone: phoneArr,
            email: emailArr,
            verificationSource: typeof item.verificationSource === 'string' ? item.verificationSource.trim() : ''
          });
        }
        report.validRecords++;
      } else {
        report.invalidRecords++;
      }
    }

    // 3. Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000
    });
    report.connectionSuccess = true;

    // Check initial counts
    const millsCollection = mongoose.connection.db.collection('mills');
    report.initialTotalCount = await millsCollection.countDocuments({});
    report.initialUpCount = await millsCollection.countDocuments({
      state: { $regex: /^Uttar Pradesh$/i }
    });

    // 4. Perform Upsert / Import
    for (const record of validItems) {
      const filter = {
        name: { $regex: `^${escapeRegex(record.name)}$`, $options: 'i' },
        district: { $regex: `^${escapeRegex(record.district)}$`, $options: 'i' },
        state: { $regex: `^${escapeRegex(record.state)}$`, $options: 'i' }
      };

      const existingDoc = await Mill.findOne(filter);

      if (existingDoc) {
        // Update existing document
        existingDoc.name = record.name;
        existingDoc.district = record.district;
        existingDoc.state = record.state;
        existingDoc.crops = record.crops;
        existingDoc.availableQuantityMT = record.availableQuantityMT;
        existingDoc.phone = record.phone;
        existingDoc.email = record.email;
        if (record.verificationSource) {
          existingDoc.verificationSource = record.verificationSource;
        }
        await existingDoc.save();
        report.updatedCount++;
      } else {
        // Insert new document
        await Mill.create(record);
        report.insertedCount++;
      }
    }

    // 5. Check final counts
    report.finalTotalCount = await millsCollection.countDocuments({});
    report.finalUpCount = await millsCollection.countDocuments({
      state: { $regex: /^Uttar Pradesh$/i }
    });

    // 6. Test API Query logic
    const allMills = await Mill.find({}).lean();
    report.apiTests.getAll = Array.isArray(allMills);

    const upMills = await Mill.find({ state: { $regex: /^Uttar Pradesh$/i } }).lean();
    report.apiTests.getByState = Array.isArray(upMills);

    const testDistrict = validItems[0]?.district || 'Moradabad';
    const districtMills = await Mill.find({ district: { $regex: `^${escapeRegex(testDistrict)}$`, $options: 'i' } }).lean();
    report.apiTests.getByDistrict = Array.isArray(districtMills);

    const searchMills = await Mill.find({
      $or: [
        { name: { $regex: 'mill', $options: 'i' } },
        { state: { $regex: 'uttar', $options: 'i' } }
      ]
    }).limit(10).lean();
    report.apiTests.search = Array.isArray(searchMills);

    await mongoose.disconnect();
    console.log(JSON.stringify(report, null, 2));

  } catch (err) {
    report.error = err.message;
    console.log(JSON.stringify(report, null, 2));
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect().catch(() => {});
    }
    process.exit(1);
  }
}

run();
