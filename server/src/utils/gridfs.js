const mongoose = require('mongoose');
const stream = require('stream');

let bucket = null;

function getGridFSBucket() {
  if (!bucket) {
    if (!mongoose.connection.db) {
      throw new Error('Database connection not established yet');
    }
    const mongo = mongoose.mongo;
    bucket = new mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'pdfs',
    });
  }
  return bucket;
}

/**
 * Upload a buffer into GridFS
 * @param {string} filename 
 * @param {string} mimeType 
 * @param {Buffer} buffer 
 * @param {object} metadata 
 * @returns {Promise<ObjectId>}
 */
function uploadToGridFS(filename, mimeType, buffer, metadata = {}) {
  return new Promise((resolve, reject) => {
    const gfs = getGridFSBucket();
    const uploadStream = gfs.openUploadStream(filename, {
      contentType: mimeType,
      metadata,
    });

    const fileId = uploadStream.id;

    uploadStream.on('error', (err) => reject(err));
    uploadStream.on('finish', () => resolve(fileId));

    const readable = new stream.PassThrough();
    readable.end(buffer);
    readable.pipe(uploadStream);
  });
}

/**
 * Get download stream with optional range
 */
function getDownloadStream(fileId, options = {}) {
  const gfs = getGridFSBucket();
  const mongo = mongoose.mongo;
  const id = typeof fileId === 'string' ? new mongo.ObjectId(fileId) : fileId;
  return gfs.openDownloadStream(id, options);
}

/**
 * Delete a file and its chunks from GridFS
 */
async function deleteFromGridFS(fileId) {
  try {
    const gfs = getGridFSBucket();
    const mongo = mongoose.mongo;
    const id = typeof fileId === 'string' ? new mongo.ObjectId(fileId) : fileId;
    await gfs.delete(id);
  } catch (err) {
    console.warn(`GridFS delete warning for ${fileId}:`, err.message);
  }
}

/**
 * Check if file exists in GridFS bucket
 */
async function findFileInGridFS(fileId) {
  const mongo = mongoose.mongo;
  const id = typeof fileId === 'string' ? new mongo.ObjectId(fileId) : fileId;
  const filesColl = mongoose.connection.db.collection('pdfs.files');
  return filesColl.findOne({ _id: id });
}

module.exports = {
  getGridFSBucket,
  uploadToGridFS,
  getDownloadStream,
  deleteFromGridFS,
  findFileInGridFS,
};
