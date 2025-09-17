# Installation Guide

## Prerequisites

Before running the Certificate Registry DApp, you need to install the following prerequisites:

### 1. Install Node.js and npm

#### Ubuntu/Debian:
```bash
# Update package list
sudo apt update

# Install Node.js and npm
sudo apt install nodejs npm

# Verify installation
node --version
npm --version
```

#### Using Node Version Manager (nvm) - Recommended:
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload your shell
source ~/.bashrc

# Install latest LTS Node.js
nvm install --lts
nvm use --lts

# Verify installation
node --version
npm --version
```

#### macOS:
```bash
# Using Homebrew
brew install node

# Or download from https://nodejs.org/
```

#### Windows:
1. Download Node.js from https://nodejs.org/
2. Run the installer
3. Verify installation in Command Prompt:
   ```cmd
   node --version
   npm --version
   ```

### 2. Install MetaMask

1. Go to https://metamask.io/
2. Install the browser extension
3. Create a new wallet or import existing one
4. Add Polygon Amoy testnet:
   - Network Name: Polygon Amoy Testnet
   - RPC URL: https://rpc-amoy.polygon.technology
   - Chain ID: 80002
   - Currency Symbol: MATIC
   - Block Explorer: https://amoy.polygonscan.com

### 3. Get Test MATIC

For Polygon Amoy testnet, get test MATIC from:
- [Polygon Faucet](https://faucet.polygon.technology/)
- [Alchemy Faucet](https://mumbaifaucet.com/)

## Installation Steps

### 1. Install Dependencies

```bash
# Install smart contract dependencies
npm install

# Install UI dependencies
cd ui
npm install
cd ..
```

### 2. Configure Environment

Create `.env` file in the root directory:
```bash
# Copy template
cp .env_local .env

# Edit with your values
nano .env
```

Required variables:
```bash
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=your-metamask-private-key
POLYGONSCAN_API_KEY=your-polygonscan-api-key
```

Create `.env.local` file in the `ui` directory:
```bash
cd ui
cp ../ui-config.env .env.local
```

### 3. Compile Contracts

```bash
npm run compile
```

### 4. Deploy Contracts

#### Local Development:
```bash
# Terminal 1: Start Hardhat node
npm run node

# Terminal 2: Deploy to local network
npm run deploy:local
```

#### Polygon Amoy Testnet:
```bash
npm run deploy:amoy
```

### 5. Start Services

#### Start Metadata Server:
```bash
# Terminal 1
npm run metadata-server
```

#### Start UI:
```bash
# Terminal 2
cd ui
npm run dev
```

## Troubleshooting

### Node.js Issues

If you get "node: command not found":
```bash
# Ubuntu/Debian
sudo apt install nodejs npm

# Or use nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
```

### npm Issues

If you get "npm: command not found":
```bash
# Ubuntu/Debian
sudo apt install npm

# Or reinstall Node.js with npm
sudo apt remove nodejs npm
sudo apt install nodejs npm
```

### Permission Issues

If you get permission errors:
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### Port Issues

If ports are already in use:
```bash
# Kill processes using ports 3000 and 5173
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:5173 | xargs kill -9
```

### MetaMask Issues

1. **Network not found**: Add Polygon Amoy manually
2. **Transaction failed**: Ensure you have enough MATIC for gas
3. **Connection failed**: Refresh the page and try again

## Quick Start Script

After installing prerequisites, you can use the quick start script:

```bash
# Make executable
chmod +x start.sh

# Run setup
./start.sh
```

## Verification

To verify everything is working:

1. **Node.js**: `node --version` (should show v16+)
2. **npm**: `npm --version` (should show v8+)
3. **Contracts**: `npm run compile` (should compile successfully)
4. **UI**: Open http://localhost:5173 (should show the app)
5. **API**: Open http://localhost:3000/api/health (should return status)

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Check the console for error messages
4. Ensure all environment variables are set correctly
5. Make sure ports 3000 and 5173 are available
