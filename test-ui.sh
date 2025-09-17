#!/bin/bash

echo "🧪 Testing UI Setup"
echo "==================="

# Check if UI dependencies are installed
echo "📦 Checking UI dependencies..."
if [ -d "ui/node_modules" ]; then
    echo "✅ UI dependencies are installed"
else
    echo "❌ UI dependencies not found. Installing..."
    cd ui
    npm install
    cd ..
fi

# Check if contract is compiled
echo "📦 Checking contract compilation..."
if [ -f "artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json" ]; then
    echo "✅ Contract is compiled"
else
    echo "❌ Contract not compiled. Compiling..."
    npm run compile
fi

# Check if UI can start
echo "📦 Testing UI startup..."
cd ui
timeout 10s npm run dev > /dev/null 2>&1 &
UI_PID=$!
sleep 5

if kill -0 $UI_PID 2>/dev/null; then
    echo "✅ UI can start successfully"
    kill $UI_PID 2>/dev/null
else
    echo "❌ UI failed to start"
fi

cd ..

echo ""
echo "🎉 UI setup test complete!"
echo ""
echo "If all checks passed, you can now:"
echo "1. Start Hardhat node: npm run node"
echo "2. Deploy contract: npm run deploy:local"
echo "3. Start UI: cd ui && npm run dev"
echo "4. Or use the automated script: ./run-local.sh"
