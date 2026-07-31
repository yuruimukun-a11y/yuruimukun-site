const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const tracksDir = path.join(rootDir, "public", "tracks");
const lyricsIndexPath = path.join(rootDir, "public", "lyrics", "index.html");
const tracksIndexPath = path.join(tracksDir, "index.html");
const sitemapPath = path.join(rootDir, "sitemap.xml");
const siteOrigin = "https://yuruimukun.com";
const artistId = `${siteOrigin}/#artist`;
const expectedLyricsFiles = [
  "manji.html",
  "nekosanka.html",
  "mujun-sanka.html",
  "jibungajibunzyanainonara.html",
  "breakbeats.html",
  "nekosan-wa-sugoi-uta.html",
  "run.html",
  "orei.html",
  "oumagadoki.html",
  "owatte-hajimatte.html",
  "wasure-oto.html",
  "yoku.html",
];
const lastmod =
  process.env.LYRICS_LASTMOD || new Date().toISOString().slice(0, 10);

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function writeText(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents, "utf8");
}

function detectEol(contents) {
  return contents.includes("\r\n") ? "\r\n" : "\n";
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function decodeHtml(value) {
  const namedEntities = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: "\u00a0",
    quot: '"',
  };

  return value.replace(
    /&(#x[\da-f]+|#\d+|[a-z]+);/gi,
    (entity, key) => {
      if (key.startsWith("#x")) {
        return String.fromCodePoint(Number.parseInt(key.slice(2), 16));
      }
      if (key.startsWith("#")) {
        return String.fromCodePoint(Number.parseInt(key.slice(1), 10));
      }
      return namedEntities[key.toLowerCase()] ?? entity;
    },
  );
}

function htmlToPlainText(value) {
  const paragraphs = [
    ...value.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi),
  ];
  const blocks =
    paragraphs.length > 0 ? paragraphs.map((match) => match[1]) : [value];

  return blocks
    .map((block) =>
      decodeHtml(
        block
          .replace(/<br\s*\/?>/gi, "\u0000")
          .replace(/<[^>]+>/g, ""),
      )
        .split("\u0000")
        .map((line) => line.replace(/[\t\r\n\f ]+/g, " ").trim())
        .join("\n"),
    )
    .join("\n\n")
    .trim();
}

function extractRequired(contents, pattern, label, filePath) {
  const match = contents.match(pattern);
  if (!match) {
    throw new Error(`${label} が見つかりません: ${filePath}`);
  }
  return match;
}

function replaceRequired(contents, pattern, replacement, label, filePath) {
  if (!pattern.test(contents)) {
    throw new Error(`${label} が見つかりません: ${filePath}`);
  }
  return contents.replace(pattern, replacement);
}

function getLyricsPage(filePath) {
  const html = readText(filePath);
  if (!/<section\b[^>]*class="[^"]*\blyrics-section\b[^"]*"/i.test(html)) {
    return null;
  }

  const h1Match = extractRequired(
    html,
    /<h1\b[^>]*class="[^"]*\btrack-title\b[^"]*"[^>]*>([\s\S]*?)<\/h1>/i,
    "楽曲H1",
    filePath,
  );
  const name = htmlToPlainText(h1Match[1]).replace(/\s+公式歌詞$/, "");
  const lyricsMatch = extractRequired(
    html,
    /<div\b[^>]*class="[^"]*\blyrics-text\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    "歌詞本文",
    filePath,
  );
  const canonicalMatch = extractRequired(
    html,
    /<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"[^>]*>/i,
    "canonical",
    filePath,
  );
  const expectedCanonical = `${siteOrigin}/public/tracks/${path.basename(filePath)}`;

  if (canonicalMatch[1] !== expectedCanonical) {
    throw new Error(
      `canonical が正本URLと一致しません: ${filePath} (${canonicalMatch[1]})`,
    );
  }

  const h2Matches = [
    ...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi),
  ].map((match) => htmlToPlainText(match[1]));
  if (!h2Matches.includes(`${name} 歌詞`)) {
    throw new Error(`歌詞見出し「${name} 歌詞」が見つかりません: ${filePath}`);
  }

  return {
    filePath,
    fileName: path.basename(filePath),
    html,
    name,
    canonical: expectedCanonical,
    lyricsHtml: lyricsMatch[1],
    lyricsText: htmlToPlainText(lyricsMatch[1]),
  };
}

