(function () {
  'use strict';

  var CONFIG_URL = '/config/top-arrival-bgm.json';
  var inlinePanel = document.getElementById('topArrivalBgm');
  var inlineLabel = document.getElementById('topArrivalBgmLabel');
  var inlineButton = document.getElementById('topArrivalBgmButton');
  var inlineButtonLabel = document.getElementById('topArrivalBgmButtonLabel');
  var popup = document.getElementById('topArrivalBgmPopup');
  var popupImage = document.getElementById('topArrivalBgmImage');
  var popupLabel = document.getElementById('topArrivalBgmPopupLabel');
  var popupButton = document.getElementById('topArrivalBgmPopupButton');
  var popupButtonLabel = document.getElementById('topArrivalBgmPopupButtonLabel');
  var nextDialog = document.getElementById('topArrivalBgmNextDialog');
  var nextYes = document.getElementById('topArrivalBgmNextYes');
  var nextNo = document.getElementById('topArrivalBgmNextNo');
  var audio = document.getElementById('topArrivalBgmAudio');
  var hasEnded = false;
  var mode = '';
  var hasStarted = false;

  if (!inlinePanel || !inlineLabel || !inlineButton || !inlineButtonLabel || !popup || !popupImage || !popupLabel || !popupButton || !popupButtonLabel || !nextDialog || !nextYes || !nextNo || !audio) return;

  function setButtonState(state) {
    var inlineText = '期間限定BGMを再生';
    var popupText = 'この曲を再生';
    if (state === 'playing') {
      inlineText = '停止する';
      popupText = '停止して閉じる';
    } else if (state === 'ended') {
      inlineText = 'もう一度聴く';
      popupText = 'もう一度聴く';
    }
    [inlineButton, popupButton].forEach(function (button) {
      button.setAttribute('aria-pressed', state === 'playing' ? 'true' : 'false');
    });
    inlineButtonLabel.textContent = inlineText;
    popupButtonLabel.textContent = popupText;
  }

  function hideAll() {
    inlinePanel.hidden = true;
    popup.hidden = true;
    mode = '';
  }

  function closeNextDialog() {
    nextDialog.hidden = true;
  }

  function showNextDialog() {
    nextDialog.hidden = false;
    nextYes.focus();
  }

  function showInline() {
    popup.hidden = true;
    mode = 'inline';
    inlinePanel.hidden = false;
    setButtonState('paused');
  }

  function showPopup() {
    inlinePanel.hidden = true;
    mode = 'popup';
    popup.hidden = false;
    setButtonState('paused');
  }

  function stop() {
    if (!audio.paused) audio.pause();
    if (mode === 'popup') hideAll();
    else if (!hasEnded) setButtonState('paused');
  }

  function start() {
    if (!audio.src) return;
    closeNextDialog();
    if (!audio.paused) {
      stop();
      return;
    }
    hasEnded = false;
    hasStarted = true;
    document.dispatchEvent(new CustomEvent('yuruimukun:top-arrival-bgm-play'));
    audio.play().catch(function () {
      hasStarted = false;
      setButtonState('paused');
    });
  }

  function isHttpsUrl(value) {
    try { return new URL(value).protocol === 'https:'; } catch (_) { return false; }
  }

  function isActiveConfig(config) {
    if (!config || config.enabled !== true) return false;
    if (typeof config.campaignId !== 'string' || !/^[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?$/.test(config.campaignId)) return false;
    if (typeof config.label !== 'string' || !config.label.trim()) return false;
    if (typeof config.audioUrl !== 'string' || !isHttpsUrl(config.audioUrl)) return false;
    if (typeof config.volume !== 'number' || config.volume < 0 || config.volume > 1) return false;
    var startsAt = Date.parse(config.startsAt);
    var endsAt = Date.parse(config.endsAt);
    return isFinite(startsAt) && isFinite(endsAt) && endsAt > startsAt && Date.now() >= startsAt && Date.now() <= endsAt;
  }

  inlineButton.addEventListener('click', start);
  popupButton.addEventListener('click', start);
  nextNo.addEventListener('click', closeNextDialog);
  nextYes.addEventListener('click', function () {
    closeNextDialog();
    document.dispatchEvent(new CustomEvent('yuruimukun:play-all-shuffled'));
    var player = document.getElementById('mainPlayer');
    if (player) player.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !nextDialog.hidden) closeNextDialog();
  });
  audio.addEventListener('play', function () {
    hasEnded = false;
    setButtonState('playing');
  });
  audio.addEventListener('pause', function () {
    if (mode === 'popup' && hasStarted) hideAll();
    else if (!hasEnded) setButtonState('paused');
  });
  audio.addEventListener('ended', function () {
    if (!hasStarted) return;
    hasEnded = true;
    hasStarted = false;
    if (mode === 'popup') hideAll();
    else setButtonState('ended');
    showNextDialog();
  });
  audio.addEventListener('error', function () {
    hideAll();
    closeNextDialog();
  });
  document.addEventListener('yuruimukun:main-player-play', stop);

  fetch(CONFIG_URL, { cache: 'no-store' })
    .then(function (response) {
      if (!response.ok) throw new Error('BGM config is unavailable');
      return response.json();
    })
    .then(function (config) {
      if (!isActiveConfig(config)) return;
      inlineLabel.textContent = config.label.trim();
      popupLabel.textContent = config.label.trim();
      audio.volume = config.volume;
      audio.src = config.audioUrl;
      if (typeof config.imageUrl === 'string' && isHttpsUrl(config.imageUrl)) {
        popupImage.onload = showPopup;
        popupImage.onerror = showInline;
        popupImage.alt = config.label.trim() + 'のサムネイル';
        popupImage.src = config.imageUrl;
      } else {
        showInline();
      }
    })
    .catch(function () {
      hideAll();
      closeNextDialog();
    });
})();
