require('dotenv').config();
const mongoose = require('mongoose');

const dns = require('dns');


dns.setServers(["1.1.1.1", "8.8.8.8"]);

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.log('MONGO_URI set nahi hai.');
    console.log('');
    console.log('Do options:');
    console.log('1. MongoDB Atlas (free): https://www.mongodb.com/cloud/atlas');
    console.log('   -> Cluster banao, "Connect" > "Drivers" se connection string copy karo');
    console.log('   -> server/.env me MONGO_URI= ke aage paste karo');
    console.log('2. Bina Atlas ke turant test: npm run dev:mem (temporary in-memory DB)');
    throw new Error('MONGO_URI missing');
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    console.log('Check karo: .env ka MONGO_URI sahi hai? Atlas me Network Access me apna IP allow hai?');
    throw err;
  }
}

module.exports = { connectDB };
