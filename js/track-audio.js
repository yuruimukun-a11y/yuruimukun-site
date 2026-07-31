(function () {
  'use strict';

  var players = document.querySelectorAll('[data-track-audio]');

  Array.prototype.forEach.call(players, function (container) {
    var audio = container.querySelector('audio');
    var status = container.querySelector('[data-audio-status]');
    var source = container.getAttribute('data-src');

    if (!audio || !source) return;

    function setStatus(message) {
      if (status) status.textContent = message;
    }

    if (audio.canPlayType('application/vnd.apple.mpegurl')) {
      audio.src = source;
      setStatus('再生ボタンを押すと、このページで曲を聴けます。');
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(source);
      hls.attachMedia(audio);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setStatus('再生ボタンを押すと、このページで曲を聴けます。');
      });
      hls.on(window.Hls.Events.ERROR, function (_event, data) {
        if (data && data.fatal) {
          setStatus('このブラウザでは読み込めませんでした。下の公式サイト再生リンクをご利用ください。');
        }
      });
      return;
    }

    setStatus('このブラウザはページ内再生に対応していません。下の公式サイト再生リンクをご利用ください。');
  });
}());