function updateLyricsPage(page) {
  const eol = detectEol(page.html);
  const description = `ゆるいむくん本人による「${page.name}」の公式歌詞です。歌詞全文、楽曲情報、制作背景を公式サイトで掲載しています。`;
  const title = `${page.name} 公式歌詞｜ゆるいむくん`;
  const composition = {
    "@context": "https://schema.org",
    "@type": "MusicComposition",
    "@id": `${page.canonical}#composition`,
    name: page.name,
    url: page.canonical,
    inLanguage: "ja",
    composer: {
      "@type": "MusicGroup",
      "@id": artistId,
      name: "ゆるいむくん",
      url: siteOrigin,
    },
    lyricist: {
      "@type": "MusicGroup",
      "@id": artistId,
      name: "ゆるいむくん",
      url: siteOrigin,
    },
    lyrics: {
      "@type": "CreativeWork",
      "@id": `${page.canonical}#lyrics`,
      name: `${page.name} 公式歌詞`,
      inLanguage: "ja",
      text: page.lyricsText,
    },
  };
  const jsonLd = JSON.stringify(composition, null, 2).replace(
    /</g,
    "\\u003c",
  );
  const jsonLdBlock = [
    "  <!-- OFFICIAL_LYRICS_JSON_LD:START -->",
    '  <script type="application/ld+json">',
    ...jsonLd.split("\n").map((line) => `  ${line}`),
    "  </script>",
    "  <!-- OFFICIAL_LYRICS_JSON_LD:END -->",
  ].join(eol);

  const managedBlockPattern =
    /[ \t]*<!-- OFFICIAL_LYRICS_JSON_LD:START -->[\s\S]*?<!-- OFFICIAL_LYRICS_JSON_LD:END -->[ \t]*(?:\r?\n)?/;
  const musicCompositionPattern =
    /<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?"@type"\s*:\s*"MusicComposition"[\s\S]*?<\/script>/i;

  let updated = page.html;
  if (!managedBlockPattern.test(updated) && musicCompositionPattern.test(updated)) {
    throw new Error(
      `管理対象外の MusicComposition JSON-LD があります: ${page.filePath}`,
    );
  }

  updated = replaceRequired(
    updated,
    /<title>[\s\S]*?<\/title>/i,
    `<title>${escapeHtml(title)}</title>`,
    "title",
    page.filePath,
  );
  updated = replaceRequired(
    updated,
    /<meta\b[^>]*name="description"[^>]*>/i,
    `<meta name="description" content="${escapeHtml(description)}">`,
    "meta description",
    page.filePath,
  );
  updated = replaceRequired(
    updated,
    /<meta\b[^>]*property="og:title"[^>]*>/i,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    "og:title",
    page.filePath,
  );
  updated = replaceRequired(
    updated,
    /<meta\b[^>]*property="og:description"[^>]*>/i,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    "og:description",
    page.filePath,
  );
  updated = replaceRequired(
    updated,
    /<h1\b([^>]*class="[^"]*\btrack-title\b[^"]*"[^>]*)>[\s\S]*?<\/h1>/i,
    `<h1$1>${escapeHtml(`${page.name} 公式歌詞`)}</h1>`,
    "楽曲H1",
    page.filePath,
  );

  if (managedBlockPattern.test(updated)) {
    updated = updated.replace(managedBlockPattern, `${jsonLdBlock}${eol}`);
  } else {
    updated = updated.replace(/<\/head>/i, `${jsonLdBlock}${eol}</head>`);
  }

  const updatedLyricsMatch = extractRequired(
    updated,
    /<div\b[^>]*class="[^"]*\blyrics-text\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    "更新後の歌詞本文",
    page.filePath,
  );
  if (updatedLyricsMatch[1] !== page.lyricsHtml) {
    throw new Error(`歌詞本文が変更されました: ${page.filePath}`);
  }

  writeText(page.filePath, updated);
}

function getTrackOrder() {
  const html = readText(tracksIndexPath);
  const order = [];
  const linkPattern =
    /<a\b[^>]*href="\.\/([^"]+\.html)"[^>]*class="[^"]*\btrack-card\b[^"]*"/gi;
  for (const match of html.matchAll(linkPattern)) {
    if (!order.includes(match[1])) {
      order.push(match[1]);
    }
  }
  return order;
}

