/**
 * トップページの導線
 * - 「ボカロを聴く」「猫とカフェのBGMを聴く」でプレイヤーのリストを切り替える
 * - 代表曲カードの再生ボタンでその曲を直接鳴らす
 * - ジャケット画像が未用意でも崩れないようにフォールバックを出す
 */
(function () {
  'use strict';

  var ENTRIES = {
    vocaloid: { list: 'all', genre: 'vocaloid', label: 'ボカロ' },
    bgm: { list: 'lofi', genre: 'all', label: '猫とカフェのBGM' }
  };

  function player() {
    return window.yuruimukunPlayer || null;
  }

  function scrollTo(selector) {
    var target = document.querySelector(selector);
    if (!target) return;
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  function scrollToPlayer() {
    scrollTo('#mainPlayer');
  }

  // 入口ボタンは「その曲が並んでいる場所」まで送る。
  // プレイヤーだけ見せても、絞り込み結果が画面外だと切り替わったことが伝わらないため。
  function scrollToPlaylist() {
    scrollTo('.playlist-section');
  }

  function setEntryPressed(activeKey) {
    var buttons = document.querySelectorAll('[data-entry]');
    buttons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-entry') === activeKey ? 'true' : 'false');
    });
  }

  function bindEntryButtons() {
    var buttons = document.querySelectorAll('[data-entry]');
    if (!buttons.length) return;

    buttons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', 'false');
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-entry');
        var entry = ENTRIES[key];
        var api = player();
        if (!entry || !api) return;

        api.selectList(entry.list, entry.genre);
        setEntryPressed(key);
        scrollToPlaylist();
      });
    });
  }

  function bindLeadTrackButtons() {
    var buttons = document.querySelectorAll('[data-play-track]');
    if (!buttons.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var api = player();
        if (!api) return;

        var trackId = btn.getAttribute('data-play-track');
        var started = api.playTrackById(trackId);

        if (!started) {
          // 期間限定などで今は聴けない場合は、プレイヤーまで送るだけにする
          scrollToPlayer();
          return;
        }

        setEntryPressed(null);
        scrollToPlayer();
      });
    });
  }

  // 曲別のジャケットが無い場合は、サイト共通のイメージ画像へ差し替える。
  // それも読めない時だけ、記号のプレースホルダを出す。
  function bindArtworkFallback() {
    var images = document.querySelectorAll('[data-lead-art-img]');
    if (!images.length) return;

    images.forEach(function (img) {
      var triedFallback = false;

      function handleMissing() {
        var fallback = img.getAttribute('data-lead-art-fallback');

        if (fallback && !triedFallback) {
          triedFallback = true;
          img.src = fallback;
          return;
        }

        var holder = img.closest('[data-lead-art]');
        if (holder) holder.classList.add('is-missing');
      }

      img.addEventListener('error', handleMissing);

      if (img.complete && img.naturalWidth === 0) {
        handleMissing();
      }
    });
  }

  // プレイリスト側のボタンで絞り込みを変えたら、入口ボタンの選択表示は外す。
  // 押したままに見えると、今どちらで絞っているのか分からなくなるため。
  function bindManualFilterReset() {
    var section = document.querySelector('.playlist-section');
    if (!section) return;

    section.addEventListener('click', function (event) {
      var target = event.target;
      if (!target || !target.closest) return;
      if (target.closest('.main-list-btn') || target.closest('.genre-btn')) {
        setEntryPressed(null);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindEntryButtons();
    bindLeadTrackButtons();
    bindArtworkFallback();
    bindManualFilterReset();
  });
})();
