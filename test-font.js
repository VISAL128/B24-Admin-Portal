// Simple test to check if font files are accessible
const fs = require('fs');
const path = require('path');

const publicFontsPath = path.join(__dirname, 'public', 'fonts');
const notoSansKhmerPath = path.join(publicFontsPath, 'NotoSansKhmer-Regular.ttf');
const khmerOSPath = path.join(publicFontsPath, 'KhmerOS.ttf');

console.log('Testing font files accessibility...');

try {
  const notoStats = fs.statSync(notoSansKhmerPath);
  console.log(`✅ NotoSansKhmer-Regular.ttf found (${notoStats.size} bytes)`);
} catch (error) {
  console.log(`❌ NotoSansKhmer-Regular.ttf not found at ${notoSansKhmerPath}`);
}

try {
  const khmerOSStats = fs.statSync(khmerOSPath);
  console.log(`✅ KhmerOS.ttf found (${khmerOSStats.size} bytes)`);
} catch (error) {
  console.log(`❌ KhmerOS.ttf not found at ${khmerOSPath}`);
}

console.log('Font test complete!');
