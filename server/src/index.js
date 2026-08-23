

const dns = require('dns');

const { start } = require('./app');


dns.setServers(["1.1.1.1", "8.8.8.8"]);

start().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
