import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(toolsDir, '..');
const indexPath = path.join(rootDir, 'public', 'tracks', 'index.html');
const tracksDir = path.dirname(indexPath);

const decodeEntities = (value) => value
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&nbsp;/g, ' ');

const plainText = (value) => decodeEntities(value
  .replace(/<br\s*\/?>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim());

function buildDescription(detailHtml, currentDescription) {
  const sections = Array.from(detailHtml.matchAll(/<section\b[^>]*class="[^"]*track-section[^"]*"[^>]*>([\s\S]*?)<\/section>/gi));
  const candidates = [];

  for (const section of sections) {
    const paragraphs = Array.from(section[1].matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi));
    for (const paragraph of paragraphs) {
      const text = plainText(paragraph[1]);
      if (text && !candidates.includes(text)) candidates.push(text);
    }
  }

  if (currentDescription && !candidates.includes(currentDescription)) {
    candidates.push(currentDescription);
  }

  let result = '';
  for (const candidate of candidates) {
    if (!candidate || result.includes(candidate)) continue;
    result += (result ? ' ' : '') + candidate;
    if (result.length >= 120) break;
  }

  if (!result) return currentDescription;
  if (result.length <= 200) return result;

  const clipped = result.slice(0, 198);
  const lastSentence = Math.max(clipped.lastIndexOf('。'), clipped.lastIndexOf('！'), clipped.lastIndexOf('？'));
  if (lastSentence >= 100) return clipped.slice(0, lastSentence + 1);
  return clipped.replace(/[、，,\s]+[^、，,\s]*$/, '') + '。';
}

let indexHtml = fs.readFileSync(indexPath, 'utf8');
let updatedCount = 0;

indexHtml = indexHtml.replace(
  /<a href="\.\/([^"]+\.html)" class="track-card"([^>]*)>([\s\S]*?)<\/a>/g,
  (cardHtml, fileName, extraAttributes, body) => {
    const detailPath = path.join(tracksDir, fileName);
    if (!fs.existsSync(detailPath)) return cardHtml;

    const detailHtml = fs.readFileSync(detailPath, 'utf8');
    const currentMatch = body.match(/<span class="track-card-description">([\s\S]*?)<\/span>/i);
    if (!currentMatch) return cardHtml;

    const currentDescription = plainText(currentMatch[1]);
    const description = buildDescription(detailHtml, currentDescription);
    const hasLyrics = /class="[^"]*lyrics-section[^"]*"/i.test(detailHtml);
    const actionLabel = hasLyrics
      ? '作品ページで公式歌詞を読む・聴く →'
      : '作品ページで詳しく見る・聴く →';

    let updatedBody = body.replace(
      /<span class="track-card-description">[\s\S]*?<\/span>/i,
      `<span class="track-card-description">${description}</span>`
    );
    updatedBody = updatedBody.replace(/\s*<span class="track-card-link-label">[\s\S]*?<\/span>\s*$/i, '');
    updatedBody = updatedBody.trimEnd();
    updatedCount += 1;

    return `<a href="./${fileName}" class="track-card"${extraAttributes}>${updatedBody}\n        <span class="track-card-link-label">${actionLabel}</span>\n      </a>`;
  }
);

fs.writeFileSync(indexPath, indexHtml, 'utf8');
console.log(`Updated ${updatedCount} track cards from their individual pages.`);
