require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE);

async function migrate() {
  try {
    const Setting = require('../models/coreModels/Setting');

    const updates = [
      { settingKey: 'company_name', settingValue: 'Shelby Auto Works' },
      { settingKey: 'company_address', settingValue: '145/A, Kurunegala Rd, Minuwangoda' },
      { settingKey: 'company_phone', settingValue: '0767419125' },
      { settingKey: 'company_email', settingValue: 'shelbyautoworks125@gmail.com' },
    ];

    for (const { settingKey, settingValue } of updates) {
      await Setting.findOneAndUpdate(
        { settingKey },
        { settingValue },
        { upsert: true, new: true }
      );
      console.log(`✅ ${settingKey} → ${settingValue}`);
    }

    console.log('🥳 Company details updated');
    process.exit(0);
  } catch (e) {
    console.error('🚫 Migration failed:', e.message);
    process.exit(1);
  }
}

migrate();
