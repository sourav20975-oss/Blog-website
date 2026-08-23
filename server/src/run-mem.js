// In-memory MongoDB ke saath dev server (bina Atlas/local install ke testing)
// Data temporary hai - server band karte hi reset ho jata hai.
const { upsertSeedPosts } = require('./seedData');

async function main() {
  let MongoMemoryServer;
  try {
    ({ MongoMemoryServer } = require('mongodb-memory-server'));
  } catch {
    console.error('mongodb-memory-server installed nahi hai. Run: npm install');
    process.exit(1);
  }

  console.log('In-memory MongoDB start ho raha hai (pehli baar thoda time lagta hai)...');
  const mem = await MongoMemoryServer.create();
  process.env.MONGO_URI = mem.getUri('blogwebsite');

  const { start } = require('./app');
  const server = await start({ port: process.env.PORT || 5000 });

  const Post = require('./models/Post');
  if ((await Post.countDocuments()) === 0) {
    await upsertSeedPosts();
  }

  const shutdown = async () => {
    console.log('\nShutting down...');
    server.close();
    await mem.stop();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
