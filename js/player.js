/**
 * yuruimukun Music Player
 * HLS.js based streaming player with genre filter
 */

(function() {
  'use strict';

  const PLAYLIST = [
  {
    id: 'Danmaku',
    title: 'Danmaku',
    artist: 'yuruimukun',
    genre: 'aki-music',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/Danmaku/playlist.m3u8',
  },
  {
    id: 'Marron battle',
    title: 'Marron battle',
    artist: 'yuruimukun',
    genre: 'aki-music',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/Marron battle/playlist.m3u8',
  },
  {
    id: 'ninja',
    title: 'ninja',
    artist: 'yuruimukun',
    genre: 'aki-music',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/ninja/playlist.m3u8',
  },
  {
    id: 'oyasumi',
    title: 'oyasumi',
    artist: 'yuruimukun',
    genre: 'aki-music',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/oyasumi/playlist.m3u8',
  },
  {
    id: 'tomoshibi',
    title: 'tomoshibi',
    artist: 'yuruimukun',
    genre: 'aki-music',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/tomoshibi/playlist.m3u8',
  },
  {
    id: 'meitantei',
    title: 'meitantei',
    artist: 'yuruimukun',
    genre: 'bgm',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/meitantei/playlist.m3u8',
  },
  {
    id: 'nekokan',
    title: 'nekokan',
    artist: 'yuruimukun',
    genre: 'bgm',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/nekokan/playlist.m3u8',
  },
  {
    id: 'battle',
    title: 'battle',
    artist: 'yuruimukun',
    genre: 'game-bgmfuu',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/battle/playlist.m3u8',
  },
  {
    id: 'chirizakura',
    title: 'chirizakura',
    artist: 'yuruimukun',
    genre: 'game-bgmfuu',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/chirizakura/playlist.m3u8',
  },
  {
    id: 'kokokokomebattle',
    title: 'kokokokomebattle',
    artist: 'yuruimukun',
    genre: 'game-bgmfuu',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/kokokokomebattle/playlist.m3u8',
  },
  {
    id: 'komebattle',
    title: 'komebattle',
    artist: 'yuruimukun',
    genre: 'game-bgmfuu',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/komebattle/playlist.m3u8',
  },
  {
    id: 'odoro-',
    title: 'odoro-',
    artist: 'yuruimukun',
    genre: 'game-bgmfuu',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/odoro-/playlist.m3u8',
  },
  {
    id: 'acid',
    title: 'acid',
    artist: 'yuruimukun',
    genre: 'guitar',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/acid/playlist.m3u8',
  },
  {
    id: 'atsu',
    title: 'atsu',
    artist: 'yuruimukun',
    genre: 'guitar',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/atsu/playlist.m3u8',
  },
  {
    id: 'BINGO',
    title: 'BINGO',
    artist: 'yuruimukun',
    genre: 'guitar',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/BINGO/playlist.m3u8',
  },
  {
    id: 'neko car',
    title: 'neko car',
    artist: 'yuruimukun',
    genre: 'guitar',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/neko car/playlist.m3u8',
  },
  {
    id: 'sekaizora',
    title: 'sekaizora',
    artist: 'yuruimukun',
    genre: 'guitar',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/sekaizora/playlist.m3u8',
  },
  {
    id: 'yuruimukun-beat1',
    title: 'yuruimukun-beat1',
    artist: 'yuruimukun',
    genre: 'guitar',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/yuruimukun-beat1/playlist.m3u8',
  },
  {
    id: 'yuruimukun-beat2',
    title: 'yuruimukun-beat2',
    artist: 'yuruimukun',
    genre: 'guitar',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/yuruimukun-beat2/playlist.m3u8',
  },
  {
    id: 'atawo',
    title: 'atawo',
    artist: 'yuruimukun',
    genre: 'guitar-aco or clean',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/atawo/playlist.m3u8',
  },
  {
    id: 'awafuki',
    title: 'awafuki',
    artist: 'yuruimukun',
    genre: 'guitar-aco or clean',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/awafuki/playlist.m3u8',
  },
  {
    id: 'band CatsF',
    title: 'band CatsF',
    artist: 'yuruimukun',
    genre: 'guitar-aco or clean',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/band CatsF/playlist.m3u8',
  },
  {
    id: 'forest session',
    title: 'forest session',
    artist: 'yuruimukun',
    genre: 'guitar-aco or clean',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/forest session/playlist.m3u8',
  },
  {
    id: 'sakana',
    title: 'sakana',
    artist: 'yuruimukun',
    genre: 'guitar-aco or clean',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/sakana/playlist.m3u8',
  },
  {
    id: 'SUNMA',
    title: 'SUNMA',
    artist: 'yuruimukun',
    genre: 'guitar-aco or clean',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/SUNMA/playlist.m3u8',
  },
  {
    id: 'yabimi',
    title: 'yabimi',
    artist: 'yuruimukun',
    genre: 'guitar-aco or clean',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/yabimi/playlist.m3u8',
  },
  {
    id: 'halloween-manul neko',
    title: 'halloween-manul neko',
    artist: 'yuruimukun',
    genre: 'halloween',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/halloween-manul neko/playlist.m3u8',
  },
  {
    id: 'halloween-okataduke',
    title: 'halloween-okataduke',
    artist: 'yuruimukun',
    genre: 'halloween',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/halloween-okataduke/playlist.m3u8',
  },
  {
    id: 'MIKAN NEKOSAN',
    title: 'MIKAN NEKOSAN',
    artist: 'yuruimukun',
    genre: 'halloween',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/MIKAN NEKOSAN/playlist.m3u8',
  },
  {
    id: 'kelt',
    title: 'kelt',
    artist: 'yuruimukun',
    genre: 'kelt',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/kelt/playlist.m3u8',
  },
  {
    id: 'ie-cafe',
    title: 'ie-cafe',
    artist: 'yuruimukun',
    genre: 'lofi',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/ie-cafe/playlist.m3u8',
  },
  {
    id: 'neko-cafe',
    title: 'neko-cafe',
    artist: 'yuruimukun',
    genre: 'lofi',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/neko-cafe/playlist.m3u8',
  },
  {
    id: 'oyasumi',
    title: 'oyasumi',
    artist: 'yuruimukun',
    genre: 'lofi',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/oyasumi/playlist.m3u8',
  },
  {
    id: 'tomoshibi',
    title: 'tomoshibi',
    artist: 'yuruimukun',
    genre: 'lofi',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/tomoshibi/playlist.m3u8',
  },
  {
    id: 'umi-cafe',
    title: 'umi-cafe',
    artist: 'yuruimukun',
    genre: 'lofi',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/umi-cafe/playlist.m3u8',
  },
  {
    id: 'reverth going back',
    title: 'reverth going back',
    artist: 'yuruimukun',
    genre: 'lofi-kelt',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/reverth going back/playlist.m3u8',
  },
  {
    id: 'revolutionary event',
    title: 'revolutionary event',
    artist: 'yuruimukun',
    genre: 'lofi-kelt',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/revolutionary event/playlist.m3u8',
  },
  {
    id: 'runing culture',
    title: 'runing culture',
    artist: 'yuruimukun',
    genre: 'lofi-kelt',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/runing culture/playlist.m3u8',
  },
  {
    id: 'second of the world',
    title: 'second of the world',
    artist: 'yuruimukun',
    genre: 'lofi-kelt',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/second of the world/playlist.m3u8',
  },
  {
    id: 'yugudorasiru-1',
    title: 'yugudorasiru-1',
    artist: 'yuruimukun',
    genre: 'lofi-kelt',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/yugudorasiru-1/playlist.m3u8',
  },
  {
    id: 'yugudorasiru-2',
    title: 'yugudorasiru-2',
    artist: 'yuruimukun',
    genre: 'lofi-kelt',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/yugudorasiru-2/playlist.m3u8',
  },
  {
    id: 'yugudorasiru-3',
    title: 'yugudorasiru-3',
    artist: 'yuruimukun',
    genre: 'lofi-kelt',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/yugudorasiru-3/playlist.m3u8',
  },
  {
    id: 'picnic',
    title: 'picnic',
    artist: 'yuruimukun',
    genre: 'natsu-music',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/picnic/playlist.m3u8',
  },
  {
    id: 'sakana',
    title: 'sakana',
    artist: 'yuruimukun',
    genre: 'natsu-music',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/sakana/playlist.m3u8',
  },
  {
    id: 'manji',
    title: 'manji',
    artist: 'yuruimukun',
    genre: 'uta',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/manji/playlist.m3u8',
  },
  {
    id: 'nekosan wa sugoi-uta',
    title: 'nekosan wa sugoi-uta',
    artist: 'yuruimukun',
    genre: 'uta',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/nekosan wa sugoi-uta/playlist.m3u8',
  },
  {
    id: 'onnrei',
    title: 'onnrei',
    artist: 'yuruimukun',
    genre: 'vocaloid',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/onnrei/playlist.m3u8',
  },
  {
    id: 'oumagadoki',
    title: 'oumagadoki',
    artist: 'yuruimukun',
    genre: 'vocaloid',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/oumagadoki/playlist.m3u8',
  },
  {
    id: 'owatte-hajimatte',
    title: 'owatte-hajimatte',
    artist: 'yuruimukun',
    genre: 'vocaloid',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/owatte-hajimatte/playlist.m3u8',
  },
  {
    id: 'wasure-oto',
    title: 'wasure-oto',
    artist: 'yuruimukun',
    genre: 'vocaloid',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/wasure-oto/playlist.m3u8',
  },
  {
    id: 'yoku',
    title: 'yoku',
    artist: 'yuruimukun',
    genre: 'vocaloid',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/yoku/playlist.m3u8',
  },
  {
    id: 'antinomy day',
    title: 'antinomy day',
    artist: 'yuruimukun',
    genre: 'wa',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/antinomy day/playlist.m3u8',
  },
  {
    id: 'chirizakura',
    title: 'chirizakura',
    artist: 'yuruimukun',
    genre: 'wa',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/chirizakura/playlist.m3u8',
  },
];

  const state = {
    currentIndex: 0,
    isPlaying: false,
    isShuffle: false,
    repeatMode: 0,
    volume: 1,
    isMuted: false,
    shuffleOrder: [],
    hls: null,
    currentGenre: 'all',
    filteredPlaylist: [],
    isGenreExpanded: false,
    hasCountedPlay: false
  };

  const elements = {
    audio: document.getElementById('audioPlayer'),
    albumArt: document.getElementById('albumArt'),
    trackTitle: document.getElementById('trackTitle'),
    trackArtist: document.getElementById('trackArtist'),
    timeCurrent: document.getElementById('timeCurrent'),
    timeTotal: document.getElementById('timeTotal'),
    progressBar: document.getElementById('progressBar'),
    progressFill: document.getElementById('progressFill'),
    progressHandle: document.getElementById('progressHandle'),
    playBtn: document.getElementById('playBtn'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    repeatBtn: document.getElementById('repeatBtn'),
    volumeBtn: document.getElementById('volumeBtn'),
    volumeSlider: document.getElementById('volumeSlider'),
    volumeFill: document.getElementById('volumeFill'),
    volumeHandle: document.getElementById('volumeHandle'),
    playlist: document.getElementById('playlist'),
    genreFilter: document.getElementById('genreFilter'),
    playShuffleBtn: document.getElementById('playShuffleBtn'),
    playOrderBtn: document.getElementById('playOrderBtn')
  };

  function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    var mins = Math.floor(seconds / 60);
    var secs = Math.floor(seconds % 60);
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
  }

  function shuffleArray(array) {
    var shuffled = array.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
    return shuffled;
  }

  function getGenres() {
    var genres = [];
    PLAYLIST.forEach(function(track) {
      if (track.genre && genres.indexOf(track.genre) === -1) {
        genres.push(track.genre);
      }
    });
    genres.sort();
    return ['all'].concat(genres);
  }

  function filterPlaylist(genre) {
    if (genre === 'all') {
      state.filteredPlaylist = PLAYLIST.slice();
    } else {
      state.filteredPlaylist = PLAYLIST.filter(function(track) {
        return track.genre === genre;
      });
    }
  }

  function getOriginalIndex(filteredIndex) {
    if (filteredIndex < 0 || filteredIndex >= state.filteredPlaylist.length) return -1;
    var track = state.filteredPlaylist[filteredIndex];
    for (var i = 0; i < PLAYLIST.length; i++) {
      if (PLAYLIST[i].id === track.id) return i;
    }
    return -1;
  }

  function getFilteredIndex(originalIndex) {
    if (originalIndex < 0 || originalIndex >= PLAYLIST.length) return -1;
    var track = PLAYLIST[originalIndex];
    for (var i = 0; i < state.filteredPlaylist.length; i++) {
      if (state.filteredPlaylist[i].id === track.id) return i;
    }
    return -1;
  }

  function updateGenreFilter() {
    if (!elements.genreFilter) return;
    elements.genreFilter.innerHTML = '';
    var genres = getGenres();

    // Header with All button and toggle button
    var header = document.createElement('div');
    header.className = 'genre-filter-header';

    // All button
    var allBtn = document.createElement('button');
    allBtn.className = 'genre-btn';
    allBtn.textContent = 'All';
    allBtn.dataset.genre = 'all';
    if (state.currentGenre === 'all') allBtn.classList.add('active');
    allBtn.addEventListener('click', function() { setGenre('all'); });
    header.appendChild(allBtn);

    // Toggle button (only if there are other genres)
    if (genres.length > 1) {
      var toggleBtn = document.createElement('button');
      toggleBtn.className = 'genre-toggle-btn';
      if (state.isGenreExpanded) toggleBtn.classList.add('expanded');
      toggleBtn.innerHTML = '<span class="toggle-arrow">▼</span> ' +
        (state.isGenreExpanded ? '閉じる' : 'ジャンル選択');
      toggleBtn.addEventListener('click', toggleGenreList);
      header.appendChild(toggleBtn);
    }

    elements.genreFilter.appendChild(header);

    // Genre list (collapsible)
    if (genres.length > 1) {
      var genreList = document.createElement('div');
      genreList.className = 'genre-list';
      genreList.id = 'genreList';
      if (state.isGenreExpanded) genreList.classList.add('expanded');

      // Vocal genres (hardcoded)
      var vocalGenres = ['uta', 'vocaloid'];

      // Separate instrument and vocal genres
      var instGenres = [];
      var vocalList = [];
      genres.forEach(function(genre) {
        if (genre === 'all') return;
        if (vocalGenres.indexOf(genre) >= 0) {
          vocalList.push(genre);
        } else {
          instGenres.push(genre);
        }
      });

      // Instrument section
      if (instGenres.length > 0) {
        var instSection = document.createElement('div');
        instSection.className = 'genre-section';

        var instHeader = document.createElement('div');
        instHeader.className = 'genre-section-header';
        instHeader.textContent = 'インスト';
        instSection.appendChild(instHeader);

        var instButtons = document.createElement('div');
        instButtons.className = 'genre-section-buttons';
        instGenres.forEach(function(genre) {
          var btn = document.createElement('button');
          btn.className = 'genre-btn';
          btn.textContent = genre;
          btn.dataset.genre = genre;
          if (genre === state.currentGenre) btn.classList.add('active');
          btn.addEventListener('click', function() { setGenre(genre); });
          instButtons.appendChild(btn);
        });
        instSection.appendChild(instButtons);
        genreList.appendChild(instSection);
      }

      // Vocal section
      if (vocalList.length > 0) {
        var vocalSection = document.createElement('div');
        vocalSection.className = 'genre-section genre-section-vocal';

        var vocalHeader = document.createElement('div');
        vocalHeader.className = 'genre-section-header';
        vocalHeader.textContent = '歌もの';
        vocalSection.appendChild(vocalHeader);

        var vocalButtons = document.createElement('div');
        vocalButtons.className = 'genre-section-buttons';
        vocalList.forEach(function(genre) {
          var btn = document.createElement('button');
          btn.className = 'genre-btn genre-btn-vocal';
          btn.textContent = genre;
          btn.dataset.genre = genre;
          if (genre === state.currentGenre) btn.classList.add('active');
          btn.addEventListener('click', function() { setGenre(genre); });
          vocalButtons.appendChild(btn);
        });
        vocalSection.appendChild(vocalButtons);
        genreList.appendChild(vocalSection);
      }

      elements.genreFilter.appendChild(genreList);
    }
  }

  function toggleGenreList() {
    state.isGenreExpanded = !state.isGenreExpanded;
    var genreList = document.getElementById('genreList');
    var toggleBtn = elements.genreFilter.querySelector('.genre-toggle-btn');

    if (genreList) {
      genreList.classList.toggle('expanded', state.isGenreExpanded);
    }
    if (toggleBtn) {
      toggleBtn.classList.toggle('expanded', state.isGenreExpanded);
      toggleBtn.innerHTML = '<span class="toggle-arrow">▼</span> ' +
        (state.isGenreExpanded ? '閉じる' : 'ジャンル選択');
    }
  }

  function setGenre(genre) {
    state.currentGenre = genre;
    filterPlaylist(genre);
    updateGenreFilter();
    updatePlaylistUI();
  }

  function generateShuffleOrder() {
    var indices = [];
    for (var i = 0; i < state.filteredPlaylist.length; i++) indices.push(i);
    state.shuffleOrder = shuffleArray(indices);
    var currentFilteredIndex = getFilteredIndex(state.currentIndex);
    if (currentFilteredIndex >= 0) {
      var pos = state.shuffleOrder.indexOf(currentFilteredIndex);
      if (pos > 0) {
        state.shuffleOrder.splice(pos, 1);
        state.shuffleOrder.unshift(currentFilteredIndex);
      }
    }
  }

  function sendPlayCount(trackId) {
    if (!trackId) return;
    fetch('/api/play-count', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackId: trackId })
    }).catch(function(err) {
      console.log('Play count error:', err);
    });
  }

  function initHLS(src) {
    if (state.hls) {
      state.hls.destroy();
      state.hls = null;
    }
    if (Hls.isSupported()) {
      state.hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        maxBufferSize: 60 * 1000 * 1000,
        maxBufferHole: 0.5
      });
      state.hls.loadSource(src);
      state.hls.attachMedia(elements.audio);
      state.hls.on(Hls.Events.MANIFEST_PARSED, function() {
        if (state.isPlaying) elements.audio.play();
      });
      state.hls.on(Hls.Events.ERROR, function(event, data) {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) state.hls.startLoad();
          else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) state.hls.recoverMediaError();
          else state.hls.destroy();
        }
      });
    } else if (elements.audio.canPlayType('application/vnd.apple.mpegurl')) {
      elements.audio.src = src;
    }
  }

  function loadTrack(index, autoPlay) {
    if (index < 0 || index >= PLAYLIST.length) return;
    state.currentIndex = index;
    state.hasCountedPlay = false;
    var track = PLAYLIST[index];
    elements.trackTitle.textContent = track.title;
    elements.trackArtist.textContent = track.artist;
    elements.timeCurrent.textContent = '0:00';
    elements.timeTotal.textContent = formatTime(track.duration);
    elements.progressFill.style.width = '0%';
    elements.progressHandle.style.left = '0%';
    updatePlaylistUI();
    initHLS(track.src);
    if (autoPlay) play();
  }

  function play() {
    if (PLAYLIST.length === 0) return;
    elements.audio.play().then(function() {
      state.isPlaying = true;
      updatePlayButton();
      updatePlaylistUI();
      // Send play count (only once per track)
      if (!state.hasCountedPlay) {
        state.hasCountedPlay = true;
        var track = PLAYLIST[state.currentIndex];
        if (track) sendPlayCount(track.id);
      }
    }).catch(function() {
      state.isPlaying = false;
      updatePlayButton();
    });
  }

  function pause() {
    elements.audio.pause();
    state.isPlaying = false;
    updatePlayButton();
    updatePlaylistUI();
  }

  function togglePlay() {
    if (state.isPlaying) pause();
    else play();
  }

  function playNext() {
    if (state.repeatMode === 2) {
      elements.audio.currentTime = 0;
      play();
      return;
    }
    var currentFilteredIndex = getFilteredIndex(state.currentIndex);
    var nextFilteredIndex;
    if (state.isShuffle) {
      var pos = state.shuffleOrder.indexOf(currentFilteredIndex);
      if (pos < state.shuffleOrder.length - 1) {
        nextFilteredIndex = state.shuffleOrder[pos + 1];
      } else if (state.repeatMode === 1) {
        generateShuffleOrder();
        nextFilteredIndex = state.shuffleOrder[0];
      } else {
        pause();
        return;
      }
    } else {
      if (currentFilteredIndex < state.filteredPlaylist.length - 1) {
        nextFilteredIndex = currentFilteredIndex + 1;
      } else if (state.repeatMode === 1) {
        nextFilteredIndex = 0;
      } else {
        pause();
        return;
      }
    }
    var nextOriginalIndex = getOriginalIndex(nextFilteredIndex);
    if (nextOriginalIndex >= 0) loadTrack(nextOriginalIndex, true);
  }

  function playPrev() {
    if (elements.audio.currentTime > 3) {
      elements.audio.currentTime = 0;
      return;
    }
    var currentFilteredIndex = getFilteredIndex(state.currentIndex);
    var prevFilteredIndex;
    if (state.isShuffle) {
      var pos = state.shuffleOrder.indexOf(currentFilteredIndex);
      prevFilteredIndex = pos > 0 ? state.shuffleOrder[pos - 1] : currentFilteredIndex;
    } else {
      prevFilteredIndex = currentFilteredIndex > 0 ? currentFilteredIndex - 1 : 0;
    }
    var prevOriginalIndex = getOriginalIndex(prevFilteredIndex);
    if (prevOriginalIndex >= 0) loadTrack(prevOriginalIndex, true);
  }

  function toggleShuffle() {
    state.isShuffle = !state.isShuffle;
    elements.shuffleBtn.classList.toggle('active', state.isShuffle);
    if (state.isShuffle) generateShuffleOrder();
  }

  function toggleRepeat() {
    state.repeatMode = (state.repeatMode + 1) % 3;
    elements.repeatBtn.classList.remove('active', 'repeat-one');
    if (state.repeatMode === 1) elements.repeatBtn.classList.add('active');
    else if (state.repeatMode === 2) elements.repeatBtn.classList.add('active', 'repeat-one');
  }

  function setVolume(value) {
    state.volume = Math.max(0, Math.min(1, value));
    elements.audio.volume = state.isMuted ? 0 : state.volume;
    var percent = state.volume * 100;
    elements.volumeFill.style.width = percent + '%';
    elements.volumeHandle.style.left = percent + '%';
    if (state.volume > 0 && state.isMuted) {
      state.isMuted = false;
      updateVolumeIcon();
    }
  }

  function toggleMute() {
    state.isMuted = !state.isMuted;
    elements.audio.volume = state.isMuted ? 0 : state.volume;
    updateVolumeIcon();
  }

  function seek(percent) {
    var duration = elements.audio.duration;
    if (!isNaN(duration) && isFinite(duration)) {
      elements.audio.currentTime = duration * percent;
    }
  }

  function playShuffled() {
    if (state.filteredPlaylist.length === 0) return;
    state.isShuffle = true;
    elements.shuffleBtn.classList.add('active');
    var indices = [];
    for (var i = 0; i < state.filteredPlaylist.length; i++) indices.push(i);
    state.shuffleOrder = shuffleArray(indices);
    var firstOriginalIndex = getOriginalIndex(state.shuffleOrder[0]);
    if (firstOriginalIndex >= 0) loadTrack(firstOriginalIndex, true);
  }

  function playInOrder() {
    if (state.filteredPlaylist.length === 0) return;
    state.isShuffle = false;
    elements.shuffleBtn.classList.remove('active');
    var firstOriginalIndex = getOriginalIndex(0);
    if (firstOriginalIndex >= 0) loadTrack(firstOriginalIndex, true);
  }

  function updatePlayButton() {
    var iconPlay = elements.playBtn.querySelector('.icon-play');
    var iconPause = elements.playBtn.querySelector('.icon-pause');
    if (state.isPlaying) {
      iconPlay.style.display = 'none';
      iconPause.style.display = 'block';
    } else {
      iconPlay.style.display = 'block';
      iconPause.style.display = 'none';
    }
  }

  function updateVolumeIcon() {
    var iconVolume = elements.volumeBtn.querySelector('.icon-volume');
    var iconMute = elements.volumeBtn.querySelector('.icon-mute');
    if (state.isMuted || state.volume === 0) {
      iconVolume.style.display = 'none';
      iconMute.style.display = 'block';
    } else {
      iconVolume.style.display = 'block';
      iconMute.style.display = 'none';
    }
  }

  function updateProgress() {
    var current = elements.audio.currentTime;
    var duration = elements.audio.duration;
    if (isNaN(duration) || !isFinite(duration)) return;
    var percent = (current / duration) * 100;
    elements.progressFill.style.width = percent + '%';
    elements.progressHandle.style.left = percent + '%';
    elements.timeCurrent.textContent = formatTime(current);
    elements.timeTotal.textContent = formatTime(duration);
  }

  function updatePlaylistUI() {
    elements.playlist.innerHTML = '';
    state.filteredPlaylist.forEach(function(track, filteredIndex) {
      var originalIndex = getOriginalIndex(filteredIndex);
      var li = document.createElement('li');
      li.className = 'playlist-item';
      if (originalIndex === state.currentIndex) {
        li.classList.add('active');
        if (state.isPlaying) li.classList.add('playing');
      }
      var icon = document.createElement('div');
      icon.className = 'playlist-item-icon';
      if (originalIndex === state.currentIndex && state.isPlaying) {
        var indicator = document.createElement('div');
        indicator.className = 'playing-indicator';
        indicator.innerHTML = '<span></span><span></span><span></span>';
        icon.appendChild(indicator);
      } else {
        icon.textContent = filteredIndex + 1;
      }
      var info = document.createElement('div');
      info.className = 'playlist-item-info';
      var title = document.createElement('div');
      title.className = 'playlist-item-title';
      title.textContent = track.title;
      info.appendChild(title);
      var duration = document.createElement('span');
      duration.className = 'playlist-item-duration';
      duration.textContent = track.duration ? formatTime(track.duration) : '';
      li.appendChild(icon);
      li.appendChild(info);
      li.appendChild(duration);
      li.addEventListener('click', function() {
        if (originalIndex === state.currentIndex) togglePlay();
        else loadTrack(originalIndex, true);
      });
      elements.playlist.appendChild(li);
    });
  }

  function setupEventListeners() {
    elements.playBtn.addEventListener('click', togglePlay);
    elements.prevBtn.addEventListener('click', playPrev);
    elements.nextBtn.addEventListener('click', playNext);
    elements.shuffleBtn.addEventListener('click', toggleShuffle);
    elements.repeatBtn.addEventListener('click', toggleRepeat);
    elements.volumeBtn.addEventListener('click', toggleMute);
    if (elements.playShuffleBtn) elements.playShuffleBtn.addEventListener('click', playShuffled);
    if (elements.playOrderBtn) elements.playOrderBtn.addEventListener('click', playInOrder);

    var isDraggingProgress = false;
    function handleProgressDrag(e) {
      var rect = elements.progressBar.getBoundingClientRect();
      seek(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
    }
    elements.progressBar.addEventListener('mousedown', function(e) {
      isDraggingProgress = true;
      handleProgressDrag(e);
    });
    document.addEventListener('mousemove', function(e) {
      if (isDraggingProgress) handleProgressDrag(e);
    });
    document.addEventListener('mouseup', function() {
      isDraggingProgress = false;
    });
    elements.progressBar.addEventListener('touchstart', function(e) {
      var touch = e.touches[0];
      var rect = elements.progressBar.getBoundingClientRect();
      seek(Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width)));
    });

    var isDraggingVolume = false;
    function handleVolumeDrag(e) {
      var rect = elements.volumeSlider.getBoundingClientRect();
      setVolume(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
    }
    elements.volumeSlider.addEventListener('mousedown', function(e) {
      isDraggingVolume = true;
      handleVolumeDrag(e);
    });
    document.addEventListener('mousemove', function(e) {
      if (isDraggingVolume) handleVolumeDrag(e);
    });
    document.addEventListener('mouseup', function() {
      isDraggingVolume = false;
    });

    elements.audio.addEventListener('timeupdate', updateProgress);
    elements.audio.addEventListener('ended', playNext);
    elements.audio.addEventListener('loadedmetadata', function() {
      elements.timeTotal.textContent = formatTime(elements.audio.duration);
      if (PLAYLIST[state.currentIndex]) {
        PLAYLIST[state.currentIndex].duration = elements.audio.duration;
        updatePlaylistUI();
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      switch (e.code) {
        case 'Space': e.preventDefault(); togglePlay(); break;
        case 'ArrowLeft': e.preventDefault(); if (e.shiftKey) playPrev(); else seek((elements.audio.currentTime - 5) / elements.audio.duration); break;
        case 'ArrowRight': e.preventDefault(); if (e.shiftKey) playNext(); else seek((elements.audio.currentTime + 5) / elements.audio.duration); break;
        case 'ArrowUp': e.preventDefault(); setVolume(state.volume + 0.1); break;
        case 'ArrowDown': e.preventDefault(); setVolume(state.volume - 0.1); break;
        case 'KeyM': e.preventDefault(); toggleMute(); break;
      }
    });

    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', play);
      navigator.mediaSession.setActionHandler('pause', pause);
      navigator.mediaSession.setActionHandler('previoustrack', playPrev);
      navigator.mediaSession.setActionHandler('nexttrack', playNext);
    }
  }

  function init() {
    if (PLAYLIST.length === 0) {
      elements.trackTitle.textContent = 'No tracks';
      return;
    }
    filterPlaylist('all');
    updateGenreFilter();
    setVolume(1);
    updateVolumeIcon();
    updatePlaylistUI();
    setupEventListeners();
    loadTrack(0, false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
