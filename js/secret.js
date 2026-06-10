/**
 * 逢魔時の寄り道 v3 — Static sprites + CSS motion
 * 9 clean sprites, no frame animation, CSS handles motion
 */
(function () {
  'use strict';

  var S = '/images/secret/';
  var KEY = 'fuura_quest_v2';
  var REWARD = 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/oumagadoki-piano-b/playlist.m3u8';
  var NEXT = 'oumagadoki-piano';

  // Sprite files (9 static images)
  var IMG = {
    idle:      S + 'idle.png',
    sit:       S + 'sit.png',
    walk:      S + 'walk.png',
    run:       S + 'run.png',
    run2:      S + 'run2.png',
    surprised: S + 'surprised.png',
    cloak:     S + 'cloak.png',
    sleep:     S + 'sleep.png',
    back:      S + 'back.png',
  };

  function load() {
    try { var s = localStorage.getItem(KEY); return s ? JSON.parse(s) : { round:1, unlocked:false }; }
    catch(e) { return { round:1, unlocked:false }; }
  }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch(e){} }

  function fmt(s){if(!s||!isFinite(s))return'0:00';var m=Math.floor(s/60),ss=Math.floor(s%60);return m+':'+(ss<10?'0':'')+ss;}
  function qs(sel){return document.querySelector(sel);}
  function ce(tag,cls){var e=document.createElement(tag);if(cls)e.className=cls;return e;}

  function makeImg(src) {
    var img = ce('img');
    img.src = src; img.alt = ''; img.draggable = false;
    img.style.cssText = 'display:block;width:100px;height:auto;image-rendering:pixelated;image-rendering:crisp-edges;pointer-events:none;';
    return img;
  }
  function makeBubble(dark) {
    var b = ce('div','fuura-bubble'+(dark?' fuura-bubble--dark':''));
    b.setAttribute('aria-hidden','true'); return b;
  }
  function showBubble(b,text,dur) {
    b.textContent=text;b.classList.add('visible');
    setTimeout(function(){b.classList.remove('visible');},dur||2200);
  }
  function showHint(text) {
    var t=ce('div','fuura-hint-toast');t.textContent=text;
    document.body.appendChild(t);
    setTimeout(function(){t.classList.add('visible');},50);
    setTimeout(function(){t.classList.remove('visible');},5000);
    setTimeout(function(){if(t.parentNode)t.parentNode.removeChild(t);},6000);
  }
  function curPage() {
    var p=location.pathname.replace(/index\.html$/,'');
    if(!p.endsWith('/')&&p.lastIndexOf('.')<0)p+='/';
    if(p==='/')return'/';
    if(p.indexOf('/public/tracks')===0)return'/public/tracks/';
    if(p==='/blog/'||p==='/blog')return'/blog/';
    if(p==='/about.html')return'/about.html';
    if(p==='/contact.html')return'/contact.html';
    return null;
  }

  /* ==== CSS Motion Helpers ==== */
  function addBreathing(el) {
    el.style.animation = 'fuura-breathe 3s ease-in-out infinite';
  }
  function addSway(el) {
    el.style.animation = 'fuura-sway 2.5s ease-in-out infinite';
  }
  function addSleepBob(el) {
    el.style.animation = 'fuura-sleep-bob 4s ease-in-out infinite';
  }

  // Inject keyframes once
  var styleEl = document.createElement('style');
  styleEl.textContent =
    '@keyframes fuura-breathe{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}' +
    '@keyframes fuura-sway{0%,100%{transform:rotate(0deg)}25%{transform:rotate(2deg)}75%{transform:rotate(-2deg)}}' +
    '@keyframes fuura-sleep-bob{0%,100%{transform:scaleY(1)}50%{transform:scaleY(0.97) translateY(1px)}}' +
    '@keyframes fuura-peek{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}';
  document.head.appendChild(styleEl);

  /* ==========================================================
     ROUND 1 — 出会い (index.html)
     ========================================================== */
  function round1() {
    var anchor = qs('.hero-section');
    if (!anchor) return;
    anchor.style.position = 'relative';

    var cat = ce('div','fuura-cat');
    cat.style.cssText = 'position:absolute;right:12px;bottom:-8px;z-index:900;cursor:pointer;';
    var img = makeImg(IMG.idle);
    addBreathing(img);
    var bub = makeBubble();
    cat.appendChild(img); cat.appendChild(bub);
    anchor.appendChild(cat);

    cat.addEventListener('click', function handler(e) {
      e.preventDefault(); e.stopPropagation();
      cat.removeEventListener('click', handler);
      img.style.animation = 'none';

      img.src = IMG.surprised;
      showBubble(bub, '……にゃ', 2000);
      setTimeout(function () {
        img.src = IMG.walk;
        cat.style.transition = 'transform 1.2s ease-in, opacity 1s ease';
        cat.style.transform = 'translateX(250px)';
        cat.style.opacity = '0';
      }, 900);
      setTimeout(function () {
        var st = load(); st.round = 2; save(st);
        showHint('next : 楽曲一覧へ...');
      }, 1400);
    });
  }

  /* ==========================================================
     ROUND 2 — 気配 (/public/tracks/)
     ========================================================== */
  function round2() {
    var cards = document.querySelectorAll('.track-card');
    var target = cards.length > 4 ? cards[4] : cards[cards.length - 1];
    if (!target) return;
    target.style.position = 'relative'; target.style.overflow = 'visible';

    var cat = ce('div','fuura-cat');
    cat.style.cssText = 'position:absolute;right:-48px;top:50%;transform:translateY(-50%);z-index:900;cursor:pointer;';
    var img = makeImg(IMG.cloak);
    img.style.clipPath = 'inset(0 0 0 70%)';
    addSway(img);
    var bub = makeBubble(true);
    cat.appendChild(img); cat.appendChild(bub);
    target.appendChild(cat);

    cat.addEventListener('click', function handler(e) {
      e.preventDefault(); e.stopPropagation();
      cat.removeEventListener('click', handler);
      img.style.animation = 'none';
      img.style.clipPath = 'none';
      img.style.transition = 'clip-path 0.3s ease';

      img.src = IMG.surprised;
      showBubble(bub, '…にゃっ', 1800);
      setTimeout(function () {
        img.src = IMG.run;
        img.style.transform = 'scaleX(-1)';
        cat.style.transition = 'transform 0.8s ease-in, opacity 0.8s ease';
        cat.style.transform = 'translateX(-300px) translateY(-50%)';
        cat.style.opacity = '0';
      }, 700);
      setTimeout(function () {
        var st = load(); st.round = 3; save(st);
        showHint('next : ブログへ...');
      }, 1200);
    });
  }

  /* ==========================================================
     ROUND 3 — かくれんぼ (/blog/)
     ========================================================== */
  function round3() {
    var footer = qs('footer');
    if (!footer) return;
    footer.style.position = 'relative'; footer.style.overflow = 'visible';

    var wrap = ce('div','');
    wrap.style.cssText = 'position:absolute;top:-20px;right:24px;width:100px;height:30px;overflow:hidden;z-index:900;transition:height 0.5s ease;';

    var cat = ce('div','fuura-cat');
    cat.style.cssText = 'position:relative;transform:translateY(55px);transition:transform 0.6s ease;cursor:pointer;';
    var img = makeImg(IMG.surprised);
    img.style.animation = 'fuura-peek 2s ease-in-out infinite';
    var bub = makeBubble();
    cat.appendChild(img); cat.appendChild(bub);
    wrap.appendChild(cat);
    footer.appendChild(wrap);

    var showing = false, clicked = false;
    function peek() {
      if (showing || clicked) return;
      showing = true;
      wrap.style.height = '50px';
      cat.style.transform = 'translateY(30px)';
      setTimeout(function () { if (!clicked) { showing=false; cat.style.transform='translateY(55px)'; wrap.style.height='30px'; } }, 3000);
    }
    var timer = setInterval(peek, 9000);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function(e){ if(e[0].isIntersecting&&!showing&&!clicked)peek(); },{threshold:0.2}).observe(footer);
    }
    setTimeout(peek, 1200);

    cat.addEventListener('click', function handler(e) {
      e.preventDefault(); e.stopPropagation();
      cat.removeEventListener('click', handler);
      clicked = true; clearInterval(timer);

      wrap.style.height = '110px';
      cat.style.transform = 'translateY(-5px)';
      img.style.animation = 'none';
      img.src = IMG.sit;
      showBubble(bub, 'にゃ……？', 2200);
      setTimeout(function () {
        cat.style.transform = 'translateY(80px)';
        cat.style.opacity = '0';
      }, 1800);
      setTimeout(function () {
        var st = load(); st.round = 4; save(st);
        showHint('next : サイトについてへ...');
      }, 2200);
    });
  }

  /* ==========================================================
     ROUND 4 — 幻 (/about.html)
     ========================================================== */
  function round4() {
    var headings = document.querySelectorAll('h2');
    var target = null;
    for (var i=0;i<headings.length;i++) {
      if (headings[i].textContent.indexOf('制作')>=0){target=headings[i];break;}
    }
    if (!target && headings.length>2) target=headings[headings.length-3];
    if (!target) return;
    target.style.position = 'relative'; target.style.overflow = 'visible';

    var cat = ce('div','fuura-cat');
    cat.style.cssText = 'position:absolute;left:16px;top:-24px;z-index:900;cursor:pointer;';
    var img = makeImg(IMG.back);
    img.style.clipPath = 'inset(0 20% 72% 20%)';
    addBreathing(img);
    var bub = makeBubble();
    cat.appendChild(img); cat.appendChild(bub);
    target.appendChild(cat);

    function handler(e) {
      e.preventDefault(); e.stopPropagation();
      target.removeEventListener('click', handler);
      cat.removeEventListener('click', handler);
      img.style.animation = 'none';
      img.style.clipPath = 'none';
      img.style.transition = 'clip-path 0.3s ease';

      img.src = IMG.idle;
      showBubble(bub, '…にゃん', 2500);
      setTimeout(function () {
        img.src = IMG.walk;
        cat.style.transition = 'transform 1s ease-in, opacity 1s ease';
        cat.style.transform = 'translateX(200px)';
        cat.style.opacity = '0';
      }, 2000);
      setTimeout(function () {
        var st = load(); st.round = 5; save(st);
        showHint('next : お問い合わせへ...');
      }, 2800);
    }
    target.style.cursor = 'pointer';
    target.addEventListener('click', handler);
    cat.addEventListener('click', handler);
  }

  /* ==========================================================
     ROUND 5 — 再会 (/contact.html)
     ========================================================== */
  function round5() {
    var main = qs('.contact-page') || qs('main');
    if (!main) return;
    var backLink = main.querySelector('.back-link');

    var wrap = ce('div','');
    wrap.style.cssText = 'text-align:center;margin:2.5rem 0 1rem;';
    var cat = ce('div','fuura-cat');
    cat.style.cssText = 'display:inline-block;cursor:pointer;z-index:900;';
    var img = makeImg(IMG.sleep);
    addSleepBob(img);
    var bub = makeBubble();
    bub.style.cssText += ';position:relative;bottom:auto;left:auto;transform:scale(0.7);display:inline-block;margin-bottom:8px;';
    cat.appendChild(bub); cat.appendChild(img);
    wrap.appendChild(cat);
    if (backLink) main.insertBefore(wrap, backLink); else main.appendChild(wrap);

    cat.addEventListener('click', function handler(e) {
      e.preventDefault(); e.stopPropagation();
      cat.removeEventListener('click', handler);
      img.style.animation = 'none';

      img.src = IMG.idle;
      showBubble(bub, 'ついてきたのかにゃ', 4000);
      setTimeout(function () {
        var st = load(); st.round = 6; st.unlocked = true; save(st);

        var ov = ce('div','oumagadoki-overlay');
        document.body.appendChild(ov);
        document.body.classList.add('oumagadoki-mode');

        setTimeout(function () {
          var msg = ce('div','');
          msg.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#e8dcc8;font-family:Zen Maru Gothic,Noto Sans JP,sans-serif;text-align:center;pointer-events:none;opacity:0;transition:opacity 1.5s ease;';
          msg.innerHTML = '<div style="font-size:0.8rem;letter-spacing:0.15em;opacity:0.5;margin-bottom:16px">\u9022\u9b54\u6642\u306e\u5bc4\u308a\u9053</div><div style="font-size:1.1rem;line-height:2.2">\u3053\u3053\u307e\u3067\u898b\u3066\u304f\u308c\u3066\u3042\u308a\u304c\u3068\u3046\u3054\u3056\u3044\u307e\u3059<br>\u4eca\u5f8c\u3068\u3082\u3069\u3046\u305e\u3088\u308d\u3057\u304f\u304a\u9858\u3044\u3044\u305f\u3057\u307e\u3059</div>';
          document.body.appendChild(msg);
          requestAnimationFrame(function(){ msg.style.opacity='1'; });
        }, 1000);
        setTimeout(function () { location.href = '/?secret=1'; }, 6000);
      }, 2500);
    });
  }

  /* ==== Unlocked state — player on home ==== */
  function showUnlocked() {
    var ov=ce('div','oumagadoki-overlay');document.body.appendChild(ov);
    var parts=ce('div','oumagadoki-particles');
    for(var i=0;i<5;i++){var p=ce('div','oumagadoki-particle');p.style.left=(15+Math.random()*70)+'%';p.style.bottom='-10px';parts.appendChild(p);}
    document.body.appendChild(parts);
    document.body.classList.add('oumagadoki-mode');
    setTimeout(showPlayer,800);
  }

  function showPlayer() {
    var wrap=ce('div','secret-player-wrap');
    var player=ce('div','secret-player');
    player.innerHTML=
      '<div class="secret-player-label">\u9022\u9b54\u6642\u306e\u5bc4\u308a\u9053</div>'+
      '<div class="secret-player-track">\u9022\u9b54\u6642 (piano-B)</div>'+
      '<div class="secret-progress-row"><span class="secret-time" id="spCur">0:00</span><div class="secret-progress-bar" id="spBar"><div class="secret-progress-fill" id="spFill"></div></div><span class="secret-time" id="spTot">0:00</span></div>'+
      '<div class="secret-controls"><button class="secret-play-btn" id="spPlay" title="\u518d\u751f"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button></div>'+
      '<div class="secret-rating" id="spRating"><div class="secret-rating-label">\u3053\u306e\u66f2\u306f\u3069\u3046\u3067\u3057\u305f\u304b\uff1f</div><div class="secret-rating-btns"><button class="secret-rating-btn" data-r="love">\u3059\u304d</button><button class="secret-rating-btn" data-r="ok">\u3075\u3064\u3046</button><button class="secret-rating-btn" data-r="hmm">\u3061\u3087\u3063\u3068\u2026</button></div><div class="secret-rating-thanks" id="spThanks">\u3042\u308a\u304c\u3068\u3046\u3054\u3056\u3044\u307e\u3059\u3002</div><div class="secret-links"><a href="/contact.html" class="secret-link">\u611f\u60f3\u3092\u3082\u3063\u3068\u4f1d\u3048\u308b \u2192</a><a href="/?track='+NEXT+'" class="secret-link">\u9022\u9b54\u6642 (piano) \u3092\u8074\u304f \u2192</a></div></div>'+
      '<div class="secret-ending">\u3053\u3053\u307e\u3067\u898b\u3066\u304f\u308c\u3066\u3042\u308a\u304c\u3068\u3046\u3054\u3056\u3044\u307e\u3059<br>\u4eca\u5f8c\u3068\u3082\u3069\u3046\u305e\u3088\u308d\u3057\u304f\u304a\u9858\u3044\u3044\u305f\u3057\u307e\u3059</div>';
    wrap.appendChild(player);document.body.appendChild(wrap);
    requestAnimationFrame(function(){requestAnimationFrame(function(){wrap.classList.add('visible');});});
    setupAudio(); setupRating();
  }
  function setupAudio() {
    var audio=document.createElement('audio');audio.preload='metadata';
    var playing=false;
    var playBtn=qs('#spPlay'),bar=qs('#spBar'),fill=qs('#spFill'),cur=qs('#spCur'),tot=qs('#spTot'),rating=qs('#spRating');
    var playI='<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    var pauseI='<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
    if(typeof Hls!=='undefined'&&Hls.isSupported()){var h=new Hls({maxBufferLength:30});h.loadSource(REWARD);h.attachMedia(audio);}
    else if(audio.canPlayType('application/vnd.apple.mpegurl'))audio.src=REWARD;
    playBtn.addEventListener('click',function(){
      if(playing){audio.pause();playing=false;playBtn.innerHTML=playI;}
      else{audio.play().then(function(){playing=true;playBtn.innerHTML=pauseI;if(typeof window.firebasePlayCount==='function')window.firebasePlayCount('oumagadoki-piano-b');}).catch(function(){});}
    });
    audio.addEventListener('timeupdate',function(){if(!audio.duration)return;fill.style.width=(audio.currentTime/audio.duration*100)+'%';cur.textContent=fmt(audio.currentTime);if(audio.currentTime>audio.duration*0.6)rating.classList.add('visible');});
    audio.addEventListener('loadedmetadata',function(){tot.textContent=fmt(audio.duration);});
    bar.addEventListener('click',function(e){if(!audio.duration)return;var r=bar.getBoundingClientRect();audio.currentTime=((e.clientX-r.left)/r.width)*audio.duration;});
    audio.addEventListener('ended',function(){playing=false;playBtn.innerHTML=playI;rating.classList.add('visible');});
  }
  function setupRating() {
    var btns=document.querySelectorAll('.secret-rating-btn'),thanks=qs('#spThanks');
    btns.forEach(function(b){b.addEventListener('click',function(){
      btns.forEach(function(x){x.classList.remove('selected');});
      b.classList.add('selected');thanks.classList.add('visible');
      if(typeof window.firebaseSecretRating==='function')window.firebaseSecretRating('oumagadoki-piano-b',b.getAttribute('data-r'));
    });});
  }

  /* ==== Init ==== */
  function init() {
    var st=load(), page=curPage();
    if(!page)return;
    if(st.unlocked){if(page==='/')showUnlocked();return;}
    switch(st.round){
      case 1:if(page==='/')round1();break;
      case 2:if(page==='/public/tracks/')round2();break;
      case 3:if(page==='/blog/')round3();break;
      case 4:if(page==='/about.html')round4();break;
      case 5:if(page==='/contact.html')round5();break;
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
