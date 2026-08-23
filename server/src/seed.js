const mongoose = require('mongoose');
const { connectDB } = require('./db');
const { SEED_POSTS, upsertSeedPosts } = require('./seedData');

async function main() {
  await connectDB();

  // Usage:
  //   npm run seed                  -> sab posts seed
  //   npm run seed -- docker        -> sirf matching post(s) (slug ya file name me match)
  //   npm run seed -- sql-course    -> partial match bhi chalega
  const query = process.argv[2];

  if (query) {
    const q = query.toLowerCase();
    const targets = SEED_POSTS.filter(
      (p) => p.slug.toLowerCase().includes(q) || p.file.toLowerCase().includes(q)
    );
    if (targets.length === 0) {
      console.log(`"${query}" se koi post match nahi hua. Available options:`);
      SEED_POSTS.forEach((p) => console.log('  -', p.file, ' (', p.slug, ')'));
      await mongoose.disconnect();
      return;
    }
    console.log('Seeding only:', targets.map((t) => t.slug).join(', '));
    await upsertSeedPosts(targets);
  } else {
    await upsertSeedPosts();
  }

  const count = await mongoose.connection.db.collection('posts').countDocuments();
  console.log('Total posts in DB:', count);
  await mongoose.disconnect();
  console.log('Done.');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
