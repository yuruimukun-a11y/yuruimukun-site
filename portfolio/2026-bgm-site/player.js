/**
 * [PORTFOLIO SNAPSHOT 2026-09] yuruimukun Music Player
 * 本番の js/player.js を2曲デモ用に凍結したコピー。ここを編集しても本番には影響しない。
 * yuruimukun Music Player
 * HLS.js based streaming player with genre filter
 */

(function () {
  'use strict';

  const PLAYLIST = [
    {
      id: 'umi-cafe',
      title: '海カフェ',
      artist: 'yuruimukun',
      genre: 'lofi',
      description: '海辺のカフェをイメージしたLo-Fi曲。波の音と潮風を感じながら、リゾート気分でリラックスできる一曲です。',
      src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/umi-cafe/playlist.m3u8',
    },
    {
      id: 'oyasumi',
      title: 'おやすみ',
      artist: 'yuruimukun',
      genre: 'lofi',
      description: '一日の終わりに聴きたい穏やかな曲。柔らかな音色が心を落ち着かせ、ゆったりとした眠りへと誘います。夜のリラックスタイムにおすすめです。',
      src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/oyasumi/playlist.m3u8',
    },
  ];

  // Single track mode for individual track pages
  if (window.SINGLE_TRACK) {
    PLAYLIST.length = 0;
    PLAYLIST.push(window.SINGLE_TRACK);
  }

  // メインプレイリスト定義（ランキング順）
  const MAIN_LISTS = {
    lofi: ["umi-cafe", "oyasumi"],
    normal: ["umi-cafe", "oyasumi"],
    timeline: ["oyasumi", "umi-cafe"],
    all: null
  };

  const state = {
    currentIndex: 0,
    isPlaying: false,
    isShuffle: false,
    repeatMode: 0,
    volume: 1,
    isMuted: false,
    shuffleOrder: [],
    hls: null,
    currentMainList: 'lofi',
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
    trackDescription: document.getElementById('trackDescription'),
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
    mainListFilter: document.getElementById('mainListFilter'),
    playShuffleBtn: document.getElementById('playShuffleBtn'),
    playOrderBtn: document.getElementById('playOrderBtn'),
    playlistEndModal: document.getElementById('playlistEndModal'),
    playlistEndText: document.getElementById('playlistEndText'),
    playlistEndConfirmBtn: document.getElementById('playlistEndConfirmBtn'),
    playlistEndDismissBtn: document.getElementById('playlistEndDismissBtn')
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
    getAvailablePlaylist().forEach(function (track) {
      if (track.genre && genres.indexOf(track.genre) === -1) {
        genres.push(track.genre);
      }
    });
    genres.sort();
    return ['all'].concat(genres);
  }

  function getAvailablePlaylist() {
    var now = Date.now();
    return PLAYLIST.filter(function (track) {
      return !track.expiresAt || new Date(track.expiresAt).getTime() > now;
    });
  }

  function scheduleExpiryRefresh() {
    var nextExpiry = PLAYLIST.reduce(function (earliest, track) {
      if (!track.expiresAt) return earliest;
      var expiry = new Date(track.expiresAt).getTime();
      return expiry > Date.now() && (!earliest || expiry < earliest) ? expiry : earliest;
    }, 0);
    if (nextExpiry) {
      window.setTimeout(function () { window.location.reload(); }, nextExpiry - Date.now() + 250);
    }
  }

  function filterPlaylist(genre) {
    // まずメインリストでフィルタリング
    var mainListIds = MAIN_LISTS[state.currentMainList];
    var availablePlaylist = getAvailablePlaylist();
    var baseList = [];

    if (mainListIds === null) {
      // ALLの場合は全曲を名前順でソート
      baseList = availablePlaylist.slice().sort(function (a, b) {
        return a.id.toLowerCase().localeCompare(b.id.toLowerCase());
      });
    } else {
      // メインリストの順番を維持してフィルタリング
      mainListIds.forEach(function (id) {
        var track = availablePlaylist.find(function (t) { return t.id === id; });
        if (track) baseList.push(track);
      });
    }

    // ジャンルでさらにフィルタリング
    if (genre === 'all') {
      state.filteredPlaylist = baseList;
    } else {
      state.filteredPlaylist = baseList.filter(function (track) {
        return track.genre === genre;
      });
    }
  }

  function setMainList(listType) {
    state.currentMainList = listType;
    state.currentGenre = 'all';
    filterPlaylist('all');
    updateMainListFilter();
    updateGenreFilter();
    updatePlaylistUI();
    if (state.filteredPlaylist.length > 0) {
      var firstOriginalIndex = getOriginalIndex(0);
      if (firstOriginalIndex >= 0) loadTrack(firstOriginalIndex, false);
    }
  }

  function updateMainListFilter() {
    if (!elements.mainListFilter) return;
    var buttons = elements.mainListFilter.querySelectorAll('.main-list-btn');
    buttons.forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.list === state.currentMainList);
    });
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
    allBtn.addEventListener('click', function () { setGenre('all'); });
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
      genres.forEach(function (genre) {
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
        instGenres.forEach(function (genre) {
          var btn = document.createElement('button');
          btn.className = 'genre-btn';
          btn.textContent = genre;
          btn.dataset.genre = genre;
          if (genre === state.currentGenre) btn.classList.add('active');
          btn.addEventListener('click', function () { setGenre(genre); });
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
        vocalList.forEach(function (genre) {
          var btn = document.createElement('button');
          btn.className = 'genre-btn genre-btn-vocal';
          btn.textContent = genre;
          btn.dataset.genre = genre;
          if (genre === state.currentGenre) btn.classList.add('active');
          btn.addEventListener('click', function () { setGenre(genre); });
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
    // Firebase経由で再生カウントを送信
    if (typeof window.firebasePlayCount === 'function') {
      window.firebasePlayCount(trackId);
    }
    if (typeof window.firebaseTrafficPlay === 'function' &&
        window.shortsTrafficContext &&
        window.shortsTrafficContext.active) {
      window.firebaseTrafficPlay({ trackId: trackId });
    }
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
      state.hls.on(Hls.Events.MANIFEST_PARSED, function () {
        if (state.isPlaying) elements.audio.play();
      });
      state.hls.on(Hls.Events.ERROR, function (event, data) {
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
    if (index < 0 || index >= PLAYLIST.length || getAvailablePlaylist().indexOf(PLAYLIST[index]) === -1) return;
    state.currentIndex = index;
    state.hasCountedPlay = false;
    var track = PLAYLIST[index];
    elements.trackTitle.textContent = track.title;
    elements.trackArtist.textContent = track.artist;
    elements.trackDescription.textContent = track.description || '';
    if (track.artwork) {
      var artwork = document.createElement('img');
      artwork.src = track.artwork;
      artwork.alt = track.title + ' のサムネイル';
      elements.albumArt.replaceChildren(artwork);
    } else {
      elements.albumArt.innerHTML = '<span class="album-art-placeholder">🎵</span>';
    }
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
    document.dispatchEvent(new CustomEvent('yuruimukun:main-player-play'));
    elements.audio.play().then(function () {
      state.isPlaying = true;
      updatePlayButton();
      updatePlaylistUI();
      // Send play count (only once per track)
      if (!state.hasCountedPlay) {
        state.hasCountedPlay = true;
        var track = PLAYLIST[state.currentIndex];
        if (track) sendPlayCount(track.id);
      }
    }).catch(function () {
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
        showPlaylistEndModal();
        return;
      }
    } else {
      if (currentFilteredIndex < state.filteredPlaylist.length - 1) {
        nextFilteredIndex = currentFilteredIndex + 1;
      } else if (state.repeatMode === 1) {
        nextFilteredIndex = 0;
      } else {
        pause();
        showPlaylistEndModal();
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

  function showPlaylistEndModal() {
    if (!elements.playlistEndModal) return;
    var isAllShuffle = state.currentMainList === 'all' && state.isShuffle;
    if (elements.playlistEndText) {
      elements.playlistEndText.textContent = isAllShuffle ?
        '全曲を聴き終わりました。もう一度シャッフルで聴きますか？' :
        '全曲リストをシャッフルで聴いてみますか？';
    }
    if (elements.playlistEndConfirmBtn) {
      elements.playlistEndConfirmBtn.textContent = isAllShuffle ?
        '🔀 もう一度シャッフル再生' : '🔀 全曲をシャッフル再生';
    }
    elements.playlistEndModal.hidden = false;
  }

  function hidePlaylistEndModal() {
    if (!elements.playlistEndModal) return;
    elements.playlistEndModal.hidden = true;
  }

  function confirmPlaylistEndSuggestion() {
    hidePlaylistEndModal();
    if (state.currentMainList !== 'all') {
      state.currentMainList = 'all';
      state.currentGenre = 'all';
      filterPlaylist('all');
      updateMainListFilter();
      updateGenreFilter();
      updatePlaylistUI();
    }
    playShuffled();
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
    state.filteredPlaylist.forEach(function (track, filteredIndex) {
      var originalIndex = getOriginalIndex(filteredIndex);
      var li = document.createElement('li');
      li.className = 'playlist-item';
      li.tabIndex = 0;
      li.setAttribute('role', 'button');
      li.setAttribute('aria-label', track.title + 'を再生');
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
      li.addEventListener('click', function () {
        if (originalIndex === state.currentIndex) togglePlay();
        else loadTrack(originalIndex, true);
      });
      li.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        li.click();
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
    if (elements.playlistEndConfirmBtn) elements.playlistEndConfirmBtn.addEventListener('click', confirmPlaylistEndSuggestion);
    if (elements.playlistEndDismissBtn) elements.playlistEndDismissBtn.addEventListener('click', hidePlaylistEndModal);
    if (elements.playlistEndModal) {
      elements.playlistEndModal.addEventListener('click', function (e) {
        if (e.target === elements.playlistEndModal) hidePlaylistEndModal();
      });
    }

    var isDraggingProgress = false;
    function handleProgressDrag(e) {
      var rect = elements.progressBar.getBoundingClientRect();
      seek(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
    }
    elements.progressBar.addEventListener('mousedown', function (e) {
      isDraggingProgress = true;
      handleProgressDrag(e);
    });
    document.addEventListener('mousemove', function (e) {
      if (isDraggingProgress) handleProgressDrag(e);
    });
    document.addEventListener('mouseup', function () {
      isDraggingProgress = false;
    });
    elements.progressBar.addEventListener('touchstart', function (e) {
      var touch = e.touches[0];
      var rect = elements.progressBar.getBoundingClientRect();
      seek(Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width)));
    });

    var isDraggingVolume = false;
    function handleVolumeDrag(e) {
      var rect = elements.volumeSlider.getBoundingClientRect();
      setVolume(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
    }
    elements.volumeSlider.addEventListener('mousedown', function (e) {
      isDraggingVolume = true;
      handleVolumeDrag(e);
    });
    document.addEventListener('mousemove', function (e) {
      if (isDraggingVolume) handleVolumeDrag(e);
    });
    document.addEventListener('mouseup', function () {
      isDraggingVolume = false;
    });

    elements.audio.addEventListener('timeupdate', updateProgress);
    elements.audio.addEventListener('ended', playNext);
    elements.audio.addEventListener('loadedmetadata', function () {
      elements.timeTotal.textContent = formatTime(elements.audio.duration);
      if (PLAYLIST[state.currentIndex]) {
        PLAYLIST[state.currentIndex].duration = elements.audio.duration;
        updatePlaylistUI();
      }
    });

    document.addEventListener('yuruimukun:top-arrival-bgm-play', function () {
      if (state.isPlaying) pause();
    });

    document.addEventListener('yuruimukun:play-all-shuffled', function () {
      setMainList('all');
      playShuffled();
    });

    document.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON' || e.target.tagName === 'SELECT') return;
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

    // URLパラメータで曲指定があるかチェック
    var urlParams = new URLSearchParams(window.location.search);
    var trackParam = urlParams.get('track');
    var initialTrackIndex = -1;

    if (trackParam) {
      // 指定された曲を全PLAYLISTから検索
      for (var i = 0; i < PLAYLIST.length; i++) {
        if (PLAYLIST[i].id === trackParam && getAvailablePlaylist().indexOf(PLAYLIST[i]) !== -1) {
          initialTrackIndex = i;
          break;
        }
      }
    }

    // メインリストフィルターのイベント設定
    if (elements.mainListFilter) {
      var buttons = elements.mainListFilter.querySelectorAll('.main-list-btn');
      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          setMainList(btn.dataset.list);
        });
      });
    }

    // デフォルトはlofi
    state.currentMainList = 'lofi';
    filterPlaylist('all');
    updateMainListFilter();
    updateGenreFilter();
    setVolume(1);
    updateVolumeIcon();
    updatePlaylistUI();
    setupEventListeners();
    scheduleExpiryRefresh();

    // URLパラメータで曲が指定されていれば、その曲を自動再生
    if (initialTrackIndex >= 0) {
      loadTrack(initialTrackIndex, true);
    } else if (state.filteredPlaylist.length > 0) {
      // filteredPlaylistの最初の曲を読み込む
      var firstOriginalIndex = getOriginalIndex(0);
      if (firstOriginalIndex >= 0) loadTrack(firstOriginalIndex, false);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
