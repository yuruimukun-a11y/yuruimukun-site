const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const siteOrigin = "https://yuruimukun.com";
const expectedPages = new Map([
  ["manji.html", "卍（まんじ）"],
  ["nekosanka.html", "ねこさんか（猫賛歌）"],
  ["mujun-sanka.html", "矛盾賛歌"],
  ["jibungajibunzyanainonara.html", "自分が自分じゃないのなら"],
  ["breakbeats.html", "ブレイクブレイクビーツ"],
  ["nekosan-wa-sugoi-uta.html", "ねこさんはすごいうた"],
  ["run.html", "ラン"],
  ["orei.html", "御礼"],
  ["oumagadoki.html", "逢魔時"],
  ["owatte-hajimatte.html", "おわってはじまって"],
  ["wasure-oto.html", "忘音"],
  ["yoku.html", "欲"],
]);
const changedPages = [
  path.join(rootDir, "index.html"),
  path.join(rootDir, "public", "lyrics", "index.html"),
  ...[...expectedPages.keys()].map((fileName) =>
    path.join(rootDir, "public", "tracks", fileName),
  ),
];
const failures = [];

function fail(message) {
  failures.push(message);
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
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

function findOne(html, pattern, label, fileName) {
  const match = html.match(pattern);
  if (!match) {
    fail(`${fileName}: ${label} がありません`);
    return null;
  }
  return match;
}

function validateLyricsPage(fileName, expectedName) {
  const filePath = path.join(rootDir, "public", "tracks", fileName);
  const html = readText(filePath);
  const canonical = `${siteOrigin}/public/tracks/${fileName}`;
  const expectedTitle = `${expectedName} 公式歌詞｜ゆるいむくん`;

  if (!html.includes(`<title>${expectedTitle}</title>`)) {
    fail(`${fileName}: title が期待値と一致しません`);
  }
  if (
    !html.includes(
      `<h1 class="track-title">${expectedName} 公式歌詞</h1>`,
    )
  ) {
    fail(`${fileName}: H1 が公式歌詞を明示していません`);
  }
  if (!html.includes(`>${expectedName} 歌詞</h2>`)) {
    fail(`${fileName}: 歌詞H2がありません`);
  }
  if (!html.includes(`rel="canonical" href="${canonical}"`)) {
    fail(`${fileName}: canonical が期待値と一致しません`);
  }
  if (
    !/<meta\b[^>]*name="description"[^>]*content="[^"]*公式歌詞[^"]*"[^>]*>/i.test(
      html,
    )
  ) {
    fail(`${fileName}: meta description が公式歌詞を明示していません`);
  }
  if (
    /<meta\b[^>]*(?:name=["']robots["'][^>]*content=["'][^"']*noindex|content=["'][^"']*noindex[^>]*name=["']robots["'])/i.test(
      html,
    )
  ) {
    fail(`${fileName}: noindex が設定されています`);
  }

  const lyricsMatch = findOne(
    html,
    /<div\b[^>]*class="[^"]*\blyrics-text\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    "表示歌詞",
    fileName,
  );
  if (!lyricsMatch) {
    return;
  }
  const visibleLyrics = htmlToPlainText(lyricsMatch[1]);
  if (!visibleLyrics) {
    fail(`${fileName}: 表示歌詞が空です`);
  }

  const jsonScripts = [
    ...html.matchAll(
      /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ];
  const compositions = [];
  for (const scriptMatch of jsonScripts) {
    try {
      const parsed = JSON.parse(scriptMatch[1]);
      if (parsed["@type"] === "MusicComposition") {
        compositions.push(parsed);
      }
    } catch (error) {
      fail(`${fileName}: JSON-LDを解析できません (${error.message})`);
    }
  }
  if (compositions.length !== 1) {
    fail(
      `${fileName}: MusicComposition が1件ではありません (${compositions.length})`,
    );
    return;
  }

  const composition = compositions[0];
  if (composition.name !== expectedName || composition.url !== canonical) {
    fail(`${fileName}: MusicComposition の曲名またはURLが不一致です`);
  }
  for (const role of ["composer", "lyricist"]) {
    if (
      composition[role]?.["@type"] !== "MusicGroup" ||
      composition[role]?.["@id"] !== `${siteOrigin}/#artist`
    ) {
      fail(`${fileName}: ${role} が既存のMusicGroup実体を参照していません`);
    }
  }
  if (composition.lyrics?.text !== visibleLyrics) {
    fail(`${fileName}: JSON-LDの歌詞が表示歌詞と一致しません`);
  }
}

function validateLyricsIndex() {
  const filePath = path.join(rootDir, "public", "lyrics", "index.html");
  const html = readText(filePath);
  const expectedDescription =
    "ゆるいむくん本人による歌もの楽曲の公式歌詞一覧です。各楽曲の歌詞全文と楽曲背景を掲載しています。";

  if (!html.includes("<title>公式歌詞一覧｜ゆるいむくん</title>")) {
    fail("公式歌詞一覧: title が期待値と一致しません");
  }
  if (
    !html.includes(
      `<meta name="description" content="${expectedDescription}">`,
    )
  ) {
    fail("公式歌詞一覧: meta description が期待値と一致しません");
  }
  if (!html.includes('<h1 class="page-title">ゆるいむくん 公式歌詞一覧</h1>')) {
    fail("公式歌詞一覧: H1 が期待値と一致しません");
  }
  if (
    !html.includes(
      '<p class="page-description">ゆるいむくん本人による、歌もの楽曲の公式歌詞一覧です。各ページに歌詞全文と楽曲情報を掲載しています。</p>',
    )
  ) {
    fail("公式歌詞一覧: 導入文が指定文言と一致しません");
  }
  if (
    !html.includes(
      'rel="canonical" href="https://yuruimukun.com/public/lyrics/"',
    )
  ) {
    fail("公式歌詞一覧: canonical が期待値と一致しません");
  }

  const links = [
    ...html.matchAll(
      /<a\b[^>]*href="\/public\/tracks\/([^"]+\.html)"[^>]*class="[^"]*\btrack-card\b[^"]*"[^>]*>[\s\S]*?<span\b[^>]*class="track-card-title"[^>]*>([\s\S]*?)<\/span>/gi,
    ),
  ];
  if (links.length !== expectedPages.size) {
    fail(`公式歌詞一覧: 楽曲リンクが12件ではありません (${links.length})`);
  }
  const linkedFiles = new Set();
  for (const link of links) {
    const fileName = link[1];
    const expectedName = expectedPages.get(fileName);
    linkedFiles.add(fileName);
    if (!expectedName) {
      fail(`公式歌詞一覧: 対象外ページが含まれています (${fileName})`);
      continue;
    }
    if (htmlToPlainText(link[2]) !== `${expectedName}の公式歌詞を読む`) {
      fail(`公式歌詞一覧: アンカー文言が不一致です (${fileName})`);
    }
  }
  for (const fileName of expectedPages.keys()) {
    if (!linkedFiles.has(fileName)) {
      fail(`公式歌詞一覧: リンクがありません (${fileName})`);
    }
  }
}

