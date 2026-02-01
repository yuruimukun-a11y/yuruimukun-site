/**
 * 全楽曲ページにcanonicalタグとOGP URLを追加するスクリプト
 */
const fs = require('fs');
const path = require('path');

const tracksDir = './public/tracks';
const baseUrl = 'https://yuruimukun.com';

// 処理対象外のファイル
const excludeFiles = ['index.html'];

// tracksディレクトリ内のHTMLファイルを取得
const files = fs.readdirSync(tracksDir)
  .filter(file => file.endsWith('.html') && !excludeFiles.includes(file));

console.log(`Processing ${files.length} track pages...`);

let successCount = 0;
let errorCount = 0;

files.forEach(filename => {
  try {
    const filePath = path.join(tracksDir, filename);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // すでにcanonicalタグがある場合はスキップ
    if (content.includes('rel="canonical"')) {
      console.log(`⏭️  Skipped: ${filename} (already has canonical)`);
      return;
    }
    
    // URLを生成（拡張子はそのまま）
    const pageUrl = `${baseUrl}/public/tracks/${filename}`;
    
    // canonicalタグとOGP URLを追加
    const canonicalTag = `  <!-- Canonical URL -->
  <link rel="canonical" href="${pageUrl}">
  
  <!-- OGP URL -->
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:image" content="${baseUrl}/images/ogp.png">
  
  `;
    
    // <link rel="preconnect" の直前に挿入
    const insertPosition = content.indexOf('<link rel="preconnect"');
    
    if (insertPosition === -1) {
      // preconnectがない場合は</head>の直前に挿入
      const headEnd = content.indexOf('</head>');
      if (headEnd === -1) {
        throw new Error('</head> tag not found');
      }
      content = content.slice(0, headEnd) + canonicalTag + content.slice(headEnd);
    } else {
      content = content.slice(0, insertPosition) + canonicalTag + content.slice(insertPosition);
    }
    
    // ファイルに書き込み
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filename}`);
    successCount++;
    
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error.message);
    errorCount++;
  }
});

console.log(`\n========================================`);
console.log(`✅ Success: ${successCount} files`);
console.log(`❌ Error: ${errorCount} files`);
console.log(`========================================`);
