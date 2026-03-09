#!/bin/bash
cd "E:/ルーティン用 イムなど/イム/yuruimukun-site/music"

count=0
total=$(find . -type f ! -path "./.wrangler/*" ! -path "./node_modules/*" ! -path "./sample/*" | wc -l)

find . -type f ! -path "./.wrangler/*" ! -path "./node_modules/*" ! -path "./sample/*" | while read -r file; do
  key="${file#./}"
  count=$((count + 1))
  echo "[$count/$total] Uploading: $key"
  
  if [[ "$file" == *.m3u8 ]]; then
    wrangler r2 object put "yuruimukun-music/$key" --file "$file" --content-type "application/x-mpegURL" --remote 2>&1 | head -1
  elif [[ "$file" == *.ts ]]; then
    wrangler r2 object put "yuruimukun-music/$key" --file "$file" --content-type "video/MP2T" --remote 2>&1 | head -1
  else
    wrangler r2 object put "yuruimukun-music/$key" --file "$file" --remote 2>&1 | head -1
  fi
done

echo "Upload complete!"
