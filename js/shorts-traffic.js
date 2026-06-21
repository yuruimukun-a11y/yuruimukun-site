(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  var rawContext = {
    source: (params.get('src') || '').trim(),
    entry: (params.get('entry') || '').trim(),
    via: (params.get('via') || '').trim()
  };
  var isCampaignVisit = Boolean(rawContext.source || rawContext.entry || rawContext.via);

  window.shortsTrafficContext = {
    source: rawContext.source || 'direct',
    entry: rawContext.entry || 'none',
    via: rawContext.via || 'direct',
    active: isCampaignVisit
  };

  function currentTrackId() {
    return document.body.getAttribute('data-track-id') || params.get('track') || 'none';
  }

  function currentPageKey() {
    var path = window.location.pathname.replace(/^\/+|\/+$/g, '');
    return path ? path.replace(/\//g, '_') : 'home';
  }

  function preserveTrafficParams(href) {
    var url;

    try {
      url = new URL(href, window.location.href);
    } catch (err) {
      return href;
    }

    if (url.origin !== window.location.origin) return href;

    if (rawContext.source && !url.searchParams.has('src')) {
      url.searchParams.set('src', rawContext.source);
    }
    if (rawContext.entry && !url.searchParams.has('entry')) {
      url.searchParams.set('entry', rawContext.entry);
    }
    if (rawContext.via && !url.searchParams.has('via')) {
      url.searchParams.set('via', rawContext.via);
    }

    return url.pathname + url.search + url.hash;
  }

  function rewriteInternalLinks() {
    if (!isCampaignVisit) return;

    var anchors = document.querySelectorAll('a[href]');
    anchors.forEach(function (anchor) {
      var href = anchor.getAttribute('href');
      if (!href) return;
      if (href.charAt(0) === '#') return;
      if (href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0 || href.indexOf('javascript:') === 0) return;

      anchor.setAttribute('href', preserveTrafficParams(href));
    });
  }

  function markSessionOnce(type, key) {
    try {
      var storageKey = ['shortsTraffic', type, key].join(':');
      if (window.sessionStorage && window.sessionStorage.getItem(storageKey)) {
        return false;
      }
      if (window.sessionStorage) {
        window.sessionStorage.setItem(storageKey, '1');
      }
    } catch (err) {
      return true;
    }
    return true;
  }

  function bindTrafficClicks() {
    if (!isCampaignVisit) return;

    var targets = document.querySelectorAll('[data-traffic-target]');
    targets.forEach(function (node) {
      node.addEventListener('click', function () {
        if (typeof window.firebaseTrafficClick !== 'function') return;
        window.firebaseTrafficClick({
          trackId: currentTrackId(),
          target: node.getAttribute('data-traffic-target') || 'unknown',
          page: currentPageKey()
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    rewriteInternalLinks();
    bindTrafficClicks();

    if (!isCampaignVisit) return;
    if (!markSessionOnce('landing', window.location.pathname + window.location.search)) return;
    if (typeof window.firebaseTrafficLanding !== 'function') return;

    window.firebaseTrafficLanding({
      trackId: currentTrackId(),
      page: currentPageKey()
    });
  });
})();
