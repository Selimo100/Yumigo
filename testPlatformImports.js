// Simple test to verify platform utilities structure
const fs = require('fs');
const path = require('path');

console.log('Testing platform imports structure...');

// Check if files exist
const platformUtilsPath = path.join(__dirname, 'utils/platformStyles.js');
const indexPath = path.join(__dirname, 'utils/platformStyles/index.js');

console.log('platformStyles.js exists:', fs.existsSync(platformUtilsPath));
console.log('platformStyles/index.js exists:', fs.existsSync(indexPath));

// Read the index file to check exports
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  console.log('\nIndex file content:');
  console.log(indexContent);
  
  // Check if it references the correct path
  if (indexContent.includes('../platformStyles')) {
    console.log('✅ Index file correctly references ../platformStyles');
  } else {
    console.log('❌ Index file does not reference ../platformStyles');
  }
}

console.log('Platform structure test completed!');
