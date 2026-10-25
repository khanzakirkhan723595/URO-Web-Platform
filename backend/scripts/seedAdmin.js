// backend/scripts/seedAdmin.js  (run: npm run seed:admin -- you@example.com "StrongPassword123" "Your Name")
// Creates the first admin account, or promotes an existing user. This replaces the unsafe "role in signup" approach.
const config = require('../config/env');
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  const [email, password, name = 'Administrator'] = process.argv.slice(2);
  if (!email) {
    console.error('Usage: npm run seed:admin -- <email> [password] [name]');
    process.exit(1);
  }
  await mongoose.connect(config.mongoUri);
  let user = await User.findOne({ email: email.toLowerCase() });
  if (user) {
    user.role = 'admin';
    await user.save({ validateBeforeSave: false });
    console.log(`Promoted existing user ${email} to admin.`);
  } else {
    if (!password) { console.error('Password required to create a new admin.'); process.exit(1); }
    user = await User.create({ name, email, password, role: 'admin' });
    console.log(`Created admin ${user.email}.`);
  }
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
