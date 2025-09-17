#!/bin/bash

echo "🚀 Deploying Certificate Registry - Local Network"
echo "================================================="

# Check if Hardhat node is running
echo "🔍 Checking if Hardhat node is running..."
if curl -s http://127.0.0.1:8545 > /dev/null; then
    echo "✅ Hardhat node is running"
else
    echo "❌ Hardhat node is not running"
    echo ""
    echo "Please start the Hardhat node first:"
    echo "  npm run node"
    echo ""
    echo "Or run the full local setup:"
    echo "  ./run-local.sh"
    exit 1
fi

echo ""
echo "📦 Deploying smart contract..."
npm run deploy:local

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "Next steps:"
    echo "1. Start metadata server: npm run metadata-server"
    echo "2. Start UI: cd ui && npm run dev"
    echo "3. Open http://localhost:5173 in your browser"
    echo ""
    echo "Or run everything at once: ./run-local.sh"
else
    echo "❌ Deployment failed"
    exit 1
fi
