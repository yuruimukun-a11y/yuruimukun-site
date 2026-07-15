[CmdletBinding()]
param(
  [Parameter(Mandatory)]
  [ValidatePattern('^[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?$')]
  [string]$Slug,

  [Parameter(Mandatory)]
  [string]$Label,

  [Parameter(Mandatory)]
  [string]$WavPath,

  [Parameter(Mandatory)]
  [string]$ThumbnailPath,

  [Parameter(Mandatory)]
  [DateTimeOffset]$EndsAt,

  [DateTimeOffset]$StartsAt = [DateTimeOffset]::Now,

  [ValidateRange(0, 1)]
  [double]$Volume = 0.35,

  [string]$R2EnvPath = 'E:\claude-desk\yuruimukun-site-work\.env.r2.local',

  [string]$GitHubUser = 'yuruimukun-a11y',

  [switch]$SkipPush
)

$ErrorActionPreference = 'Stop'

function Invoke-Git {
  param([string]$Repository, [string[]]$Arguments)
  & git -C $Repository @Arguments
  if ($LASTEXITCODE -ne 0) { throw "git $($Arguments -join ' ') failed" }
}

function Get-EnvFileValues {
  param([string]$Path)
  $values = @{}
  Get-Content -LiteralPath $Path -Encoding UTF8 | ForEach-Object {
    if ($_ -match '^\s*([A-Za-z0-9_]+)=(.*)$') {
      $values[$matches[1]] = $matches[2].Trim().Trim('"').Trim("'")
    }
  }
  return $values
}

foreach ($command in @('ffmpeg', 'curl.exe', 'git')) {
  if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
    throw "Required command was not found: $command"
  }
}

$wav = (Resolve-Path -LiteralPath $WavPath).Path
$thumbnail = (Resolve-Path -LiteralPath $ThumbnailPath).Path
$r2Env = (Resolve-Path -LiteralPath $R2EnvPath).Path
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

if ($EndsAt -le $StartsAt) { throw 'EndsAt must be later than StartsAt.' }

$r2 = Get-EnvFileValues $r2Env
foreach ($key in @('R2_BUCKET', 'R2_ENDPOINT', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_PUBLIC_BASE_URL')) {
  if (-not $r2[$key]) { throw "Missing $key in $r2Env" }
}

$campaignId = "$Slug-$($EndsAt.ToString('yyyy-MM-dd'))"
$thumbnailExtension = [IO.Path]::GetExtension($thumbnail).ToLowerInvariant()
if ($thumbnailExtension -notin @('.png', '.jpg', '.jpeg', '.webp')) {
  throw 'ThumbnailPath must be a PNG, JPG, JPEG, or WebP image.'
}

$worktree = Join-Path ([IO.Path]::GetTempPath()) "yuruimukun-limited-$campaignId-$PID"
$mp3Path = Join-Path ([IO.Path]::GetTempPath()) "yuruimukun-$campaignId-$PID.mp3"
$worktreeCreated = $false

try {
  Invoke-Git $repoRoot @('-c', 'http.sslBackend=schannel', 'fetch', 'origin', 'main')
  Invoke-Git $repoRoot @('worktree', 'add', '--detach', $worktree, 'origin/main')
  $worktreeCreated = $true

  & ffmpeg -hide_banner -y -i $wav -c:a libmp3lame -b:a 256k -ar 48000 -ac 2 $mp3Path
  if ($LASTEXITCODE -ne 0) { throw 'MP3 conversion failed.' }

  $credentials = "$($r2.R2_ACCESS_KEY_ID):$($r2.R2_SECRET_ACCESS_KEY)"
  $r2ObjectKey = "campaigns/top-arrival/$campaignId/$Slug.mp3"
  $uploadUrl = "$($r2.R2_ENDPOINT.TrimEnd('/'))/$($r2.R2_BUCKET)/$r2ObjectKey"
  & curl.exe --fail-with-body --silent --show-error --ssl-revoke-best-effort --aws-sigv4 'aws:amz:auto:s3' --user $credentials --upload-file $mp3Path --header 'Content-Type: audio/mpeg' $uploadUrl
  if ($LASTEXITCODE -ne 0) { throw 'R2 upload failed.' }

  $targetImage = Join-Path $worktree "images\tracks\$Slug$thumbnailExtension"
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $targetImage) | Out-Null
  Copy-Item -LiteralPath $thumbnail -Destination $targetImage -Force

  $config = [ordered]@{
    enabled    = $true
    campaignId = $campaignId
    startsAt   = $StartsAt.ToString('yyyy-MM-ddTHH:mm:sszzz')
    endsAt     = $EndsAt.ToString('yyyy-MM-ddTHH:mm:sszzz')
    label      = $Label
    audioUrl   = "$($r2.R2_PUBLIC_BASE_URL.TrimEnd('/'))/$r2ObjectKey"
    imageUrl   = "https://yuruimukun.com/images/tracks/$Slug$thumbnailExtension"
    volume     = $Volume
  }
  $config | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $worktree 'config\top-arrival-bgm.json') -Encoding UTF8

  $profile = (& curl.exe --fail --silent --show-error --ssl-revoke-best-effort "https://api.github.com/users/$GitHubUser" | ConvertFrom-Json)
  if (-not $profile.id) { throw "Could not resolve GitHub user: $GitHubUser" }
  $gitEmail = "$($profile.id)+$GitHubUser@users.noreply.github.com"
  Invoke-Git $worktree @('config', 'user.name', $GitHubUser)
  Invoke-Git $worktree @('config', 'user.email', $gitEmail)
  Invoke-Git $worktree @('add', '--', 'config/top-arrival-bgm.json', "images/tracks/$Slug$thumbnailExtension")
  Invoke-Git $worktree @('diff', '--cached', '--check')
  Invoke-Git $worktree @('commit', '-m', "Activate limited-time $Slug arrival BGM")

  if ($SkipPush) {
    Write-Output 'Commit created locally. SkipPush was specified, so no remote changes were made.'
    return
  }

  Invoke-Git $worktree @('-c', 'http.sslBackend=schannel', 'push', 'origin', 'HEAD:main')

  $liveConfigUrl = 'https://yuruimukun.com/config/top-arrival-bgm.json'
  for ($attempt = 1; $attempt -le 18; $attempt++) {
    Start-Sleep -Seconds 10
    try {
      $liveConfig = (& curl.exe --fail --silent --show-error --ssl-revoke-best-effort $liveConfigUrl | ConvertFrom-Json)
      if ($liveConfig.campaignId -eq $campaignId -and $liveConfig.audioUrl -eq $config.audioUrl) {
        Write-Output "Published: $liveConfigUrl"
        Write-Output "Available until: $($config.endsAt)"
        return
      }
    } catch {
      # Vercel deployment is still propagating. Keep polling.
    }
  }
  throw 'GitHub push succeeded, but the live Vercel config was not updated within 3 minutes.'
}
finally {
  if (Test-Path -LiteralPath $mp3Path) { Remove-Item -LiteralPath $mp3Path -Force }
  if ($worktreeCreated -and (Test-Path -LiteralPath $worktree)) {
    & git -C $repoRoot worktree remove --force $worktree
  }
}
