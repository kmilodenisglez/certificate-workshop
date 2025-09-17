#!/bin/bash

echo "🔧 Installing dependencies for Certificate Registry DApp"

# Check if npm is available
if command -v npm &> /dev/null; then
    echo "✅ npm found, installing dependencies..."
    npm install
elif command -v yarn &> /dev/null; then
    echo "✅ yarn found, installing dependencies..."
    yarn install
else
    echo "❌ Neither npm nor yarn found. Please install Node.js and npm first."
    exit 1
fi

# Install UI dependencies
echo "📦 Installing UI dependencies..."
cd ui

if command -v npm &> /dev/null; then
    npm install
elif command -v yarn &> /dev/null; then
    yarn install
fi

cd ..

echo "✅ Dependencies installed successfully!"
echo ""
echo "Now you can:"
echo "1. Compile contracts: npm run compile"
echo "2. Deploy locally: npm run deploy:local"
echo "3. Start metadata server: npm run metadata-server"
echo "4. Start UI: cd ui && npm run dev"