function validateTopPage() {
  const html = readText(path.join(rootDir, "index.html"));
  const lyricsLinks = [
    ...html.matchAll(/<a\b[^>]*href="\/public\/lyrics\/"[^>]*>/gi),
  ];
  if (lyricsLinks.length < 2) {
    fail("トップページ: ナビゲーションと本文の公式歌詞導線が揃っていません");
  }
}

function validateSitemap() {
  const sitemap = readText(path.join(rootDir, "sitemap.xml"));
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => match[1],
  );
  const duplicates = locations.filter(
    (location, index) => locations.indexOf(location) !== index,
  );
  if (duplicates.length > 0) {
    fail(`sitemap: URLが重複しています (${[...new Set(duplicates)].join(", ")})`);
  }

  const expectedLocations = [
    `${siteOrigin}/public/lyrics/`,
    ...[...expectedPages.keys()].map(
      (fileName) => `${siteOrigin}/public/tracks/${fileName}`,
    ),
  ];
  for (const location of expectedLocations) {
    if (!locations.includes(location)) {
      fail(`sitemap: URLがありません (${location})`);
    }
  }
}

function validateLocalLinks() {
  for (const filePath of changedPages) {
    const html = readText(filePath);
    const fileUrl = new URL(
      path
        .relative(rootDir, filePath)
        .split(path.sep)
        .map(encodeURIComponent)
        .join("/"),
      `${siteOrigin}/`,
    );
    for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/gi)) {
      const rawTarget = decodeHtml(match[1]);
      if (
        rawTarget.startsWith("#") ||
        /^(?:data|javascript|mailto|tel):/i.test(rawTarget)
      ) {
        continue;
      }
      const targetUrl = new URL(rawTarget, fileUrl);
      if (targetUrl.origin !== siteOrigin) {
        continue;
      }
      let localPath = decodeURIComponent(targetUrl.pathname);
      if (localPath.endsWith("/")) {
        localPath += "index.html";
      }
      const resolvedPath = path.join(
        rootDir,
        ...localPath.split("/").filter(Boolean),
      );
      if (!fs.existsSync(resolvedPath)) {
        fail(
          `${path.relative(rootDir, filePath)}: ローカルリンク先がありません (${rawTarget})`,
        );
      }
    }
  }
}

for (const [fileName, expectedName] of expectedPages) {
  validateLyricsPage(fileName, expectedName);
}
validateLyricsIndex();
validateTopPage();
validateSitemap();
validateLocalLinks();

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    "PASS: 12曲の公式歌詞、JSON-LD一致、一覧、トップ導線、sitemap、ローカルリンクを検証しました。",
  );
}
