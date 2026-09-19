/**
 * トップページの導線
 * - 代表曲カードと「最近できたもの」の再生ボタンで、その曲を直接鳴らす
 * - ジャケット画像が未用意でも崩れないようにフォールバックを出す
 *
 * 「ボカロを聴く」「猫とカフェのBGMを聴く」の2ボタンはトップから削除した。
 * 上の3入口（歌 / 静かな音 / 猫）が ?list= で同じことをするようになり、
 * 「猫とカフェのBGM」は「静かな音を聴く」と完全に同じ動作だったため。
 */
(function () {
  'use strict';

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

  document.addEventListener('DOMContentLoaded', function () {
    bindLeadTrackButtons();
    bindArtworkFallback();
  });
})();
