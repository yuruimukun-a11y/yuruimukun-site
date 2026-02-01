# 🔍 動作確認チェックリスト

## ⏰ タイミング
Vercelのデプロイ完了後（git pushから約5-10分後）に実施してください。

## ✅ 確認項目

### 1. robots.txt の確認
- [ ] ブラウザで開く: https://yuruimukun.com/robots.txt
- [ ] 以下の内容が表示されることを確認:
  ```
  User-agent: *
  Allow: /
  Sitemap: https://yuruimukun.com/sitemap.xml
  ...
  ```

### 2. sitemap.xml の確認
- [ ] ブラウザで開く: https://yuruimukun.com/sitemap.xml
- [ ] XMLフォーマットで35個のURL（<url>タグ）が表示されることを確認
- [ ] トップページ、楽曲一覧、各楽曲ページが含まれていることを確認

### 3. wwwリダイレクトの確認
- [ ] ブラウザで開く: https://www.yuruimukun.com/
- [ ] 自動的に https://yuruimukun.com/ にリダイレクトされることを確認
- [ ] アドレスバーのURLが `www` なしになっていることを確認

### 4. canonicalタグの確認（開発者ツール）

#### トップページ
- [ ] https://yuruimukun.com/ を開く
- [ ] F12キー → 「Elements」タブ → `<head>` 内を確認
- [ ] `<link rel="canonical" href="https://yuruimukun.com/">` があることを確認

#### 楽曲一覧ページ
- [ ] https://yuruimukun.com/public/tracks/ を開く
- [ ] F12キー → 「Elements」タブ → `<head>` 内を確認  
- [ ] `<link rel="canonical" href="https://yuruimukun.com/public/tracks/">` があることを確認

#### 個別楽曲ページ（サンプル）
- [ ] https://yuruimukun.com/public/tracks/acid.html を開く
- [ ] F12キー → 「Elements」タブ → `<head>` 内を確認
- [ ] `<link rel="canonical" href="https://yuruimukun.com/public/tracks/acid.html">` があることを確認
- [ ] `<meta property="og:url" content="https://yuruimukun.com/public/tracks/acid.html">` があることを確認

### 5. Google Search Consoleでの確認（重要）

#### サイトマップの送信
1. [ ] https://search.google.com/search-console にログイン
2. [ ] yuruimukun.com のプロパティを選択
3. [ ] 左メニュー「インデックス作成」→「サイトマップ」をクリック
4. [ ] 「新しいサイトマップの追加」に `sitemap.xml` と入力
5. [ ] 「送信」ボタンをクリック
6. [ ] ステータスが「成功しました」になることを確認（数分かかる場合があります）

#### 修正の検証
1. [ ] 左メニュー「インデックス作成」→「ページ」をクリック
2. [ ] 「ページにリダイレクトがあります」のエラーを探す
3. [ ] エラー行の右側にある「修正を検証」ボタンをクリック
4. [ ] 検証が開始されたことを確認
   
   **注意:** 検証には数日～1週間かかります。気長に待ちましょう。

#### インデックス登録のリクエスト（オプション）
- [ ] 特定のページを優先的にインデックスさせたい場合:
  1. Google Search Console のトップページ上部の検索バーにURLを入力
  2. 「インデックス登録をリクエスト」ボタンをクリック
  3. 処理完了まで1-2分待機

## 📊 確認結果の記録

### 実施日時
- 確認実施日: ______年____月____日 ____時____分

### 確認結果
- [ ] すべての項目をクリアした
- [ ] 一部の項目に問題があった（下記に詳細を記載）

### 問題があった場合の詳細
```
（ここに問題の詳細を記載）


```

## 🆘 トラブルシューティング

### robots.txt が表示されない
→ Vercelのデプロイが完了していない可能性があります。5-10分待ってから再度確認してください。

### sitemap.xml が表示されない
→ 同上。Vercelのデプロイ完了を待ってください。

### www → 非www のリダイレクトが動作しない
→ vercel.json の設定が反映されていない可能性があります。Vercelのダッシュボードでデプロイログを確認してください。

### canonicalタグが見つからない
→ キャッシュの問題の可能性があります。Ctrl+F5（Windows）または Cmd+Shift+R（Mac）でハードリロードしてください。

---

**作成日:** 2026年01月30日
