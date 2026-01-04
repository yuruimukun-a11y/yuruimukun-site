@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   HLS Converter
echo ========================================
echo.

set "SCRIPT_DIR=%~dp0"
set "INPUT_DIR=%SCRIPT_DIR%wav_input"
set "OUTPUT_DIR=%SCRIPT_DIR%music"
set "PLAYLIST_FILE=%SCRIPT_DIR%playlist_data.js"
set "PLAYER_FILE=%SCRIPT_DIR%js\player.js"
set "TEMP_FILE=%SCRIPT_DIR%player_temp.js"

if not exist "%INPUT_DIR%" (
    echo [ERROR] wav_input folder not found
    mkdir "%INPUT_DIR%"
    echo Created wav_input folder.
    pause
    exit /b 1
)

set "COUNT=0"
for /r "%INPUT_DIR%" %%f in (*.wav) do set /a COUNT+=1

if %COUNT%==0 (
    echo [WARNING] No WAV files found
    pause
    exit /b 1
)

echo Found %COUNT% WAV file(s)
echo.

where ffmpeg >nul 2>&1
if errorlevel 1 (
    echo [ERROR] ffmpeg not found
    pause
    exit /b 1
)

if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

echo const PLAYLIST = [> "%PLAYLIST_FILE%"

set "SUCCESS=0"
set "INDEX=0"

for /r "%INPUT_DIR%" %%f in (*.wav) do (
    set /a INDEX+=1
    set "FILENAME=%%~nf"
    set "PARENTDIR=%%~dpf"
    
    for %%d in ("!PARENTDIR:~0,-1!") do set "GENRE=%%~nxd"
    
    if "!GENRE!"=="wav_input" (
        set "GENRE=other"
    )
    
    set "OUTDIR=%OUTPUT_DIR%\!FILENAME!"
    
    echo [!INDEX!/%COUNT%] !FILENAME! [!GENRE!]
    
    if not exist "!OUTDIR!" mkdir "!OUTDIR!"
    
    ffmpeg -i "%%f" -c:a aac -b:a 256k -ar 48000 -ac 2 -f hls -hls_time 10 -hls_list_size 0 -hls_segment_filename "!OUTDIR!\segment_%%03d.ts" -hls_playlist_type vod "!OUTDIR!\playlist.m3u8" -y -loglevel error
    
    if errorlevel 1 (
        echo     - FAILED
    ) else (
        echo     - OK
        set /a SUCCESS+=1
        echo   {>> "%PLAYLIST_FILE%"
        echo     id: '!FILENAME!',>> "%PLAYLIST_FILE%"
        echo     title: '!FILENAME!',>> "%PLAYLIST_FILE%"
        echo     artist: 'yuruimukun',>> "%PLAYLIST_FILE%"
        echo     genre: '!GENRE!',>> "%PLAYLIST_FILE%"
        echo     src: '/music/!FILENAME!/playlist.m3u8',>> "%PLAYLIST_FILE%"
        echo   },>> "%PLAYLIST_FILE%"
    )
)

echo ];>> "%PLAYLIST_FILE%"

echo.
echo ========================================
echo   Done: %SUCCESS% / %COUNT%
echo ========================================
echo.

echo Updating js/player.js ...

if not exist "%PLAYER_FILE%" (
    echo [ERROR] js/player.js not found
    pause
    exit /b 1
)

powershell -Command "$content = Get-Content '%PLAYER_FILE%' -Raw -Encoding UTF8; $playlist = Get-Content '%PLAYLIST_FILE%' -Raw -Encoding UTF8; $pattern = '(?s)const PLAYLIST = \[.*?\];'; $newContent = $content -replace $pattern, $playlist.Trim(); Set-Content '%PLAYER_FILE%' -Value $newContent -Encoding UTF8 -NoNewline"

if errorlevel 1 (
    echo [ERROR] Failed to update player.js
) else (
    echo [OK] js/player.js updated
)

echo.
echo Backup saved: playlist_data.js
echo.

pause
