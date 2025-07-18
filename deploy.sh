#!/bin/bash

echo
echo "🚀 Starting deployment..."
echo

echo
echo "📦 Installing dependencies..."
echo
if pnpm install; then
  echo
  echo "✅ Dependencies installed"
  echo
else
  echo
  echo "❌ Failed to install dependencies"
  exit 1
fi

echo
echo "🔍 Checking for missing dependencies..."
echo

missing=$(pnpm exec node -e "
  const { dependencies = {}, devDependencies = {} } = require('./package.json');
  const allDeps = { ...dependencies, ...devDependencies };
  const missing = Object.keys(allDeps).filter(dep => {
    try {
      require.resolve(dep);
      return false;
    } catch {
      return true;
    }
  });
  console.log(missing.join(' '));
")

if [ -n "$missing" ]; then
  echo
  echo "❌ Missing dependencies: $missing"
  echo "📥 Installing them..."
  echo
  pnpm add $missing
else
  echo
  echo "✅ All dependencies are present"
  echo
fi

echo
echo "🛠️ Building project..."
echo
if pnpm build; then
  echo
  echo "✅ Build completed"
  echo
else
  echo
  echo "❌ Build failed"
  exit 1
fi

echo
echo "🔁 Restarting PM2..."
echo
if pm2 delete kiwicare-backend 2>/dev/null; then
  echo
  echo "ℹ️ Old PM2 process removed"
  echo
fi

if pm2 start dist/src/main.js --name kiwicare-backend; then
  echo
  echo "✅ PM2 process started"
  echo
else
  echo
  echo "❌ Failed to start PM2 process"
  exit 1
fi

echo
echo "🎉 Deployment finished successfully"
echo
