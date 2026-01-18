# Option 1: Use the deploy script (recommended)
npm run deploy
git commit -m "Deploy"
git push origin main
npm run restore-dev  # Restores source index.html for dev

# Option 2: Manual deployment
npm run build
cp -r dist/* .
git add .
git commit -m "Deploy"
git push origin main
npm run restore-dev  # Restores source index.html for dev