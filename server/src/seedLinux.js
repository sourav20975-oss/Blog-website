const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { connectDB } = require('./db');
const Post = require('./models/Post');

async function main() {
  await connectDB();

  const content = fs.readFileSync(
    path.join(__dirname, '..', '..', 'linux-handbook.md'),
    'utf8'
  );

  const slug = 'linux-written-handbook';
  const meta = {
    title: 'The Ultimate Linux Handbook — Complete Practice Notes',
    slug,
    author: 'Sourav Kumar',
    quote:
      'Complete source-faithful Markdown transcription of the Linux handbook — kernel, distro, commands, users, permissions, processes, cron, filesystem, Nginx and file transfer, page by page.',
    content,
  };

  const existing = await Post.findOne({ slug });

  if (existing) {
    await Post.findOneAndUpdate({ slug }, { content }, { new: true, runValidators: true });
    console.log('Linux handbook content updated:', slug);
  } else {
    await Post.create(meta);
    console.log('Linux handbook created:', slug);
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
