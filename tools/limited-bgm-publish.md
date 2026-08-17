# 期間限定BGM公開ツール

`publish-limited-bgm.ps1` は、トップ到着時に表示する期間限定BGMを公開するためのツールです。

以下を自動で行います。

1. WAVを自動再生用MP3へ変換
2. MP3をCloudflare R2へアップロード
3. サムネイルをサイトへ追加
4. `config/top-arrival-bgm.json` を指定期間に更新
5. GitHubの正しいnoreplyメールでコミット・push
6. Vercelの本番設定が更新されるまで確認

通常のトップBGM公開では、Vercel CLIは不要です。

## 実行例

PowerShellでサイトリポジトリを開き、次のように実行します。

```powershell
.\tools\publish-limited-bgm.ps1 `
  -Slug 'akan' `
  -Label 'akan（期間限定BGM）' `
  -WavPath 'E:\ルーティン用 イムなど\イム\yuruimukun-site\wav_input\kikan-gentei\akan.wav' `
  -ThumbnailPath 'C:\Users\pcganbarutarou\Downloads\thumbnail.png' `
  -EndsAt '2026-07-16T23:00:00+09:00'
```

開始時刻と音量を指定する場合は、以下を追加します。

```powershell
-StartsAt '2026-07-16T12:00:00+09:00' -Volume 0.35
```

## 前提

- `ffmpeg`、`git`、`curl.exe` が利用可能であること
- R2認証情報が `E:\claude-desk\yuruimukun-site-work\.env.r2.local` にあること
- `yuruimukun-a11y` のGitHubアカウントでpushできること

`-R2EnvPath` と `-GitHubUser` は必要に応じて指定できます。
