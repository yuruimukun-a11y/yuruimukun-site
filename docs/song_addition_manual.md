# 楽曲追加マニュアル (Standard Procedure)

yuruimukun公式サイトに楽曲を追加する際の標準手順です。
既存のスクリプト (`convert_all.bat`, `upload-to-r2.sh`) を使用して、変換・リスト更新・アップロードを自動化します。

## 1. 準備

1. **WAVファイルの用意**
   - 追加したい楽曲の `.wav` ファイルを用意します。
   - ファイル名がそのまま曲IDになります（例: `hai.wav` -> ID: `hai`）。

2. **ファイルの配置**
   - ファイルを以下のフォルダに入れます。
   - `c:\Users\pcganbarutarou\clawd\projects\jibun\yuruimukun-site\wav_input`
   - ※ジャンル分けしたい場合はサブフォルダを作成してもOKです。

## 2. 変換とリスト更新 (Local)

1. **スクリプト実行**
   - `c:\Users\pcganbarutarou\clawd\projects\jibun\yuruimukun-site\convert_all.bat` をダブルクリック（またはコマンドラインで実行）します。

2. **処理内容（自動）**
   - WAVファイルを HLS (.m3u8 + .ts) に変換し `music/` フォルダに出力します。
   - `playlist_data.js` を再生成します。
   - `js/player.js` のプレイリスト部分を自動更新します。

3. **確認**
   - `js/player.js` を開き、最下部またはリスト内に新しい曲が追加されていることを確認します。
   - `genre`, `description` などは自動判定（フォルダ名等）またはデフォルト値になります。必要であれば `js/player.js` を手動で微修正します。

## 3. アップロード (R2)

1. **スクリプト実行**
   - Git Bash または WSL ターミナルで `upload-to-r2.sh` を実行します。
   ```bash
   cd c:/Users/pcganbarutarou/clawd/projects/jibun/yuruimukun-site
   ./upload-to-r2.sh
   ```

2. **処理内容**
   - `music/` フォルダ内の新規・更新ファイルを Cloudflare R2 にアップロードします。

## 4. 公開 (Deploy)

1. **Git Push**
   - 変更をリポジトリに反映します。
   ```bash
   git add .
   git commit -m "Add new song: [曲名]"
   git push
   ```

2. **サイト確認**
   - 数分後、公式サイトで楽曲が表示・再生されるか確認します。
