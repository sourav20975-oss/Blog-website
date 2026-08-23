const mongoose = require('mongoose');
const { connectDB } = require('./db');
const { upsertSeedPost } = require('./seedData');

async function main() {
  await connectDB();
  await upsertSeedPost();
  const count = await mongoose.connection.db.collection('posts').countDocuments();
  console.log('Total posts in DB:', count);
  await mongoose.disconnect();
  console.log('Done.');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
