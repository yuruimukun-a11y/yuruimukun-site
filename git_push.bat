@echo off
cd /d "E:\ルーティン用 イムなど\イム\yuruimukun-site"
git add vercel.json
git commit -m "Fix: Remove www redirect causing 503 errors"
git push
