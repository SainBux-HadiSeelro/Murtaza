const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: 'dufbt2eff',
  api_key:    '864267225225937',
  api_secret: 'qBxFMAGE6ARGXCs6Qepe3Mol_ss',
});

// Test with a small 1x1 red pixel
const testBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==';

cloudinary.uploader.upload(testBase64, {
  public_id: 'wedding/test_connection',
  folder: 'wedding',
}).then(r => {
  console.log('✅ Cloudinary working! URL:', r.secure_url);
  // Clean up test image
  return cloudinary.uploader.destroy('wedding/test_connection');
}).then(() => {
  console.log('✅ Test image deleted');
}).catch(e => {
  console.error('❌ Cloudinary error:', e.message);
});
