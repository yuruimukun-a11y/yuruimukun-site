#!/bin/bash
# ========================================
# WAV/音声ファイル → HLS 変換スクリプト
# ========================================
# 使用法: ./convert.sh <入力ファイル> <出力ディレクトリ>
# 例:    ./convert.sh sample.wav music/sample
#
# 対応形式: WAV, MP3, M4A, FLAC, AIFF, OGG
# 出力: HLSセグメント (.ts) + プレイリスト (.m3u8)
# ========================================

set -e

# 設定
BITRATE="256k"           # Spotify Premium相当
SAMPLE_RATE="48000"      # 48kHz
SEGMENT_TIME="10"        # セグメント長（秒）
AUDIO_CODEC="aac"        # AACコーデック

# 色付け出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ヘルプ表示
show_help() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  HLS 変換スクリプト${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    echo "使用法: $0 <入力ファイル> <出力ディレクトリ>"
    echo ""
    echo "例:"
    echo "  $0 sample.wav music/sample"
    echo "  $0 \"My Song.mp3\" music/mysong"
    echo ""
    echo "対応形式: WAV, MP3, M4A, FLAC, AIFF, OGG"
    echo ""
    echo "オプション:"
    echo "  -h, --help    このヘルプを表示"
    echo ""
    echo -e "${YELLOW}注意: ffmpegがインストールされている必要があります${NC}"
}

# 引数チェック
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    show_help
    exit 0
fi

if [ $# -lt 2 ]; then
    echo -e "${RED}エラー: 引数が不足しています${NC}"
    echo ""
    show_help
    exit 1
fi

INPUT_FILE="$1"
OUTPUT_DIR="$2"

# 入力ファイル存在確認
if [ ! -f "$INPUT_FILE" ]; then
    echo -e "${RED}エラー: 入力ファイルが見つかりません: $INPUT_FILE${NC}"
    exit 1
fi

# ffmpeg確認
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${RED}エラー: ffmpegがインストールされていません${NC}"
    echo "ffmpegをインストールしてください:"
    echo "  Windows: https://ffmpeg.org/download.html"
    echo "  Mac: brew install ffmpeg"
    echo "  Linux: sudo apt install ffmpeg"
    exit 1
fi

# 出力ディレクトリ作成
mkdir -p "$OUTPUT_DIR"

# ファイル名取得
BASENAME=$(basename "$INPUT_FILE")
FILENAME="${BASENAME%.*}"

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  HLS 変換開始${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "入力:      ${GREEN}$INPUT_FILE${NC}"
echo -e "出力:      ${GREEN}$OUTPUT_DIR/${NC}"
echo -e "ビットレート: ${YELLOW}$BITRATE${NC}"
echo -e "サンプルレート: ${YELLOW}${SAMPLE_RATE}Hz${NC}"
echo -e "セグメント長: ${YELLOW}${SEGMENT_TIME}秒${NC}"
echo ""

# 変換実行
echo -e "${YELLOW}変換中...${NC}"

ffmpeg -i "$INPUT_FILE" \
    -c:a "$AUDIO_CODEC" \
    -b:a "$BITRATE" \
    -ar "$SAMPLE_RATE" \
    -ac 2 \
    -f hls \
    -hls_time "$SEGMENT_TIME" \
    -hls_list_size 0 \
    -hls_segment_filename "$OUTPUT_DIR/segment_%03d.ts" \
    -hls_playlist_type vod \
    "$OUTPUT_DIR/playlist.m3u8" \
    -y \
    2>&1 | grep -E "^(Input|Output|Stream|Duration|size=|video:|audio:)" || true

# 完了確認
if [ -f "$OUTPUT_DIR/playlist.m3u8" ]; then
    SEGMENT_COUNT=$(ls -1 "$OUTPUT_DIR"/*.ts 2>/dev/null | wc -l)
    TOTAL_SIZE=$(du -sh "$OUTPUT_DIR" | cut -f1)

    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  変換完了!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "プレイリスト: ${GREEN}$OUTPUT_DIR/playlist.m3u8${NC}"
    echo -e "セグメント数: ${YELLOW}$SEGMENT_COUNT${NC}"
    echo -e "合計サイズ:   ${YELLOW}$TOTAL_SIZE${NC}"
    echo ""
else
    echo -e "${RED}エラー: 変換に失敗しました${NC}"
    exit 1
fi
