import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const excludedDirectories = new Set(['.git', '.github', '.wrangler', 'back', 'docs', 'music', 'node_modules', 'server', 'tools', 'wav_input', '_outputs']);
const redirectSources = new Set(['/index.html', '/blog/index.html', '/public/tracks/index.html', '/public/ninja.html']);
const errors = [];
const warnings = [];

function collect(directory, relative = '') {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    const nextRelative = path.join(relative, entry.name);
    if (entry.isDirectory()) files.push(...collect(absolute, nextRelative));
    if (entry.isFile() && entry.name.endsWith('.html')) files.push(nextRelative);
  }
  return files;
}

function plain(value = '') {
  return value.replace(/<[^>]+>/g, ' ').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
}

function getAttribute(html, tag, name, value, attribute) {
  const tags = html.match(new RegExp(`<${tag}\\b[^>]*>`, 'gi')) || [];
  for (const candidate of tags) {
    const marker = candidate.match(new RegExp(`\\b${name}=["']([^"']+)["']`, 'i'));
    if (!marker || marker[1].toLowerCase() !== value.toLowerCase()) continue;
    const result = candidate.match(new RegExp(`\\b${attribute}=["']([^"']*)["']`, 'i'));
    if (result) return result[1];
  }
  return '';
}

function pathToFile(urlPath) {
  if (urlPath === '/') return 'index.html';
  const clean = decodeURIComponent(urlPath).replace(/^\//, '');
  if (clean.endsWith('/')) return path.join(clean, 'index.html');
  return clean;
}

const htmlFiles = collect(rootDir);
const sitemap = fs.readFileSync(path.join(rootDir, 'sitemap.xml'), 'utf8');
const sitemapUrls = new Set(Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1]));
const canonicalOwners = new Map();
const descriptions = new Map();
const titles = new Map();

