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
  var feedbackGood = document.getElementById('topArrivalBgmFeedbackGood');
  var feedbackBad = document.getElementById('topArrivalBgmFeedbackBad');
  var feedbackStatus = document.getElementById('topArrivalBgmFeedbackStatus');
  var audio = document.getElementById('topArrivalBgmAudio');
  var hasEnded = false;
  var mode = '';
  var hasStarted = false;
  var activeCampaignId = '';
  var sessionVote = '';
  var feedbackBusy = false;

  if (!inlinePanel || !inlineLabel || !inlineButton || !inlineButtonLabel || !popup || !popupImage || !popupLabel || !popupButton || !popupButtonLabel || !nextDialog || !nextYes || !nextNo || !feedbackGood || !feedbackBad || !feedbackStatus || !audio) return;

  function storedVote() {
    if (sessionVote) return sessionVote;
    try {
      var vote = localStorage.getItem('yuruimukun:top-bgm-vote:' + activeCampaignId);
      return vote === 'good' || vote === 'bad' ? vote : '';
    } catch (_) {
      return '';
    }
  }

  function setFeedbackState(message) {
    var voted = storedVote();
    feedbackGood.disabled = Boolean(voted) || feedbackBusy;
    feedbackBad.disabled = Boolean(voted) || feedbackBusy;
    feedbackStatus.textContent = message || (voted ? '回答ありがとうございました。今後の曲作りの参考にします。' : '匿名で制作者に届きます。');
  }

  function saveVoteLocally(rating) {
    sessionVote = rating;
    try { localStorage.setItem('yuruimukun:top-bgm-vote:' + activeCampaignId, rating); } catch (_) { /* This session still remembers the vote. */ }
  }

  async function sendFeedback(rating) {
    if (!activeCampaignId || storedVote() || feedbackBusy) return;
    feedbackBusy = true;
    setFeedbackState('送信中…');
    try {
      if (typeof window.firebaseSecretRating !== 'function' || !(await window.firebaseSecretRating(activeCampaignId, rating))) {
        throw new Error('Firebase rating unavailable');
      }
      saveVoteLocally(rating);
      feedbackBusy = false;
      setFeedbackState();
    } catch (_) {
      feedbackBusy = false;
      setFeedbackState('送信できませんでした。もう一度お試しください。');
    }
  }

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
    setFeedbackState();
    (storedVote() ? nextYes : feedbackGood).focus();
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
  feedbackGood.addEventListener('click', function () { void sendFeedback('good'); });
  feedbackBad.addEventListener('click', function () { void sendFeedback('bad'); });
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
      activeCampaignId = config.campaignId;
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