function createLyricsIndex(pages) {
  const cards = pages
    .map(
      (page) => `      <a href="/public/tracks/${escapeHtml(page.fileName)}" class="track-card">
        <span class="track-card-title">${escapeHtml(page.name)}の公式歌詞を読む</span>
        <span class="track-card-genre">公式歌詞</span>
        <span class="track-card-description">歌詞全文と楽曲背景を掲載しています。</span>
      </a>`,
    )
    .join("\n\n");

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>公式歌詞一覧｜ゆるいむくん</title>
  <meta name="description" content="ゆるいむくん本人による歌もの楽曲の公式歌詞一覧です。各楽曲の歌詞全文と楽曲背景を掲載しています。">
  <meta property="og:title" content="公式歌詞一覧｜ゆるいむくん">
  <meta property="og:description" content="ゆるいむくん本人による歌もの楽曲の公式歌詞一覧です。各楽曲の歌詞全文と楽曲背景を掲載しています。">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://yuruimukun.com/public/lyrics/">
  <meta property="og:image" content="https://yuruimukun.com/images/ogp.png">
  <link rel="canonical" href="https://yuruimukun.com/public/lyrics/">

  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/track-page.css">
  <link rel="stylesheet" href="/css/secret.css">
</head>
<body>
  <header class="site-header">
    <a href="/" class="logo">ゆるいむくん</a>
    <nav class="nav">
      <a href="/">ホーム</a>
      <a href="/public/tracks/">楽曲一覧</a>
      <a href="/public/lyrics/">公式歌詞</a>
    </nav>
  </header>

  <main class="track-list-page">
    <h1 class="page-title">ゆるいむくん 公式歌詞一覧</h1>
    <p class="page-description">ゆるいむくん本人による、歌もの楽曲の公式歌詞一覧です。各ページに歌詞全文と楽曲情報を掲載しています。</p>

    <div class="track-grid">
${cards}
    </div>
  </main>

  <footer class="site-footer">
    <p>&copy; 2025 ゆるいむくん</p>
    <nav class="footer-nav">
      <a href="/privacy.html">プライバシーポリシー</a>
      <a href="/terms.html">利用規約</a>
      <a href="/contact.html">お問い合わせ</a>
    </nav>
  </footer>
  <script src="/js/secret.js?v=20260620e"></script>
</body>
</html>
`;
}

function updateSitemap(pages) {
  let sitemap = readText(sitemapPath);
  const eol = detectEol(sitemap);
  const lyricsIndexUrl = `${siteOrigin}/public/lyrics/`;

  for (const page of pages) {
    const urlBlockPattern = new RegExp(
      `<url>\\s*<loc>${escapeRegExp(page.canonical)}</loc>[\\s\\S]*?</url>`,
    );
    const match = sitemap.match(urlBlockPattern);
    if (!match) {
      throw new Error(`歌詞ページが sitemap にありません: ${page.canonical}`);
    }
    const updatedBlock = replaceRequired(
      match[0],
      /<lastmod>[^<]+<\/lastmod>/,
      `<lastmod>${lastmod}</lastmod>`,
      "sitemap lastmod",
      sitemapPath,
    );
    sitemap = sitemap.replace(urlBlockPattern, updatedBlock);
  }

  const indexBlockPattern = new RegExp(
    `^[ \\t]*<url>\\s*<loc>${escapeRegExp(lyricsIndexUrl)}</loc>[\\s\\S]*?</url>`,
    "m",
  );
  const indexBlock = [
    "  <url>",
    `    <loc>${lyricsIndexUrl}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    "    <changefreq>monthly</changefreq>",
    "    <priority>0.8</priority>",
    "  </url>",
  ].join(eol);
  if (indexBlockPattern.test(sitemap)) {
    sitemap = sitemap.replace(indexBlockPattern, indexBlock);
  } else {
    sitemap = sitemap.replace(
      /<\/urlset>/,
      `${indexBlock}${eol}</urlset>`,
    );
  }

  writeText(sitemapPath, sitemap);
}

function main() {
  const discoveredPages = fs
    .readdirSync(tracksDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => getLyricsPage(path.join(tracksDir, entry.name)))
    .filter(Boolean);
  const discoveredFileNames = discoveredPages
    .map((page) => page.fileName)
    .sort();
  const expectedFileNames = [...expectedLyricsFiles].sort();
  if (
    JSON.stringify(discoveredFileNames) !== JSON.stringify(expectedFileNames)
  ) {
    throw new Error(
      `歌詞ページの実態が対象12曲と一致しません: ${discoveredFileNames.join(", ")}`,
    );
  }
  const trackOrder = getTrackOrder();
  const pagesByFileName = new Map(
    discoveredPages.map((page) => [page.fileName, page]),
  );
  const pages = trackOrder
    .filter((fileName) => pagesByFileName.has(fileName))
    .map((fileName) => pagesByFileName.get(fileName));

  if (pages.length !== discoveredPages.length) {
    const missing = discoveredPages
      .filter((page) => !trackOrder.includes(page.fileName))
      .map((page) => page.fileName);
    throw new Error(
      `歌詞ページが楽曲一覧にありません: ${missing.join(", ")}`,
    );
  }
  if (pages.length === 0) {
    throw new Error("歌詞ページが見つかりません");
  }

  for (const page of pages) {
    updateLyricsPage(page);
  }
  writeText(lyricsIndexPath, createLyricsIndex(pages));
  updateSitemap(pages);

  console.log(
    `公式歌詞 ${pages.length} ページ、一覧、sitemap を同期しました（lastmod: ${lastmod}）。`,
  );
}

main();
