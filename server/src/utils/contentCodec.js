const zlib = require('zlib');

const PREFIX = '[GZ]';

function compress(text) {
  const buf = zlib.gzipSync(Buffer.from(String(text), 'utf8'));
  return PREFIX + buf.toString('base64');
}

function isCompressed(value) {
  return typeof value === 'string' && value.startsWith(PREFIX);
}

function decompress(value) {
  if (!isCompressed(value)) return value;
  const base64 = value.slice(PREFIX.length);
  return zlib.gunzipSync(Buffer.from(base64, 'base64')).toString('utf8');
}

// store helper: client may already send gzip(base64); if so store as-is
function store(value) {
  if (isCompressed(value)) return value;
  return compress(value);
}

// client ne pre-compressed gzip(base64) bheja — usme [GZ] prefix add karke store karo
function storePrecompressed(base64) {
  return PREFIX + base64;
}

function get(value) {
  return decompress(value);
}

module.exports = { compress, decompress, isCompressed, store, get, storePrecompressed, PREFIX };
