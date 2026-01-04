#!/bin/bash
# ========================================
# 一括HLS変換スクリプト
# ========================================
# 使用法: ./batch_convert.sh <入力ディレクトリ> <出力ベースディレクトリ>
# 例:    ./batch_convert.sh ./raw_audio ./music
#
# 入力ディレクトリ内のすべての音声ファイルをHLSに変換
# ========================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONVERT_SCRIPT="$SCRIPT_DIR/convert.sh"

# 色付け出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 対応拡張子
EXTENSIONS=("wav" "mp3" "m4a" "flac" "aiff" "ogg")

# ヘルプ表示
show_help() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  一括HLS変換スクリプト${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    echo "使用法: $0 <入力ディレクトリ> <出力ベースディレクトリ>"
    echo ""
    echo "例:"
    echo "  $0 ./raw_audio ./music"
    echo ""
    echo "対応形式: WAV, MP3, M4A, FLAC, AIFF, OGG"
    echo ""
    echo "オプション:"
    echo "  -h, --help    このヘルプを表示"
    echo ""
    echo "動作:"
    echo "  入力ディレクトリ内の音声ファイルを検索し、"
    echo "  各ファイルをHLS形式に変換して出力ディレクトリに保存します。"
    echo ""
    echo "  例: ./raw_audio/song.wav → ./music/song/playlist.m3u8"
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

INPUT_DIR="$1"
OUTPUT_BASE="$2"

# 入力ディレクトリ確認
if [ ! -d "$INPUT_DIR" ]; then
    echo -e "${RED}エラー: 入力ディレクトリが見つかりません: $INPUT_DIR${NC}"
    exit 1
fi

# convert.sh確認
if [ ! -f "$CONVERT_SCRIPT" ]; then
    echo -e "${RED}エラー: convert.shが見つかりません: $CONVERT_SCRIPT${NC}"
    exit 1
fi

# 出力ディレクトリ作成
mkdir -p "$OUTPUT_BASE"

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  一括HLS変換${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "入力:    ${GREEN}$INPUT_DIR${NC}"
echo -e "出力:    ${GREEN}$OUTPUT_BASE${NC}"
echo ""

# 対象ファイル検索
PATTERN=""
for ext in "${EXTENSIONS[@]}"; do
    if [ -n "$PATTERN" ]; then
        PATTERN="$PATTERN -o"
    fi
    PATTERN="$PATTERN -iname *.$ext"
done

# ファイル一覧取得
FILES=()
while IFS= read -r -d '' file; do
    FILES+=("$file")
done < <(find "$INPUT_DIR" -type f \( $PATTERN \) -print0 2>/dev/null)

TOTAL=${#FILES[@]}

if [ $TOTAL -eq 0 ]; then
    echo -e "${YELLOW}変換対象のファイルが見つかりませんでした${NC}"
    exit 0
fi

echo -e "${CYAN}$TOTAL 個のファイルを変換します${NC}"
echo ""

# 変換実行
SUCCESS=0
FAILED=0

for i in "${!FILES[@]}"; do
    FILE="${FILES[$i]}"
    BASENAME=$(basename "$FILE")
    FILENAME="${BASENAME%.*}"
    # ファイル名をディレクトリ名に変換（スペースをアンダースコアに）
    SAFE_NAME=$(echo "$FILENAME" | tr ' ' '_' | tr -cd '[:alnum:]_-')
    OUTPUT_DIR="$OUTPUT_BASE/$SAFE_NAME"

    echo -e "${CYAN}[$((i+1))/$TOTAL]${NC} ${GREEN}$BASENAME${NC}"

    if bash "$CONVERT_SCRIPT" "$FILE" "$OUTPUT_DIR" > /dev/null 2>&1; then
        echo -e "    → ${GREEN}完了${NC}"
        ((SUCCESS++))
    else
        echo -e "    → ${RED}失敗${NC}"
        ((FAILED++))
    fi
done

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  変換完了${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "成功: ${GREEN}$SUCCESS${NC}"
echo -e "失敗: ${RED}$FAILED${NC}"
echo ""

# プレイリスト生成のヒント
if [ $SUCCESS -gt 0 ]; then
    echo -e "${YELLOW}ヒント:${NC}"
    echo "js/player.js の PLAYLIST 配列に曲を追加してください:"
    echo ""

    for dir in "$OUTPUT_BASE"/*/; do
        if [ -f "${dir}playlist.m3u8" ]; then
            DIRNAME=$(basename "$dir")
            echo "  {"
            echo "    id: '$DIRNAME',"
            echo "    title: '$DIRNAME',"
            echo "    artist: 'ゆるいむくん',"
            echo "    src: '/music/$DIRNAME/playlist.m3u8',"
            echo "    duration: 0"
            echo "  },"
        fi
    done
fi
