const Post = require('./models/Post');

// NOTE: coverImage yahan intentionally NAHI hai.
// Images user Edit UI se khud set karta hai - seed unhe kabhi overwrite nahi karega.
const SEED_POSTS = [
  {
    title: 'The Ultimate SQL Tutorial',
    slug: 'the-ultimate-sql-course',
    author: 'Sourav Kumar',
    quote:
      'MySQL is a database management system. A Database Management System (DBMS) is software that interacts with end users, applications, and the database itself to capture and analyze data.',
    file: 'sql-course.md',
  },
  {
    title: 'The Ultimate Docker Tutorial — Complete Practice Notes',
    slug: 'the-ultimate-docker-course',
    author: 'Sourav Kumar',
    quote:
      'Docker packages an application and its dependencies into an image. A container is a running instance of an image — learn images, containers, volumes, networks, Compose and real-world database setups.',
    file: 'docker-notes.md',
  },
  {
    title: 'The Ultimate Linux & Networking Tutorial — Complete Practice Notes',
    slug: 'the-ultimate-linux-networking-course',
    author: 'Sourav Kumar',
    quote:
      'From the Linux shell to full network diagnostics — files, permissions, users, processes, DNS, ports, curl and the exact troubleshooting order used to debug real servers.',
    file: 'linux-networking.md',
  },
  {
    title: 'The Ultimate Guide — Open Source Contribution with Git & GitHub',
    slug: 'the-ultimate-open-source-contribution-course',
    author: 'Sourav Kumar',
    quote:
      'Fork → Clone → Upstream → Branch → Commit → Push → Pull Request. The complete open source contribution workflow with sync tricks, conflict fixes, PR templates and review etiquette.',
    file: 'git-open-source.md',
  },
];

function getContent(file) {
  const fs = require('fs');
  const path = require('path');
  return fs.readFileSync(path.join(__dirname, '..', 'data', file), 'utf8');
}

async function upsertSeedPosts(targets = SEED_POSTS) {
  for (const { file, ...meta } of targets) {
    const content = getContent(file);
    const existing = await Post.findOne({ slug: meta.slug });

    if (existing) {
      // Sirf CONTENT refresh hota hai - title/author/quote/coverImage user ke edits safe rehte hain
      await Post.findOneAndUpdate({ slug: meta.slug }, { content }, {
        new: true,
        runValidators: true,
      });
      console.log('Seed post content updated:', meta.slug);
    } else {
      await Post.create({ ...meta, content });
      console.log('Seed post created:', meta.slug);
    }
  }
}

module.exports = { SEED_POSTS, upsertSeedPosts };
