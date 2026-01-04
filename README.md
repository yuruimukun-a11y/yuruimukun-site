# ゆるいむくん Music Streaming

HLS形式のストリーミング音楽配信サイト

## セットアップ

```bash
# サーバー起動
npm start
```

ブラウザで http://localhost:3000 を開く

## 曲の追加方法

### 1. 音声ファイルをHLSに変換

```bash
# 単一ファイル変換
./tools/convert.sh sample.wav music/sample

# 一括変換
./tools/batch_convert.sh ./raw_audio ./music
```

**必要なもの:** ffmpeg

### 2. プレイリストに曲を追加

`js/player.js` の `PLAYLIST` 配列を編集:

```javascript
const PLAYLIST = [
  {
    id: 'sample',
    title: 'サンプル曲',
    artist: 'ゆるいむくん',
    src: '/music/sample/playlist.m3u8',
    duration: 0
  },
  // 新しい曲を追加
  {
    id: 'newsong',
    title: '新しい曲',
    artist: 'ゆるいむくん',
    src: '/music/newsong/playlist.m3u8',
    duration: 0
  }
];
```

## ファイル構成

```
yuruimukun-site/
├── index.html           # メインページ
├── css/style.css        # スタイル
├── js/player.js         # HLSプレイヤー
├── server/server.js     # ローカルサーバー
├── music/               # HLSファイル
│   └── sample/
│       ├── playlist.m3u8
│       └── segment_XXX.ts
├── tools/
│   ├── convert.sh       # 単一変換
│   └── batch_convert.sh # 一括変換
└── package.json
```

## キーボードショートカット

| キー | 機能 |
|------|------|
| Space | 再生/停止 |
| ← | 5秒戻る |
| → | 5秒進む |
| Shift+← | 前の曲 |
| Shift+→ | 次の曲 |
| ↑ | 音量上げる |
| ↓ | 音量下げる |
| M | ミュート |
| S | シャッフル |
| R | リピート |

## 技術仕様

- **フロントエンド:** HTML/CSS/JavaScript + HLS.js
- **バックエンド:** Node.js（外部パッケージ不要）
- **音声形式:** HLS (256kbps AAC, 48kHz)
- **セグメント長:** 10秒
