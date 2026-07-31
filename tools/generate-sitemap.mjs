import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = path.join(rootDir, 'sitemap.xml');
const excludedDirectories = new Set([
  '.git', '.github', '.wrangler', 'back', 'docs', 'music', 'node_modules',
  'server', 'tools', 'wav_input', '_outputs'
]);
const redirectSources = new Set(['/index.html', '/blog/index.html', '/public/tracks/index.html', '/public/ninja.html']);

function collectHtmlFiles(directory, relative = '') {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.') continue;
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    const nextRelative = path.join(relative, entry.name);
    if (entry.isDirectory()) files.push(...collectHtmlFiles(absolute, nextRelative));
    if (entry.isFile() && entry.name.endsWith('.html')) files.push(nextRelative);
  }

  return files;
}

function expectedPath(relativePath) {
  const normalized = relativePath.split(path.sep).join('/');
  if (normalized === 'index.html') return '/';
  if (normalized.endsWith('/index.html')) return `/${normalized.slice(0, -'index.html'.length)}`;
  return `/${normalized}`;
}

const urls = [];
for (const relativePath of collectHtmlFiles(rootDir)) {
  const html = fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
  if (/<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) continue;

  const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["'](https:\/\/yuruimukun\.com[^"']*)["']/i)
    || html.match(/<link\s+href=["'](https:\/\/yuruimukun\.com[^"']*)["']\s+rel=["']canonical["']/i);
  if (!canonicalMatch) continue;

  const pathname = new URL(canonicalMatch[1]).pathname;
  if (redirectSources.has(pathname)) continue;
  if (pathname !== expectedPath(relativePath)) {
    console.warn(`Skipping canonical mismatch: ${relativePath} -> ${pathname}`);
    continue;
  }

  urls.push(canonicalMatch[1]);
}

const preferred = [
  'https://yuruimukun.com/',
  'https://yuruimukun.com/about.html',
  'https://yuruimukun.com/work-bgm.html',
  'https://yuruimukun.com/sleep-bgm.html',
  'https://yuruimukun.com/japanese-healing.html',
  'https://yuruimukun.com/public/tracks/',
  'https://yuruimukun.com/public/lyrics/',
  'https://yuruimukun.com/blog/'
];
const priority = new Map(preferred.map((url, index) => [url, index]));
urls.sort((a, b) => {
  const aPriority = priority.has(a) ? priority.get(a) : preferred.length;
  const bPriority = priority.has(b) ? priority.get(b) : preferred.length;
  return aPriority - bPriority || a.localeCompare(b, 'ja');
});

const body = urls.map((url) => `  <url>\n    <loc>${url}</loc>\n  </url>`).join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
fs.writeFileSync(outputPath, sitemap, 'utf8');
console.log(`Generated sitemap.xml with ${urls.length} canonical, indexable URLs.`);
