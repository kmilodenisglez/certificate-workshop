#!/bin/bash

echo "🔍 Certificate Registry DApp - System Check"
echo "=========================================="

# Check Node.js
echo "Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js found: $NODE_VERSION"
    
    # Check if version is 16 or higher
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 16 ]; then
        echo "✅ Node.js version is compatible (v16+)"
    else
        echo "⚠️  Node.js version is too old. Please upgrade to v16 or higher."
    fi
else
    echo "❌ Node.js not found. Please install Node.js first."
    echo "   See INSTALLATION.md for instructions."
fi

echo ""

# Check npm
echo "Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm found: $NPM_VERSION"
else
    echo "❌ npm not found. Please install npm first."
    echo "   See INSTALLATION.md for instructions."
fi

echo ""

# Check if we're in the right directory
echo "Checking project structure..."
if [ -f "package.json" ] && [ -f "hardhat.config.js" ] && [ -d "contracts" ] && [ -d "ui" ]; then
    echo "✅ Project structure looks correct"
else
    echo "❌ Project structure is incomplete. Make sure you're in the right directory."
fi

echo ""

# Check if dependencies are installed
echo "Checking dependencies..."
if [ -d "node_modules" ] && [ -f "node_modules/.package-lock.json" ]; then
    echo "✅ Smart contract dependencies appear to be installed"
else
    echo "⚠️  Smart contract dependencies not found. Run 'npm install' first."
fi

if [ -d "ui/node_modules" ]; then
    echo "✅ UI dependencies appear to be installed"
else
    echo "⚠️  UI dependencies not found. Run 'cd ui && npm install' first."
fi

echo ""

# Check environment files
echo "Checking environment configuration..."
if [ -f ".env" ]; then
    echo "✅ .env file found"
else
    echo "⚠️  .env file not found. Copy from .env_local and configure it."
fi

if [ -f "ui/.env.local" ]; then
    echo "✅ UI .env.local file found"
else
    echo "⚠️  UI .env.local file not found. Copy from ui-config.env and configure it."
fi

echo ""

# Check if ports are available
echo "Checking port availability..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 3000 is in use (metadata server port)"
else
    echo "✅ Port 3000 is available"
fi

if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 5173 is in use (UI development server port)"
else
    echo "✅ Port 5173 is available"
fi

echo ""

# Check MetaMask
echo "Checking MetaMask..."
if [ -f ~/.mozilla/firefox/*/extensions/metamask@metamask.io.xpi ] || [ -d ~/.config/google-chrome/Default/Extensions/nkbihfbeogaeaoehlefnkodbefgpgknn ]; then
    echo "✅ MetaMask appears to be installed"
else
    echo "⚠️  MetaMask not detected. Please install MetaMask browser extension."
fi

echo ""
echo "🎯 System Check Complete!"
echo ""
echo "Next steps:"
echo "1. If any ❌ errors, fix them first"
echo "2. If any ⚠️  warnings, address them as needed"
echo "3. Run './start.sh' to begin setup"
echo "4. Or follow the manual setup in README.md"
