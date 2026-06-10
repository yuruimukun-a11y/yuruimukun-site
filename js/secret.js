/**
 * 逢魔時の寄り道 - Secret Feature
 * フウラ（紫マントマヌルネコ）がサイト内を逃げ、追いかけると曲が解禁される
 */
(function () {
  'use strict';

  /* ============================================================
     Configuration
     ============================================================ */
  var SPRITE_BASE = '/images/secret/';
  var TAP_THRESHOLD = 5;
  var STORAGE_KEY = 'fuura_quest';
  var REWARD_SRC = 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/oumagadoki-piano-b/playlist.m3u8';
  var NEXT_TRACK_ID = 'oumagadoki-piano';

  /* ============================================================
     Animation Definitions
     ============================================================ */
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
    tail_wag:  { frames: ['tail_wag_01.png','tail_wag_02.png','tail_wag_03.png'], fps: 4 },
  };

  /* ============================================================
     State Persistence
     ============================================================ */
  function loadState() {
    try {
      var s = localStorage.getItem(STORAGE_KEY);
      return s ? JSON.parse(s) : { tapCount: 0, unlocked: false, rated: false };
    } catch (e) { return { tapCount: 0, unlocked: false, rated: false }; }
  }

  function saveState(st) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(st)); } catch (e) { /* silent */ }
  }

  /* ============================================================
     Image Preloader
     ============================================================ */
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

  /* ============================================================
     Sprite Animator
     ============================================================ */
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
        if (loop) { idx = 0; }
        else { self.timer = null; if (onComplete) onComplete(); return; }
      }
      self.timer = setTimeout(tick, 1000 / fps);
    }
    tick();
  };

  SpriteAnimator.prototype.stop = function () {
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
  };

  /* ============================================================
     Helper: Format Time
     ============================================================ */
  function fmt(sec) {
    if (!sec || !isFinite(sec)) return '0:00';
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  /* ============================================================
     FuuraQuest - Main Controller
     ============================================================ */
  function FuuraQuest() {
    this.state = loadState();
    this.container = null;
    this.sprite = null;
    this.animator = null;
    this.bubble = null;
    this.blinkInterval = null;
    this.overlay = null;
    this.particles = null;

    // If already unlocked, show just the player (cat sits)
    if (this.state.unlocked) {
      this.initUnlockedState();
      return;
    }

    this.init();
  }

  FuuraQuest.prototype.init = function () {
    // Preload essentials
    preloadAnim('idle');
    preloadAnim('blink');
    preloadAnim('cloak');

    this.createElements();
    this.animator = new SpriteAnimator(this.sprite);

    // Start idle with periodic blink
    this.startIdleBlink();

    // Hint animation after 4s
    var self = this;
    setTimeout(function () { self.playHint(); }, 4000);

    // Click/tap handler
    this.container.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      self.onTap();
    });
  };

  FuuraQuest.prototype.createElements = function () {
    // Twilight overlay (hidden initially)
    this.overlay = document.createElement('div');
    this.overlay.className = 'oumagadoki-overlay';
    document.body.appendChild(this.overlay);

    // Particles
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

    // Cat container
    this.container = document.createElement('div');
    this.container.className = 'fuura-container';

    this.sprite = document.createElement('img');
    this.sprite.className = 'fuura-sprite';
    this.sprite.src = SPRITE_BASE + 'idle_01.png';
    this.sprite.alt = '';
    this.sprite.draggable = false;

    this.bubble = document.createElement('div');
    this.bubble.className = 'fuura-bubble';
    this.bubble.setAttribute('aria-hidden', 'true');

    this.container.appendChild(this.sprite);
    this.container.appendChild(this.bubble);
    document.body.appendChild(this.container);
  };

  FuuraQuest.prototype.startIdleBlink = function () {
    var self = this;
    this.animator.play('idle', true);
    if (this.blinkInterval) clearInterval(this.blinkInterval);
    this.blinkInterval = setInterval(function () {
      self.animator.play('blink', false, function () {
        self.animator.play('idle', true);
      });
    }, 3000 + Math.random() * 3000);
  };

  FuuraQuest.prototype.playHint = function () {
    if (this.state.tapCount > 0) return;
    var self = this;
    preloadAnim('cloak');
    this.animator.play('cloak', false, function () {
      self.animator.play('idle', true);
    });
    this.container.classList.add('fuura-hint');
    setTimeout(function () {
      self.container.classList.remove('fuura-hint');
    }, 1500);
  };

  FuuraQuest.prototype.showBubble = function (text, dur) {
    dur = dur || 2000;
    this.bubble.textContent = text;
    this.bubble.classList.add('visible');
    var self = this;
    setTimeout(function () { self.bubble.classList.remove('visible'); }, dur);
  };

  FuuraQuest.prototype.onTap = function () {
    this.state.tapCount++;
    saveState(this.state);

    // Preload next-needed anims
    preloadAnim('surprised');
    preloadAnim('run');
    preloadAnim('walk');

    if (this.state.tapCount >= TAP_THRESHOLD) {
      preloadAnim('look_up');
      preloadAnim('sit');
      this.onComplete();
      return;
    }

    // Bounce feedback
    this.container.classList.remove('fuura-tapped');
    void this.container.offsetWidth; // force reflow
    this.container.classList.add('fuura-tapped');

    // Surprised → move
    var self = this;
    this.animator.play('surprised', false, function () {
      self.moveToNewPosition();
    });

    // Speech
    var msgs = ['……にゃ', '…にゃっ', 'にゃ……？', '…にゃん'];
    this.showBubble(msgs[Math.min(this.state.tapCount - 1, msgs.length - 1)]);

    // Background transition ramp up at tap 3+
    if (this.state.tapCount >= 3) {
      var progress = (this.state.tapCount - 2) / (TAP_THRESHOLD - 2);
      document.body.style.transition = 'background-color 1.5s ease';
      // Interpolate bg color
      var r = Math.round(255 - progress * (255 - 26));
      var g = Math.round(245 - progress * (245 - 14));
      var b = Math.round(247 - progress * (247 - 46));
      document.body.style.backgroundColor = 'rgb(' + r + ',' + g + ',' + b + ')';
      // Overlay partial
      this.overlay.style.opacity = String(progress * 0.6);
    }
  };

  FuuraQuest.prototype.moveToNewPosition = function () {
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var positions = [
      { right: vw - 100, bottom: 20 },
      { right: 20, bottom: 20 },
      { right: vw - 100, bottom: Math.floor(vh * 0.25) },
      { right: 20, bottom: Math.floor(vh * 0.25) },
      { right: Math.floor(vw / 2 - 40), bottom: 20 },
      { right: Math.floor(vw / 2 - 40), bottom: Math.floor(vh * 0.4) },
    ];

    // Pick a position different from current
    var curR = parseInt(this.container.style.right) || 20;
    var curB = parseInt(this.container.style.bottom) || 20;
    var chosen;
    for (var attempt = 0; attempt < 10; attempt++) {
      chosen = positions[Math.floor(Math.random() * positions.length)];
      if (Math.abs(chosen.right - curR) > 60 || Math.abs(chosen.bottom - curB) > 60) break;
    }

    // Flip sprite based on direction
    var goingLeft = chosen.right > curR;
    this.sprite.style.transform = goingLeft ? 'scaleX(-1)' : 'scaleX(1)';

    // Run animation while moving
    var useRun = this.state.tapCount >= 3;
    this.animator.play(useRun ? 'run' : 'walk', true);

    // Apply position
    this.container.style.right = chosen.right + 'px';
    this.container.style.bottom = chosen.bottom + 'px';

    // Return to idle after move
    var self = this;
    setTimeout(function () {
      self.sprite.style.transform = '';
      self.startIdleBlink();
    }, 800);
  };

  FuuraQuest.prototype.onComplete = function () {
    if (this.blinkInterval) clearInterval(this.blinkInterval);

    // Final bubble
    this.showBubble('ついてきたのかにゃ', 4000);

    // Full twilight mode
    document.body.classList.add('oumagadoki-mode');

    // Cat looks up then sits
    var self = this;
    this.animator.play('look_up', false, function () {
      self.animator.play('sit', true);
    });

    // Move to center
    this.container.classList.add('fuura-final');

    // Save & show player
    setTimeout(function () {
      self.state.unlocked = true;
      saveState(self.state);
      self.showPlayer();
    }, 3500);
  };

  /* Already-unlocked page load */
  FuuraQuest.prototype.initUnlockedState = function () {
    // Create overlay & particles
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

    // Twilight mode
    document.body.classList.add('oumagadoki-mode');

    // Cat sitting at center
    this.container = document.createElement('div');
    this.container.className = 'fuura-container fuura-final';
    this.sprite = document.createElement('img');
    this.sprite.className = 'fuura-sprite';
    this.sprite.src = SPRITE_BASE + 'sit_01.png';
    this.sprite.alt = '';
    this.sprite.draggable = false;
    this.container.appendChild(this.sprite);
    document.body.appendChild(this.container);

    // Animate sit
    preloadAnim('sit');
    this.animator = new SpriteAnimator(this.sprite);
    this.animator.play('sit', true);

    // Show player right away
    this.showPlayer();
  };

  /* ============================================================
     Secret Player
     ============================================================ */
  FuuraQuest.prototype.showPlayer = function () {
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

    // Show with animation
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        wrap.classList.add('visible');
      });
    });

    this.setupAudio(wrap);
    this.setupRating();
  };

  FuuraQuest.prototype.setupAudio = function (wrap) {
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

    // HLS setup
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
    loadSource();

    // Play/Pause
    function togglePlay() {
      if (isPlaying) {
        audio.pause();
        isPlaying = false;
        playBtn.innerHTML = playIcon;
      } else {
        audio.play().then(function () {
          isPlaying = true;
          playBtn.innerHTML = pauseIcon;
          // Firebase play count
          if (typeof window.firebasePlayCount === 'function') {
            window.firebasePlayCount('oumagadoki-piano-b');
          }
        }).catch(function () { /* autoplay blocked */ });
      }
    }

    playBtn.addEventListener('click', togglePlay);

    // Progress update
    audio.addEventListener('timeupdate', function () {
      if (!audio.duration) return;
      var pct = (audio.currentTime / audio.duration) * 100;
      progressFill.style.width = pct + '%';
      timeCurrent.textContent = fmt(audio.currentTime);
    });

    audio.addEventListener('loadedmetadata', function () {
      timeTotal.textContent = fmt(audio.duration);
    });

    // Seek
    progressBar.addEventListener('click', function (e) {
      if (!audio.duration) return;
      var rect = progressBar.getBoundingClientRect();
      var pct = (e.clientX - rect.left) / rect.width;
      audio.currentTime = pct * audio.duration;
    });

    // Song ended → show rating
    audio.addEventListener('ended', function () {
      isPlaying = false;
      playBtn.innerHTML = playIcon;
      ratingSection.classList.add('visible');
    });

    // Also show rating after 60% of song played
    audio.addEventListener('timeupdate', function () {
      if (audio.duration && audio.currentTime > audio.duration * 0.6) {
        ratingSection.classList.add('visible');
      }
    });
  };

  FuuraQuest.prototype.setupRating = function () {
    var btns = document.querySelectorAll('.secret-rating-btn');
    var thanks = document.getElementById('secretRatingThanks');
    var self = this;

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var rating = btn.getAttribute('data-rating');

        // Visual feedback
        btns.forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        thanks.classList.add('visible');

        // Save to state
        self.state.rated = true;
        self.state.ratingValue = rating;
        saveState(self.state);

        // Firebase: save rating
        if (typeof window.firebaseSecretRating === 'function') {
          window.firebaseSecretRating('oumagadoki-piano-b', rating);
        }
      });
    });
  };

  /* ============================================================
     Init
     ============================================================ */
  function startQuest() {
    new FuuraQuest();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startQuest);
  } else {
    startQuest();
  }

})();
