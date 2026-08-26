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
  {
    title: 'How to Integrate MongoDB into Your Next.js Apps',
    slug: 'mongodb-nextjs-integration',
    author: 'Sourav Kumar',
    quote:
      'Learn how to seamlessly integrate MongoDB into your Next.js applications with best practices for efficient connection handling, resource management, and improved performance.',
    file: 'mongodb-nextjs.md',
  },
  {
    title: 'How to Host a Next.js App in Production on an Ubuntu VPS',
    slug: 'host-nextjs-app-ubuntu-vps',
    author: 'Sourav Kumar',
    quote:
      'Deploy a Next.js application on your own Ubuntu VPS — install packages, build the app, configure NGINX as a reverse proxy, keep it alive with PM2 and secure it with free Certbot HTTPS.',
    file: 'nextjs-vps-hosting.md',
  },
  {
    title: "Build an Email Validator with HTML, CSS, and JavaScript",
    slug: 'email-validator-html-css-js',
    author: 'Sourav Kumar',
    quote:
      'A complete mini-project: validate real email addresses using a validation API with plain HTML, CSS and JavaScript — forms, fetch, async/await and responsive design in one build.',
    file: 'email-validator-project.md',
  },
  {
    title: '[Solved] Python AttributeError: object has no attribute X',
    slug: 'solved-python-attributeerror',
    author: 'Sourav Kumar',
    quote:
      'Why AttributeErrors happen in Python — nonexistent attributes, typos, early access, class vs instance confusion — with five code examples, try/except handling and a prevention checklist.',
    file: 'python-attribute-error.md',
  },
  {
    title: "[Solved] 'python was not found' on Windows — The Complete Fix",
    slug: 'solved-python-was-not-found',
    author: 'Sourav Kumar',
    quote:
      "Fix the infamous 'Python was not found; run without arguments to install from the Microsoft Store' error — reinstall with PATH or add existing Python folders to System variables step by step.",
    file: 'python-not-found-fix.md',
  },
  {
    title: 'How to Find the Python Installation Path on Windows?',
    slug: 'find-python-installation-path-windows',
    author: 'Sourav Kumar',
    quote:
      'Locate exactly where Python is installed using where python (CMD), Get-Command (PowerShell) or sys.executable — essential for environment variables and IDE setup.',
    file: 'python-install-path.md',
  },
  {
    title: 'How to Generate Random Numbers in C Language',
    slug: 'random-numbers-in-c-guide',
    author: 'Sourav Kumar',
    quote:
      'rand() vs srand() explained — why unseeded runs repeat, how time-based seeding fixes it, generating numbers in a range with modulo, and when pseudo-random is not enough.',
    file: 'c-random-numbers.md',
  },
  {
    title: 'How to Check if Keys Exist in JavaScript Objects',
    slug: 'check-keys-exist-javascript-objects',
    author: 'Sourav Kumar',
    quote:
      "The 'in' operator vs hasOwnProperty() vs Object.hasOwn() — syntax, examples and the prototype-chain gotcha that decides which method fits your use case.",
    file: 'js-check-key-exists.md',
  },
  {
    title: '[Solved] ZeroDivisionError: division by zero in Python',
    slug: 'solved-python-zerodivisionerror',
    author: 'Sourav Kumar',
    quote:
      'What causes ZeroDivisionError and two standard fixes — try/except for user input and if-guards before dividing — plus how to trace hidden division bugs in big codebases.',
    file: 'python-zero-division.md',
  },
  {
    title: 'The Ultimate Next.js Roadmap — From Zero to Full Stack',
    slug: 'ultimate-nextjs-roadmap',
    author: 'Sourav Kumar',
    quote:
      'A complete Next.js roadmap — App Router, dynamic routes, TypeScript, API routes, data fetching, and two full-stack practice projects with MongoDB, NextAuth and Cloudinary.',
    file: 'nextjs-complete-roadmap.md',
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
