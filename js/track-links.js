/**
 * 曲ごとの外部リンク表
 * ------------------------------------------------------------------
 * ここにURLを書くと、その曲のページの再生欄の隣にボタンが出る。
 * 空文字 '' のままの項目はページに表示されない（リンク切れを作らないため）。
 *
 * 入れるURLは「曲単位」のもの。チャンネルURLやアーティストページURLは入れない。
 *   youtube  : その曲のMV・歌詞動画   例 'https://www.youtube.com/watch?v=xxxxxxxxxxx'
 *   shorts   : その曲を使った動画（Shorts等）。MVではないものはこちらへ
 *   niconico : ニコニコ動画の該当動画  例 'https://www.nicovideo.jp/watch/smXXXXXXXX'
 *   spotify  : Spotifyの曲ページ       例 'https://open.spotify.com/track/xxxxxxxxxxxxxxxxxxxxxx'
 *   apple    : Apple Musicの曲ページ   例 'https://music.apple.com/jp/album/xxxx?i=0000000000'
 *
 * 曲IDは各ページの <body data-track-id="..."> と同じ。
 */
(function () {
  'use strict';

  var TRACK_LINKS = {
    // acid（acid.html）
    'acid': { youtube: '', niconico: '', spotify: '', apple: '' },
    // antinomy day（antinomy-day.html）
    'antinomy day': { youtube: '', niconico: '', spotify: '', apple: '' },
    // atawo（atawo.html）
    'atawo': { youtube: '', niconico: '', spotify: 'https://open.spotify.com/track/0SC5036zPcAjMvIRU0SSRW', apple: '' },
    // 暑！（atsu.html）
    'atsu': { youtube: '', niconico: '', spotify: '', apple: '' },
    // F（f.html）
    'band CatsF': { youtube: '', niconico: '', spotify: '', apple: '' },
    // battle（battle.html）
    'battle': { youtube: '', niconico: '', spotify: '', apple: '' },
    // bingo（bingo.html）
    'BINGO': { youtube: '', niconico: '', spotify: '', apple: '' },
    // ブレイクブレイクビーツ（breakbeats.html）
    'breakbeats': { youtube: 'https://www.youtube.com/watch?v=ojeq9jwZPpk', niconico: '', spotify: '', apple: '' },
    // celtic music nekos（celtic-music-nekos.html）
    'celtic-music-nekos': { youtube: '', niconico: '', spotify: '', apple: '' },
    // ダンシング・ネコズ（dancing-nekos.html）
    'dancing-nekos': { youtube: '', niconico: '', spotify: '', apple: '' },
    // danmaku（danmaku.html）
    'Danmaku': { youtube: '', niconico: '', spotify: '', apple: '' },
    // forest session（forest-session.html）
    'forest session': { youtube: '', niconico: '', spotify: '', apple: '' },
    // 振り返る（furikaeru.html）
    'furikaeru': { youtube: '', niconico: '', spotify: '', apple: '' },
    // ハロウィンマヌルネコ（halloween-manul.html）
    'halloween-manul neko': { youtube: '', niconico: '', spotify: 'https://open.spotify.com/track/59bfXBKmLeznTwJ16P5Ns9', apple: '' },
    // ハロウィンおかたずけ（halloween-okatazuke.html）
    'halloween-okataduke': { youtube: '', niconico: '', spotify: '', apple: '' },
    // 自分が自分じゃないのなら（jibungajibunzyanainonara.html）
    'jibungajibunzyanainonara': { youtube: 'https://www.youtube.com/watch?v=CzqR3Doaz9c', niconico: 'https://www.nicovideo.jp/watch/sm45914776', spotify: '', apple: '' },
    // 狐パンク（kitsune-punk.html）
    'kitsune-punk': { youtube: '', niconico: '', spotify: '', apple: '' },
    // きつねこ続（kitsuneko-zoku.html）
    'kitsuneko-zoku': { youtube: '', niconico: '', spotify: '', apple: '' },
    // kome battle（kome-battle.html）
    'komebattle': { youtube: '', niconico: '', spotify: '', apple: '' },
    // 卍（まんじ）（manji.html）
    'manji': { youtube: '', niconico: '', spotify: '', apple: '' },
    // マリーナ（marina.html）
    'marina': { youtube: '', niconico: '', spotify: '', apple: '' },
    // maron battle（maron-battle.html）
    'Marron battle': { youtube: '', niconico: '', spotify: '', apple: '' },
    // MIKAN NEKOSAN（mikan-nekosan.html）
    'MIKAN NEKOSAN': { youtube: '', niconico: '', spotify: '', apple: '' },
    // 港町（minatomati.html）
    'minatomati': { youtube: '', niconico: '', spotify: '', apple: '' },
    // 水旅（mizutabi.html）
    'mizutabi': { youtube: '', niconico: '', spotify: '', apple: '' },
    // 矛盾賛歌（mujun-sanka.html）
    'mujun-sanka': { youtube: 'https://www.youtube.com/watch?v=vso4nNqfFfY', niconico: 'https://www.nicovideo.jp/watch/sm44180149', spotify: '', apple: '' },
    // 名前のまま（namaenomama.html）
    'namaenomama': { youtube: 'https://www.youtube.com/watch?v=ALLqwPJZFf4', niconico: 'https://www.nicovideo.jp/watch/sm46500897', spotify: '', apple: '' },
    // ねこさんはすごいうた（nekosan-wa-sugoi-uta.html）
    'nekosan wa sugoi-uta': { youtube: '', niconico: '', spotify: '', apple: '' },
    // ねこさんか（猫賛歌）（nekosanka.html）
    'nekosanka': { youtube: '', niconico: '', spotify: '', apple: '' },
    // ninja（ninja.html）
    'ninja': { youtube: 'https://www.youtube.com/watch?v=DerxeaTYuYA', niconico: '', spotify: '', apple: '' },
    // 踊ろ―（odoro.html）
    'odoro-': { youtube: '', niconico: '', spotify: '', apple: '' },
    // 御礼（orei.html）
    'onnrei': { youtube: '', niconico: '', spotify: '', apple: '' },
    // 逢魔時（oumagadoki.html）
    'oumagadoki': { youtube: 'https://www.youtube.com/watch?v=2eFjAMWJ0o4', niconico: 'https://www.nicovideo.jp/watch/sm44594476', spotify: 'https://open.spotify.com/track/039YUZFq1qwA6VdFgBxerp', apple: '' },
    // おわってはじまって（owatte-hajimatte.html）
    'owatte-hajimatte': { youtube: '', niconico: '', spotify: '', apple: '' },
    // oyasumi（oyasumi.html）
    'oyasumi': { youtube: '', niconico: '', spotify: '', apple: '' },
    // picnic（picnic.html）
    'picnic': { youtube: '', niconico: '', spotify: '', apple: '' },
    // reverth going back（reverth-going-back.html）
    'reverth going back': { youtube: '', niconico: '', spotify: '', apple: '' },
    // revolutionary event（revolutionary-event.html）
    'revolutionary event': { youtube: '', niconico: '', spotify: '', apple: '' },
    // ラン（run.html）
    'run': { youtube: '', niconico: '', spotify: '', apple: '' },
    // running culture（running-culture.html）
    'runing culture': { youtube: '', niconico: '', spotify: '', apple: '' },
    // sakana（sakana.html）
    'sakana': { youtube: '', niconico: '', spotify: '', apple: '' },
    // sekaisora（sekaisora.html）
    'sekaizora': { youtube: '', niconico: '', spotify: '', apple: '' },
    // 灯（akari.html）
    'tomoshibi': { youtube: '', niconico: '', spotify: 'https://open.spotify.com/track/5U0e3llrwTIKCMrUZGgkEu', apple: '' },
    // ネコカフェ（作品ページは未作成。ページを作れば自動で表示される）
    'neko-cafe': { youtube: '', shorts: 'https://www.youtube.com/shorts/G-M8xYUf1Cc', niconico: '', spotify: 'https://open.spotify.com/track/6fCdDVfuW1t3jNKBimI9hg', apple: '' },
    // 海カフェ（umi-cafe.html）
    'umi-cafe': { youtube: '', shorts: 'https://www.youtube.com/shorts/R0ySiY9WR0c', niconico: '', spotify: 'https://open.spotify.com/track/3VC7Eqc7ERI0uHWd06MM1W', apple: '' },
    // ウェイクアップ・ねこさんs（wakeup-nekosan.html）
    'wakeup-nekosan': { youtube: '', niconico: '', spotify: '', apple: '' },
    // 忘音（wasure-oto.html）
    'wasure-oto': { youtube: '', niconico: '', spotify: '', apple: '' },
    // 欲（yoku.html）
    'yoku': { youtube: 'https://www.youtube.com/watch?v=939WACNY-XI', niconico: 'https://www.nicovideo.jp/watch/sm45220593', spotify: '', apple: '' },
  };

  var LABELS = {
    youtube: { text: 'この曲のMVを見る', target: 'youtube_track', external: true },
    shorts: { text: 'この曲を使った動画を見る', target: 'youtube_shorts', external: true },
    niconico: { text: 'ニコニコ動画で見る', target: 'niconico_track', external: true },
    spotify: { text: 'Spotifyでこの曲を聴く', target: 'spotify_track', external: true },
    apple: { text: 'Apple Musicで聴く', target: 'apple_track', external: true }
  };

  var ORDER = ['youtube', 'shorts', 'niconico', 'spotify', 'apple'];

  function currentTrackId() {
    var body = document.body;
    if (body && body.getAttribute('data-track-id')) {
      return body.getAttribute('data-track-id');
    }
    var audio = document.querySelector('[data-track-audio][data-src]');
    if (audio) {
      var m = audio.getAttribute('data-src').match(/r2\.dev\/(?:tracks\/)?([^/]+)\/playlist\.m3u8/);
      if (m) return m[1];
    }
    var top = document.querySelector('a[href^="/?track="]');
    if (top) {
      return decodeURIComponent(top.getAttribute('href').split('track=')[1].split('&')[0]);
    }
    return null;
  }

  function findContainer() {
    var existing = document.querySelector('.embedded-audio-links');
    if (existing) return existing;

    var player = document.querySelector('.track-player');
    if (!player) return null;

    var box = document.createElement('div');
    box.className = 'embedded-audio-links';
    player.appendChild(box);
    return box;
  }

  // 曲単位のリンクが用意できたら、同じサービスの「チャンネル/アーティストを探す」系リンクは消す。
  // 探し直させないための処理なので、消すのは総当たり用の入口だけに限る。
  var GENERIC_PATTERNS = {
    youtube: [/youtube\.com\/channel\//i, /youtube\.com\/@/i, /music\.youtube\.com\/search/i],
    spotify: [/open\.spotify\.com\/[^/]*\/?artist\//i],
    apple: [/music\.apple\.com\/[^/]+\/artist\//i],
    niconico: [/nicovideo\.jp\/user\//i]
  };

  function dropGenericLinks(container, key) {
    var patterns = GENERIC_PATTERNS[key];
    if (!patterns) return;

    var anchors = container.querySelectorAll('a[href]');
    anchors.forEach(function (a) {
      var href = a.getAttribute('href') || '';
      for (var i = 0; i < patterns.length; i++) {
        if (patterns[i].test(href)) {
          a.remove();
          return;
        }
      }
    });
  }

  // 既存のリンクにも計測用の属性が無ければ付ける
  function tagUntracked(container) {
    var anchors = container.querySelectorAll('a[href]:not([data-traffic-target])');
    anchors.forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var target = 'other_link';
      if (/youtube\.com|youtu\.be/i.test(href)) target = 'youtube_generic';
      else if (/spotify\.com/i.test(href)) target = 'spotify_generic';
      else if (/music\.apple\.com/i.test(href)) target = 'apple_generic';
      else if (href.indexOf('/?track=') === 0) target = 'play_link';
      a.setAttribute('data-traffic-target', target);
    });
  }

  function render() {
    var trackId = currentTrackId();
    if (!trackId) return;

    if (document.body && !document.body.getAttribute('data-track-id')) {
      document.body.setAttribute('data-track-id', trackId);
    }

    var links = TRACK_LINKS[trackId];
    if (!links) {
      var box = document.querySelector('.embedded-audio-links');
      if (box) tagUntracked(box);
      return;
    }

    var available = ORDER.filter(function (key) {
      return links[key] && String(links[key]).trim();
    });

    var container = findContainer();
    if (!container) return;

    if (!available.length) {
      tagUntracked(container);
      return;
    }

    // ページ全体から、置き換わる汎用リンクを先に取り除く
    var scope = document.querySelector('.track-content') || document;
    available.forEach(function (key) {
      dropGenericLinks(scope, key);
    });

    available.forEach(function (key) {
      var meta = LABELS[key];
      var a = document.createElement('a');
      a.className = 'track-link-chip track-link-chip--secondary';
      a.href = String(links[key]).trim();
      a.textContent = meta.text;
      a.setAttribute('data-traffic-target', meta.target);
      if (meta.external) {
        a.target = '_blank';
        a.rel = 'noopener';
      }
      container.appendChild(a);
    });

    tagUntracked(container);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
