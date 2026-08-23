const Post = require('./models/Post');

const SEED_POST = {
  title: 'The Ultimate SQL Tutorial',
  slug: 'the-ultimate-sql-course',
  author: 'Sourav Kumar',
  quote:
    'MySQL is a database management system. A Database Management System (DBMS) is software that interacts with end users, applications, and the database itself to capture and analyze data.',
  coverImage: 'https://codewithharry.com/blog-placeholder.jpg',
};

function getContent() {
  const fs = require('fs');
  const path = require('path');
  return fs.readFileSync(path.join(__dirname, '..', 'data', 'sql-course.md'), 'utf8');
}

async function upsertSeedPost() {
  const content = getContent();
  const existing = await Post.findOne({ slug: SEED_POST.slug });
  if (existing) {
    await Post.findOneAndUpdate({ slug: SEED_POST.slug }, { ...SEED_POST, content }, {
      new: true,
      runValidators: true,
    });
    console.log('Seed post updated:', SEED_POST.slug);
  } else {
    await Post.create({ ...SEED_POST, content });
    console.log('Seed post created:', SEED_POST.slug);
  }
}

module.exports = { SEED_POST, upsertSeedPost };
