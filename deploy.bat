@echo off
chcp 65001 >nul
echo ------------------------------------------
echo  1) بونیادنان و ئەپڵۆد بۆ Cloudflare Pages
echo ------------------------------------------
call node build-dist.js
call npx wrangler pages deploy dist --project-name=exchange-link --branch=main

echo ------------------------------------------
echo  2) بڵاوکردنەوە بۆ GitHub
echo ------------------------------------------
git add .
git diff --staged --quiet || git commit -m "Update site"
git pull --rebase origin main
git push origin main

echo ------------------------------------------
echo  هەمووی بە سەرکەوتوویی تەواو بوو!
echo ------------------------------------------
