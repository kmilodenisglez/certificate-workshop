#!/bin/bash

echo "🔧 Setting up TypeScript types for smart contracts"
echo "================================================="

# Install TypeChain dependencies
echo "📦 Installing TypeChain dependencies..."
/usr/bin/npm install @typechain/hardhat @typechain/ethers-v6 typechain

if [ $? -ne 0 ]; then
    echo "❌ Failed to install TypeChain dependencies"
    exit 1
fi

echo "✅ TypeChain dependencies installed"

# Compile contracts to generate TypeScript types
echo "📦 Compiling contracts and generating TypeScript types..."
/usr/bin/npm run compile

if [ $? -ne 0 ]; then
    echo "❌ Failed to compile contracts"
    exit 1
fi

echo "✅ Contracts compiled and TypeScript types generated"

# Check if typechain-types directory was created
if [ -d "typechain-types" ]; then
    echo "✅ TypeChain types directory created"
    echo "📁 Generated files:"
    ls -la typechain-types/
else
    echo "⚠️  TypeChain types directory not found"
    echo "   This might be normal if no contracts were compiled yet"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Deploy contracts: npm run deploy:local"
echo "2. Start services: ./run-local.sh"
echo ""
echo "The UI should now be able to import contract types correctly."
