require('dotenv').config();
const { connectDB } = require('./db');
const PdfDocument = require('./models/PdfDocument');
const { uploadToGridFS } = require('./utils/gridfs');

function createPdfBuffer(title, subtitle) {
  const content = `BT /F1 20 Tf 50 720 Td (${title}) Tj ET\nBT /F1 13 Tf 50 680 Td (${subtitle}) Tj ET\nBT /F1 10 Tf 50 640 Td (BlogVerse PDF Vault - Handcrafted notes, cheatsheets, and tutorials.) Tj ET`;
  const len = Buffer.byteLength(content);
  const pdfStr = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${len} >>
stream
${content}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000330 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
420
%%EOF`;
  return Buffer.from(pdfStr);
}

const SAMPLE_PDFS = [
  {
    title: 'Ultimate Linux Administration & Bash Handbook',
    description: 'Complete guide from zero to advanced system mastery: package management, cronjobs, permissions, processes, and Nginx.',
    filename: 'ultimate-linux-handbook.pdf',
    category: 'DevOps & Linux',
    author: 'Sourav Kumar',
    tags: ['linux', 'bash', 'devops', 'sysadmin', 'terminal'],
    coverImage: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&q=80',
  },
  {
    title: 'Modern Web Development & React Architecture',
    description: 'Modern state management, hooks, component design patterns, and full-stack integration with Node.js and MongoDB.',
    filename: 'react-web-dev-notes.pdf',
    category: 'Web Development',
    author: 'Sourav Kumar',
    tags: ['react', 'javascript', 'frontend', 'architecture'],
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
  },
  {
    title: 'Computer Science Core & Data Structures Cheat Sheet',
    description: 'Quick reference formulas, asymptotic complexities, Big-O reference table, and binary search trees for interview prep.',
    filename: 'dsa-interview-cheatsheet.pdf',
    category: 'Cheat Sheets',
    author: 'Sourav Kumar',
    tags: ['dsa', 'algorithms', 'cs', 'interview-prep'],
    coverImage: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800&q=80',
  },
];

async function seedPdfs() {
  await connectDB();
  const count = await PdfDocument.countDocuments();
  if (count > 0) {
    console.log(`PDF Vault already has ${count} documents. Skipping seed.`);
    process.exit(0);
  }

  console.log('Seeding initial PDF documents into MongoDB GridFS...');
  for (const item of SAMPLE_PDFS) {
    const buffer = createPdfBuffer(item.title, `By ${item.author}`);
    const fileId = await uploadToGridFS(item.filename, 'application/pdf', buffer, {
      uploader: 'System Seed',
    });

    await PdfDocument.create({
      title: item.title,
      description: item.description,
      filename: item.filename,
      fileSize: buffer.length,
      fileId,
      category: item.category,
      author: item.author,
      tags: item.tags,
      coverImage: item.coverImage,
      downloads: Math.floor(Math.random() * 45) + 10,
      views: Math.floor(Math.random() * 120) + 50,
    });
    console.log(`Seeded: ${item.title}`);
  }

  console.log('Seeding completed successfully!');
  process.exit(0);
}

seedPdfs().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
