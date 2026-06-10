/**
 * 逢魔時の寄り道 - Secret Feature v2
 * ページ巡回型：index → tracks → blog → about → contact
 */
(function () {
  'use strict';

  var SPRITE_BASE = '/images/secret/';
  var STORAGE_KEY = 'fuura_quest_v2';
  var OLD_STORAGE_KEY = 'fuura_quest';
  var REWARD_SRC = 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/oumagadoki-piano-b/playlist.m3u8';
  var NEXT_TRACK_ID = 'oumagadoki-piano';

  var ORDER = ['home', 'tracks', 'blog', 'about', 'contact'];
  var ROUND = {
    home: {
      label: '出会い',
      anim: 'idle',
      loop: true,
      message: '……にゃ',
      nextText: '次は、楽曲一覧へ',
      nextUrl: '/public/tracks/',
      leave: 'right'
    },
    tracks: {
      label: '気配',
      anim: 'cloak',
      loop: true,
      message: '…にゃっ',
      nextText: '次は、ブログへ',
      nextUrl: '/blog/',
      leave: 'left'
    },
    blog: {
      label: 'かくれんぼ',
      anim: 'look_up',
      loop: true,
      message: 'にゃ……？',
      nextText: '次は、サイトについてへ',
      nextUrl: '/about.html',
      leave: 'left'
    },
    about: {
      label: '幻',
      anim: 'walk',
      loop: true,
      message: '…にゃん',
      nextText: '最後は、お問い合わせへ',
      nextUrl: '/contact.html',
      leave: 'right'
    },
    contact: {
      label: '再会',
      anim: 'sleep',
      loop: true,
      message: 'ついてきたのかにゃ'
    }
  };

  var ANIMS = {
    idle:      { frames: ['idle_01.png','idle_02.png','idle_03.png','idle_04.png','idle_05.png'], fps: 3 },
    blink:     { frames: ['blink_01.png','blink_02.png','blink_03.png','blink_04.png'], fps: 6 },
    walk:      { frames: ['walk_01.png','walk_02.png','walk_03.png','walk_04.png'], fps: 5 },
    surprised: { frames: ['tap_surprised_01.png','tap_surprised_02.png','tap_surprised_03.png','tap_surprised_04.png'], fps: 6 },
    cloak:     { frames: ['cloak_flutter_01.png','cloak_flutter_02.png','cloak_flutter_03.png','cloak_flutter_04.png'], fps: 5 },
    run:       { frames: ['run_01.png','run_02.png','run_03.png'], fps: 6 },
    sit:       { frames: ['sit_01.png','sit_02.png','sit_03.png','sit_04.png','sit_05.png'], fps: 3 },
    happy:     { frames: ['happy_01.png','happy_02.png'], fps: 3 },
    look_up:   { frames: ['look_up_01.png','look_up_02.png','look_up_03.png'], fps: 4 },
    sleep:     { frames: ['sleep_01.png','sleep_02.png','sleep_03.png'], fps: 2 },
    tail_wag:  { frames: ['tail_wag_01.png','tail_wag_02.png','tail_wag_03.png'], fps: 4 }
  };

  function pageId() {
    var p = window.location.pathname.replace(/\/+$/, '/') || '/';
    if (p === '/' || p === '/index.html') return 'home';
    if (p === '/public/tracks/' || p === '/public/tracks/index.html') return 'tracks';
    if (p === '/blog/' || p === '/blog/index.html') return 'blog';
    if (p === '/about.html') return 'about';
    if (p === '/contact.html') return 'contact';
    return null;
  }

  function defaultState() {
    return { found: {}, unlocked: false, rated: false };
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var st = raw ? JSON.parse(raw) : defaultState();
      st.found = st.found || {};
      return st;
    } catch (e) {
      return defaultState();
    }
  }

  function saveState(st) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(st)); } catch (e) { }
  }

  function nextNeeded(st) {
    for (var i = 0; i < ORDER.length; i++) {
      if (!st.found[ORDER[i]]) return ORDER[i];
    }
    return st.unlocked ? null : 'contact';
  }

  var preloadedSets = {};
  function preloadAnim(name) {
    if (preloadedSets[name]) return;
    preloadedSets[name] = true;
    var anim = ANIMS[name];
    if (!anim) return;
    anim.frames.forEach(function (f) {
      var img = new Image();
      img.src = SPRITE_BASE + f;
    });
  }

  function SpriteAnimator(imgElement) {
    this.el = imgElement;
    this.timer = null;
  }

  SpriteAnimator.prototype.play = function (name, loop, onComplete) {
    this.stop();
    var anim = ANIMS[name];
    if (!anim) return;
    preloadAnim(name);
    var frames = anim.frames;
    var fps = anim.fps;
    var idx = 0;
    var self = this;
    function tick() {
      self.el.src = SPRITE_BASE + frames[idx];
      idx++;
      if (idx >= frames.length) {
        if (loop) idx = 0;
        else { self.timer = null; if (onComplete) onComplete(); return; }
      }
      self.timer = setTimeout(tick, 1000 / fps);
    }
    tick();
  };

  SpriteAnimator.prototype.stop = function () {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  };

  function fmt(sec) {
    if (!sec || !isFinite(sec)) return '0:00';
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function ensureHls(callback) {
    if (typeof Hls !== 'undefined') { callback(); return; }
    var existing = document.querySelector('script[data-secret-hls]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      existing.addEventListener('error', callback, { once: true });
      return;
    }
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
    s.async = true;
    s.setAttribute('data-secret-hls', '1');
    s.onload = callback;
    s.onerror = callback;
    document.head.appendChild(s);
  }

  function FuuraQuest() {
    this.state = loadState();
    this.current = pageId();
    this.required = nextNeeded(this.state);
    this.container = null;
    this.sprite = null;
    this.animator = null;
    this.bubble = null;
    this.overlay = null;
    this.particles = null;

    if (!this.current) return;

    if (this.state.unlocked) {
      if (this.current === 'contact') this.initUnlockedState();
      return;
    }

    if (this.current !== this.required) return;
    if (this.current === 'contact' && !this.hasFoundBeforeContact()) return;

    this.init();
  }

  FuuraQuest.prototype.hasFoundBeforeContact = function () {
    return this.state.found.home && this.state.found.tracks && this.state.found.blog && this.state.found.about;
  };

  FuuraQuest.prototype.init = function () {
    preloadAnim('idle');
    preloadAnim('surprised');
    preloadAnim('run');
    preloadAnim('sit');
    preloadAnim('sleep');
    preloadAnim('look_up');
    preloadAnim('cloak');
    preloadAnim('walk');

    this.createOverlay();
    this.createCat();
    this.animator = new SpriteAnimator(this.sprite);

    var cfg = ROUND[this.current];
    this.animator.play(cfg.anim, cfg.loop);

    var self = this;
    this.container.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      self.onTap();
    });
  };

  FuuraQuest.prototype.createOverlay = function () {
    this.overlay = document.createElement('div');
    this.overlay.className = 'oumagadoki-overlay';
    document.body.appendChild(this.overlay);

    this.particles = document.createElement('div');
    this.particles.className = 'oumagadoki-particles';
    for (var i = 0; i < 5; i++) {
      var p = document.createElement('div');
      p.className = 'oumagadoki-particle';
      p.style.left = (15 + Math.random() * 70) + '%';
      p.style.bottom = '-10px';
      this.particles.appendChild(p);
    }
    document.body.appendChild(this.particles);
  };

  FuuraQuest.prototype.createCat = function () {
    this.container = document.createElement('div');
    this.container.className = 'fuura-container fuura-round-' + this.current;

    this.sprite = document.createElement('img');
    this.sprite.className = 'fuura-sprite';
    this.sprite.src = SPRITE_BASE + (this.current === 'contact' ? 'sleep_01.png' : 'idle_01.png');
    this.sprite.alt = '';
    this.sprite.draggable = false;

    this.bubble = document.createElement('div');
    this.bubble.className = 'fuura-bubble';
    this.bubble.setAttribute('aria-hidden', 'true');

    this.container.appendChild(this.sprite);
    this.container.appendChild(this.bubble);
    document.body.appendChild(this.container);
  };

  FuuraQuest.prototype.showBubble = function (text, dur) {
    dur = dur || 2000;
    this.bubble.textContent = text;
    this.bubble.classList.add('visible');
    var self = this;
    setTimeout(function () { self.bubble.classList.remove('visible'); }, dur);
  };

  FuuraQuest.prototype.showNextToast = function (cfg) {
    if (!cfg || !cfg.nextUrl) return;
    var toast = document.createElement('div');
    toast.className = 'fuura-next-toast';
    toast.innerHTML = '<a href="' + cfg.nextUrl + '">' + cfg.nextText + '</a>';
    document.body.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add('visible'); });
    setTimeout(function () {
      toast.classList.remove('visible');
      setTimeout(function () { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 350);
    }, 6500);
  };

  FuuraQuest.prototype.onTap = function () {
    if (this.current === 'contact') {
      this.onComplete();
      return;
    }

    var cfg = ROUND[this.current];
    var self = this;
    this.state.found[this.current] = true;
    saveState(this.state);

    this.showBubble(cfg.message, 1800);
    this.animator.play('surprised', false, function () {
      self.animator.play(cfg.leave === 'left' ? 'run' : 'walk', true);
      self.container.classList.add('fuura-leaving', cfg.leave === 'left' ? 'fuura-leaving-left' : 'fuura-leaving-right');
      self.showNextToast(cfg);
    });
  };

  FuuraQuest.prototype.onComplete = function () {
    var self = this;
    this.state.found.contact = true;
    saveState(this.state);

    this.showBubble(ROUND.contact.message, 3600);
    document.body.classList.add('oumagadoki-mode');
    this.overlay.style.opacity = '0.75';

    this.container.classList.add('fuura-final');
    this.animator.play('look_up', false, function () {
      self.animator.play('sit', true);
    });

    setTimeout(function () {
      self.state.unlocked = true;
      saveState(self.state);
      self.showPlayer();
    }, 3200);
  };

  FuuraQuest.prototype.initUnlockedState = function () {
    this.createOverlay();
    document.body.classList.add('oumagadoki-mode');

    this.container = document.createElement('div');
    this.container.className = 'fuura-container fuura-final';

    this.sprite = document.createElement('img');
    this.sprite.className = 'fuura-sprite';
    this.sprite.src = SPRITE_BASE + 'sit_01.png';
    this.sprite.alt = '';
    this.sprite.draggable = false;
    this.container.appendChild(this.sprite);
    document.body.appendChild(this.container);

    preloadAnim('sit');
    this.animator = new SpriteAnimator(this.sprite);
    this.animator.play('sit', true);
    this.showPlayer();
  };

  FuuraQuest.prototype.showPlayer = function () {
    if (document.querySelector('.secret-player-wrap')) return;

    var wrap = document.createElement('div');
    wrap.className = 'secret-player-wrap';

    var player = document.createElement('div');
    player.className = 'secret-player';
    player.innerHTML =
      '<div class="secret-player-title">逢魔時の寄り道</div>' +
      '<div class="secret-player-track">逢魔時 (piano-B)</div>' +
      '<div class="secret-progress-row">' +
        '<span class="secret-time" id="secretTimeCurrent">0:00</span>' +
        '<div class="secret-progress-bar" id="secretProgressBar">' +
          '<div class="secret-progress-fill" id="secretProgressFill"></div>' +
        '</div>' +
        '<span class="secret-time" id="secretTimeTotal">0:00</span>' +
      '</div>' +
      '<div class="secret-controls">' +
        '<button class="secret-play-btn" id="secretPlayBtn" title="再生">' +
          '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="secret-rating" id="secretRating">' +
        '<div class="secret-rating-label">この曲はどうでしたか？</div>' +
        '<div class="secret-rating-btns">' +
          '<button class="secret-rating-btn" data-rating="love">すき</button>' +
          '<button class="secret-rating-btn" data-rating="ok">ふつう</button>' +
          '<button class="secret-rating-btn" data-rating="hmm">ちょっと…</button>' +
        '</div>' +
        '<div class="secret-rating-thanks" id="secretRatingThanks">ありがとうございます。</div>' +
        '<div class="secret-links">' +
          '<a href="/contact.html" class="secret-link">感想をもっと伝える →</a>' +
          '<a href="/?track=' + NEXT_TRACK_ID + '" class="secret-link" id="secretContinueLink">逢魔時 (piano) を聴く →</a>' +
        '</div>' +
      '</div>';

    wrap.appendChild(player);
    document.body.appendChild(wrap);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { wrap.classList.add('visible'); });
    });

    this.setupAudio();
    this.setupRating();
  };

  FuuraQuest.prototype.setupAudio = function () {
    var audio = document.createElement('audio');
    audio.preload = 'metadata';
    var isPlaying = false;
    var hls = null;

    var playBtn = document.getElementById('secretPlayBtn');
    var progressBar = document.getElementById('secretProgressBar');
    var progressFill = document.getElementById('secretProgressFill');
    var timeCurrent = document.getElementById('secretTimeCurrent');
    var timeTotal = document.getElementById('secretTimeTotal');
    var ratingSection = document.getElementById('secretRating');

    var playIcon = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    var pauseIcon = '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';

    function loadSource() {
      if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        hls = new Hls({ maxBufferLength: 30 });
        hls.loadSource(REWARD_SRC);
        hls.attachMedia(audio);
        hls.on(Hls.Events.ERROR, function (_, data) {
          if (data.fatal) console.log('Secret HLS error:', data.type);
        });
      } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
        audio.src = REWARD_SRC;
      }
    }

    ensureHls(loadSource);

    function togglePlay() {
      if (isPlaying) {
        audio.pause();
        isPlaying = false;
        playBtn.innerHTML = playIcon;
      } else {
        audio.play().then(function () {
          isPlaying = true;
          playBtn.innerHTML = pauseIcon;
          if (typeof window.firebasePlayCount === 'function') {
            window.firebasePlayCount('oumagadoki-piano-b');
          }
        }).catch(function () { });
      }
    }

    playBtn.addEventListener('click', togglePlay);

    audio.addEventListener('timeupdate', function () {
      if (!audio.duration) return;
      var pct = (audio.currentTime / audio.duration) * 100;
      progressFill.style.width = pct + '%';
      timeCurrent.textContent = fmt(audio.currentTime);
      if (audio.currentTime > audio.duration * 0.6) ratingSection.classList.add('visible');
    });

    audio.addEventListener('loadedmetadata', function () {
      timeTotal.textContent = fmt(audio.duration);
    });

    progressBar.addEventListener('click', function (e) {
      if (!audio.duration) return;
      var rect = progressBar.getBoundingClientRect();
      var pct = (e.clientX - rect.left) / rect.width;
      audio.currentTime = pct * audio.duration;
    });

    audio.addEventListener('ended', function () {
      isPlaying = false;
      playBtn.innerHTML = playIcon;
      ratingSection.classList.add('visible');
      if (hls) { hls.destroy(); hls = null; }
    });
  };

  FuuraQuest.prototype.setupRating = function () {
    var btns = document.querySelectorAll('.secret-rating-btn');
    var thanks = document.getElementById('secretRatingThanks');
    var self = this;
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var rating = btn.getAttribute('data-rating');
        btns.forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        thanks.classList.add('visible');
        self.state.rated = true;
        self.state.ratingValue = rating;
        saveState(self.state);
        if (typeof window.firebaseSecretRating === 'function') {
          window.firebaseSecretRating('oumagadoki-piano-b', rating);
        }
      });
    });
  };

  function startQuest() {
    // Old same-page tap quest can conflict with the page-based version.
    try { localStorage.removeItem(OLD_STORAGE_KEY); } catch (e) { }
    new FuuraQuest();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startQuest);
  } else {
    startQuest();
  }
})();
