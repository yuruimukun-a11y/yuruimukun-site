import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const excludedDirectories = new Set(['.git', '.github', '.wrangler', 'back', 'docs', 'music', 'node_modules', 'server', 'tools', 'wav_input', '_outputs']);

function collect(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collect(absolute));
    if (entry.isFile() && entry.name.endsWith('.html')) files.push(absolute);
  }
  return files;
}

function valueFromTag(html, tag, markerName, markerValue, valueName) {
  const tags = html.match(new RegExp(`<${tag}\\b[^>]*>`, 'gi')) || [];
  for (const candidate of tags) {
    const marker = candidate.match(new RegExp(`\\b${markerName}=["']([^"']+)["']`, 'i'));
    if (!marker || marker[1].toLowerCase() !== markerValue.toLowerCase()) continue;
    const value = candidate.match(new RegExp(`\\b${valueName}=["']([^"']*)["']`, 'i'));
    if (value) return value[1];
  }
  return '';
}

function escapeAttribute(value) {
  return value.replace(/&(?!(?:[a-z]+|#\d+);)/gi, '&amp;').replace(/"/g, '&quot;');
}

let changed = 0;
for (const filePath of collect(rootDir)) {
  let html = fs.readFileSync(filePath, 'utf8');
  const canonical = valueFromTag(html, 'link', 'rel', 'canonical', 'href');
  if (!canonical) continue;

  const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1]?.replace(/<[^>]+>/g, '').trim();
  const description = valueFromTag(html, 'meta', 'name', 'description', 'content');
  if (!title || !description) continue;

  const relative = path.relative(rootDir, filePath).split(path.sep).join('/');
  const lineBreak = html.includes('\r\n') ? '\r\n' : '\n';
  const type = relative.startsWith('blog/') && relative !== 'blog/index.html' ? 'article' : (relative.startsWith('public/tracks/') && relative !== 'public/tracks/index.html' ? 'music.song' : 'website');
  const fields = [
    ['og:title', escapeAttribute(title)],
    ['og:description', escapeAttribute(description)],
    ['og:type', type],
    ['og:url', canonical],
    ['og:image', 'https://yuruimukun.com/images/ogp.png'],
    ['og:image:alt', 'ゆるいむくん公式サイトの共通ソーシャル画像']
  ];
  const missing = fields.filter(([property]) => !valueFromTag(html, 'meta', 'property', property, 'content'));
  if (!missing.length) continue;

  const block = missing.map(([property, content]) => `  <meta property="${property}" content="${content}">`).join(lineBreak);
  const canonicalTag = html.match(/\s*<link\s+rel=["']canonical["'][^>]*>/i);
  if (!canonicalTag) continue;
  html = html.replace(canonicalTag[0], `${canonicalTag[0]}${lineBreak}${block}`);
  fs.writeFileSync(filePath, html, 'utf8');
  changed += 1;
}

console.log(`Added missing Open Graph metadata to ${changed} pages.`);
