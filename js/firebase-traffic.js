import { initializeApp, getApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, set, increment } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

const firebaseConfig = {
  authDomain: 'yuruimukun-bb86c.firebaseapp.com',
  databaseURL: 'https://yuruimukun-bb86c-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'yuruimukun-bb86c',
  storageBucket: 'yuruimukun-bb86c.firebasestorage.app',
  messagingSenderId: '703457198184',
  appId: '1:703457198184:web:033fd3e43b696767d23bdd'
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getDatabase(app);

function safeKey(value, fallback) {
  var normalized = String(value || '')
    .trim()
    .replace(/[.#$/\[\]]/g, '-')
    .replace(/\s+/g, '_')
    .replace(/[^0-9A-Za-z_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-_]+|[-_]+$/g, '');

  return normalized || fallback || 'none';
}

function getTrafficContext() {
  var params = new URLSearchParams(window.location.search);
  return {
    source: safeKey(params.get('src'), 'direct'),
    entry: safeKey(params.get('entry'), 'none'),
    via: safeKey(params.get('via'), 'direct')
  };
}

async function incrementLog(path) {
  try {
    await set(ref(db, path), increment(1));
  } catch (err) {
    console.log('Shorts traffic error:', err);
  }
}

window.firebaseTrafficLanding = async function (payload) {
  var ctx = getTrafficContext();
  var today = new Date().toISOString().split('T')[0];
  var page = safeKey(payload && payload.page, 'unknown');
  var trackId = safeKey(payload && payload.trackId, 'none');

  await incrementLog('shortsTraffic/' + today + '/landings/' + ctx.source + '/' + ctx.entry + '/' + ctx.via + '/' + page + '/' + trackId);
};

window.firebaseTrafficClick = async function (payload) {
  var ctx = getTrafficContext();
  var today = new Date().toISOString().split('T')[0];
  var trackId = safeKey(payload && payload.trackId, 'none');
  var target = safeKey(payload && payload.target, 'unknown');

  await incrementLog('shortsTraffic/' + today + '/clicks/' + ctx.source + '/' + ctx.entry + '/' + ctx.via + '/' + trackId + '/' + target);
};

window.firebaseTrafficPlay = async function (payload) {
  var ctx = getTrafficContext();
  var today = new Date().toISOString().split('T')[0];
  var trackId = safeKey(payload && payload.trackId, 'none');

  await incrementLog('shortsTraffic/' + today + '/plays/' + ctx.source + '/' + ctx.entry + '/' + ctx.via + '/' + trackId);
};
