require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE);

async function migrate() {
  try {
    const Setting = require('../models/coreModels/Setting');

    const updates = [
      { settingKey: 'default_currency_code', settingValue: 'LKR' },
      { settingKey: 'currency_name', settingValue: 'Sri Lankan Rupee' },
      { settingKey: 'currency_symbol', settingValue: 'LKR' },
    ];

    for (const { settingKey, settingValue } of updates) {
      await Setting.findOneAndUpdate(
        { settingKey },
        { settingValue },
        { upsert: true, new: true }
      );
      console.log(`✅ Updated ${settingKey} → ${settingValue}`);
    }

    console.log('🥳 Currency migrated to LKR');
    process.exit(0);
  } catch (e) {
    console.error('🚫 Migration failed:', e.message);
    process.exit(1);
  }
}

migrate();
