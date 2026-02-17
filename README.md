# ゆるいむくん Music Streaming

HLS形式のストリーミング音楽配信サイト

## セットアップ

```bash
# サーバー起動
npm start
```

ブラウザで http://localhost:3000 を開く

## 曲の追加方法

サイトへの楽曲追加は、**1. HLS変換**, **2. R2アップロード**, **3. プレイリスト更新** の3ステップで行います。

### 1. 音声ファイルをHLSに変換

ffmpegを使用して、音声ファイルをストリーミング用のHLS形式（`.m3u8`と`.ts`）に変換します。

```bash
# 例: 192kbps MP3に変換してHLS出力
ffmpeg -i input.wav -codec:a libmp3lame -b:a 192k -map 0:a -f hls -hls_time 10 -hls_playlist_type event -hls_segment_filename "seg_%03d.ts" index.m3u8
```

### 2. Cloudflare R2へのアップロード

生成されたファイルを Cloudflare R2 の `yuruimukun-music` バケットにアップロードします。

- 構成例: `uta/SONG_ID/index.m3u8`
- 公開URL例: `https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/uta/SONG_ID/index.m3u8`

### 3. プレイリストに曲を追加 (GitHub)

`js/player.js` の `PLAYLIST` 配列を編集し、GitHubへプッシュします。

```javascript
{
  id: 'SONG_ID',
  title: '日本語の曲名',
  artist: 'yuruimukun',
  genre: 'uta', // ジャンル
  description: '説明文...',
  src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/uta/SONG_ID/index.m3u8',
}
```

※ `MAIN_LISTS.normal` に ID を追加すると、トップページの推奨リストに表示されます。

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
