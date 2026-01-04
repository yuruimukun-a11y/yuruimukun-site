const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT_DIR = path.join(__dirname, '..');
const PLAY_COUNTS_FILE = path.join(__dirname, 'play_counts.json');

// Load play counts from file
function loadPlayCounts() {
  try {
    if (fs.existsSync(PLAY_COUNTS_FILE)) {
      const data = fs.readFileSync(PLAY_COUNTS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading play counts:', err.message);
  }
  return {};
}

// Save play counts to file
function savePlayCounts(counts) {
  try {
    fs.writeFileSync(PLAY_COUNTS_FILE, JSON.stringify(counts, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving play counts:', err.message);
  }
}

// Initialize play counts
let playCounts = loadPlayCounts();

// MIMEタイプマッピング
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.m3u8': 'application/vnd.apple.mpegurl',
  '.ts': 'video/mp2t',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// CORSヘッダー
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Range',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range'
};

// Parse JSON body from request
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// Handle API requests
async function handleApi(req, res, urlPath) {
  // POST /api/play-count - Increment play count
  if (urlPath === '/api/play-count' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const trackId = body.trackId;

      if (!trackId) {
        res.writeHead(400, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'trackId is required' }));
        return;
      }

      // Increment count
      playCounts[trackId] = (playCounts[trackId] || 0) + 1;
      savePlayCounts(playCounts);

      console.log(`Play count: ${trackId} = ${playCounts[trackId]}`);

      res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ trackId, count: playCounts[trackId] }));
    } catch (err) {
      res.writeHead(400, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
    }
    return;
  }

  // GET /api/play-counts - Get all play counts (admin)
  if (urlPath === '/api/play-counts' && req.method === 'GET') {
    // Sort by count descending
    const sorted = Object.entries(playCounts)
      .sort((a, b) => b[1] - a[1])
      .reduce((acc, [k, v]) => { acc[k] = v; return acc; }, {});

    res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify(sorted, null, 2));
    return;
  }

  // Unknown API endpoint
  res.writeHead(404, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
}

const server = http.createServer((req, res) => {
  // OPTIONSリクエスト（CORS preflight）
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  // URLパース（クエリパラメータ除去）
  let urlPath = req.url.split('?')[0];
  urlPath = decodeURIComponent(urlPath);

  // API endpoints
  if (urlPath.startsWith('/api/')) {
    handleApi(req, res, urlPath);
    return;
  }

  // GETとHEADのみ許可（静的ファイル用）
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
    return;
  }

  // ルートへのアクセスはindex.htmlへ
  if (urlPath === '/') {
    urlPath = '/index.html';
  }

  // ファイルパス構築
  const filePath = path.join(ROOT_DIR, urlPath);

  // ディレクトリトラバーサル防止
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  // ファイル存在確認
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    // MIMEタイプ決定
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // レスポンスヘッダー
    const headers = {
      ...CORS_HEADERS,
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache'
    };

    // HLSファイルは追加のキャッシュ制御
    if (ext === '.m3u8' || ext === '.ts') {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    }

    // Rangeリクエスト対応（ストリーミング用）
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunkSize = end - start + 1;

      headers['Content-Range'] = `bytes ${start}-${end}/${stats.size}`;
      headers['Content-Length'] = chunkSize;
      headers['Accept-Ranges'] = 'bytes';

      res.writeHead(206, headers);

      if (req.method === 'HEAD') {
        res.end();
        return;
      }

      const stream = fs.createReadStream(filePath, { start, end });
      stream.pipe(res);
      stream.on('error', () => {
        res.end();
      });
    } else {
      res.writeHead(200, headers);

      if (req.method === 'HEAD') {
        res.end();
        return;
      }

      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
      stream.on('error', () => {
        res.end();
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════╗
║     ゆるいむくん Music Streaming Server            ║
╠════════════════════════════════════════════════════╣
║  Server running at: http://localhost:${PORT}          ║
║  Press Ctrl+C to stop                              ║
╚════════════════════════════════════════════════════╝
  `);
});

// 終了処理
process.on('SIGINT', () => {
  console.log('\nServer stopped.');
  process.exit(0);
});
