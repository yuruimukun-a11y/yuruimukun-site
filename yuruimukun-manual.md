# ゆるいむくん Music Site 運用マニュアル

## サイト情報

- **URL**: https://yuruimukun.com
- **GitHub**: https://github.com/yuruimukun-prog/yuruimukun-site
- **Vercel**: https://vercel.com/yuruimukuns-projects/yuruimukun-site

---

## 曲の追加方法

### 1. WAVファイルを配置

```
wav_input/
├── [ジャンル名]/
│   └── [曲名].wav
```

**例:**
```
wav_input/
├── lofi/
│   └── chill-beat.wav
├── guitar/
│   └── rock-song.wav
└── uta/
    └── vocal-track.wav
```

**注意:**
- フォルダ名・ファイル名は **英語のみ**（日本語は文字化け）
- フォルダ名 = ジャンル名として自動認識

### 2. 変換を実行

`convert_all.bat` をダブルクリック

**自動で行われること:**
- WAV → HLS変換（256kbps AAC, 48kHz）
- `music/` フォルダに出力
- `js/player.js` のプレイリスト自動更新
- `playlist_data.js` にバックアップ保存

### 3. GitHubにプッシュ

```powershell
cd "E:\ルーティン用 イムなど\イム\yuruimukun-site"
git add .
git commit -m "曲追加"
git push
```

### 4. 完了

1〜2分後に https://yuruimukun.com に自動反映

---

## ジャンルの追加方法

`wav_input/` に新しいフォルダを作るだけ！

```
wav_input/
├── lofi/        ← 既存
├── guitar/      ← 既存
└── newgenre/    ← 新規追加
    └── song.wav
```

`convert_all.bat` を実行すれば、ジャンルタブに自動追加される。

---

## ローカルでの動作確認

### サーバー起動

```powershell
cd "E:\ルーティン用 イムなど\イム\yuruimukun-site"
npm start
```

ブラウザで http://localhost:3000 を開く

### ポートが使用中の場合

```powershell
npx kill-port 3000
npm start
```

---

## 再生回数の確認

### 本番サイト
```
https://yuruimukun.com/api/play-counts
```

### ローカル
```
http://localhost:3000/api/play-counts
```

**出力例:**
```json
{
  "manji": 15,
  "yuruimu-beat1": 42,
  "chill-track": 8
}
```

---

## ファイル構成

```
yuruimukun-site/
├── index.html          # メインページ
├── 404.html            # 404エラーページ
├── css/
│   └── style.css       # スタイル
├── js/
│   └── player.js       # プレイヤー（プレイリスト含む）
├── server/
│   ├── server.js       # Node.jsサーバー
│   └── play_counts.json # 再生カウントデータ
├── music/              # HLS変換後の音楽ファイル
│   └── [曲名]/
│       ├── playlist.m3u8
│       └── segment_XXX.ts
├── wav_input/          # 変換元WAVファイル
│   └── [ジャンル]/
│       └── [曲].wav
├── convert_all.bat     # 変換バッチファイル
├── playlist_data.js    # プレイリストバックアップ
├── package.json
├── .gitignore
└── README.md
```

---

## トラブルシューティング

### 曲が表示されない
1. `convert_all.bat` が正常終了したか確認
2. `git push` したか確認
3. ブラウザをリロード（Ctrl+F5）

### 変換エラー
- ffmpegがインストールされているか確認
- WAVファイルが壊れていないか確認
- ファイル名に日本語が含まれていないか確認

### サーバーが起動しない
```powershell
npx kill-port 3000
npm start
```

### GitHubにプッシュできない
```powershell
git status
git add .
git commit -m "メッセージ"
git push
```

---

## 各サービスへのログイン

| サービス | URL | 用途 |
|---------|-----|------|
| GitHub | https://github.com | コード管理 |
| Vercel | https://vercel.com | ホスティング |
| Cloudflare | https://dash.cloudflare.com | ドメイン管理 |
| Google AdSense | https://adsense.google.com | 広告収益 |

---

## 更新履歴

- 2026/01/04: サイト公開、AdSense申請