for (const relativePath of htmlFiles) {
  if (relativePath.split(path.sep).join('/') === 'public/ninja.html') continue;
  const absolutePath = path.join(rootDir, relativePath);
  const html = fs.readFileSync(absolutePath, 'utf8');
  const noindex = /<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
  const title = plain((html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1]);
  const description = getAttribute(html, 'meta', 'name', 'description', 'content');
  const canonical = getAttribute(html, 'link', 'rel', 'canonical', 'href');
  const ogTitle = getAttribute(html, 'meta', 'property', 'og:title', 'content');
  const ogDescription = getAttribute(html, 'meta', 'property', 'og:description', 'content');
  const ogImage = getAttribute(html, 'meta', 'property', 'og:image', 'content');
  const h1Count = (html.match(/<h1\b/gi) || []).length;

  if (!title) errors.push(`${relativePath}: missing title`);
  if (!description) errors.push(`${relativePath}: missing meta description`);
  if (!canonical && !noindex && relativePath !== '404.html') errors.push(`${relativePath}: missing canonical`);
  if (canonical && !noindex) {
    if (!ogTitle) errors.push(`${relativePath}: missing og:title`);
    if (!ogDescription) errors.push(`${relativePath}: missing og:description`);
    if (!ogImage) errors.push(`${relativePath}: missing og:image`);
    if (h1Count !== 1) errors.push(`${relativePath}: expected one h1, found ${h1Count}`);
    if (!sitemapUrls.has(canonical)) errors.push(`${relativePath}: canonical missing from sitemap (${canonical})`);
  }
  if (canonical && noindex && sitemapUrls.has(canonical)) errors.push(`${relativePath}: noindex URL is in sitemap`);
  if (canonical) {
    if (canonicalOwners.has(canonical)) errors.push(`${relativePath}: duplicate canonical also used by ${canonicalOwners.get(canonical)}`);
    canonicalOwners.set(canonical, relativePath);
  }

  if (title) {
    const owners = titles.get(title) || [];
    owners.push(relativePath);
    titles.set(title, owners);
  }
  if (description) {
    const owners = descriptions.get(description) || [];
    owners.push(relativePath);
    descriptions.set(description, owners);
  }

  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(match[1]); } catch (error) { errors.push(`${relativePath}: invalid JSON-LD (${error.message})`); }
  }

  for (const match of html.matchAll(/\bhref=["']([^"']+)["']/gi)) {
    const href = match[1];
    if (/^(?:https?:|mailto:|tel:|javascript:|#)/i.test(href)) continue;
    const resolved = new URL(href, `https://yuruimukun.com/${relativePath.split(path.sep).join('/')}`);
    if (resolved.hostname !== 'yuruimukun.com') continue;
    const target = pathToFile(resolved.pathname);
    if (!fs.existsSync(path.join(rootDir, target)) && !redirectSources.has(resolved.pathname)) {
      errors.push(`${relativePath}: broken internal link ${href}`);
    }
  }

  for (const match of html.matchAll(/\bsrc=["'](\/[^"']+)["']/gi)) {
    const source = match[1].split(/[?#]/)[0];
    if (!fs.existsSync(path.join(rootDir, decodeURIComponent(source).replace(/^\//, '')))) {
      errors.push(`${relativePath}: missing local asset ${source}`);
    }
  }
}

for (const [title, owners] of titles) {
  if (owners.length > 1) warnings.push(`duplicate title: ${title} (${owners.join(', ')})`);
}
for (const [description, owners] of descriptions) {
  if (owners.length > 1) warnings.push(`duplicate description: ${description} (${owners.join(', ')})`);
}

for (const url of sitemapUrls) {
  const pathname = new URL(url).pathname;
  const relativePath = pathToFile(pathname);
  if (!fs.existsSync(path.join(rootDir, relativePath))) errors.push(`sitemap: missing file for ${url}`);
  if (redirectSources.has(pathname)) errors.push(`sitemap: redirect source included ${url}`);
}

const trackIndex = fs.readFileSync(path.join(rootDir, 'public', 'tracks', 'index.html'), 'utf8');
const cardDescriptions = Array.from(trackIndex.matchAll(/<a href="\.\/([^"]+\.html)" class="track-card"[^>]*>[\s\S]*?<span class="track-card-description">([\s\S]*?)<\/span>/g));
for (const match of cardDescriptions) {
  const length = plain(match[2]).length;
  if (length < 100 || length > 200) errors.push(`public/tracks/index.html: ${match[1]} description length ${length} (expected 100-200)`);
}

const requiredLinks = {
  'index.html': ['/public/tracks/', '/public/tracks/oyasumi.html', '/public/tracks/oumagadoki.html', '/public/tracks/kitsuneko-zoku.html'],
  'about.html': ['/public/tracks/', '/contact.html'],
  'public/tracks/oyasumi.html': ['/public/tracks/', '/about.html', '/contact.html'],
  'public/tracks/oumagadoki.html': ['/public/tracks/', '/about.html', '/contact.html'],
  'public/tracks/kitsuneko-zoku.html': ['/public/tracks/', '/about.html', '/contact.html']
};
for (const [relativePath, links] of Object.entries(requiredLinks)) {
  const html = fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
  for (const href of links) {
    if (!html.includes(`href="${href}"`)) errors.push(`${relativePath}: required link missing ${href}`);
  }
}

const priorityChecks = [
  ['public/tracks/oyasumi.html', /本作に歌詞はありません/, /data-track-audio/],
  ['public/tracks/kitsuneko-zoku.html', /本作に歌詞はありません/, /data-track-audio/],
  ['public/tracks/oumagadoki.html', /lyrics-section/, /data-track-audio/]
];
for (const [relativePath, contentPattern, playerPattern] of priorityChecks) {
  const html = fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
  if (!contentPattern.test(html)) errors.push(`${relativePath}: required lyrics status/content missing`);
  if (!playerPattern.test(html)) errors.push(`${relativePath}: embedded player missing`);
}

console.log(`HTML files checked: ${htmlFiles.length}`);
console.log(`Sitemap URLs checked: ${sitemapUrls.size}`);
console.log(`Track cards checked: ${cardDescriptions.length}`);
if (warnings.length) console.log(`Warnings:\n${warnings.map((item) => `- ${item}`).join('\n')}`);
if (errors.length) {
  console.error(`Errors:\n${errors.map((item) => `- ${item}`).join('\n')}`);
  process.exit(1);
}
console.log('Site audit passed.');
