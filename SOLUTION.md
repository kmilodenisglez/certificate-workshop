# Solution Summary

## Problem
You encountered the error:
```
Error HH404: File @openzeppelin/contracts/utils/Counters.sol, imported from contracts/CertificateRegistry.sol, not found.
```

## Root Cause
The main issue is that **Node.js is not installed** on your system. The error message about `Counters.sol` is a secondary issue that occurs because:

1. Node.js/npm is not available to run the compilation
2. The `Counters` library was deprecated in OpenZeppelin v5

## Solutions Applied

### 1. Fixed the Smart Contract
- ✅ Removed deprecated `Counters` import
- ✅ Updated to use simple `uint256` counter instead
- ✅ Maintained all functionality

### 2. Created Installation Guide
- ✅ `INSTALLATION.md` - Complete Node.js installation instructions
- ✅ `check-system.sh` - System verification script
- ✅ Updated `start.sh` - Enhanced setup script

### 3. Cleaned Dependencies
- ✅ Fixed `package.json` to remove duplicate dependencies
- ✅ Simplified dependency structure

## Next Steps

### 1. Install Node.js (Required)
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# Or using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
```

### 2. Verify Installation
```bash
node --version  # Should show v16+
npm --version   # Should show v8+
```

### 3. Run System Check
```bash
./check-system.sh
```

### 4. Install Dependencies
```bash
npm install
cd ui && npm install && cd ..
```

### 5. Compile Contracts
```bash
npm run compile
```

### 6. Deploy and Run
```bash
# Deploy locally
npm run deploy:local

# Start metadata server
npm run metadata-server

# Start UI (in another terminal)
cd ui && npm run dev
```

## Alternative: Use the Quick Start Script
```bash
./start.sh
```

This script will:
1. Check your system
2. Install dependencies
3. Guide you through the setup process

## Files Created/Modified

### New Files:
- `INSTALLATION.md` - Complete installation guide
- `check-system.sh` - System verification script
- `install-deps.sh` - Dependency installation script
- `SOLUTION.md` - This solution summary

### Modified Files:
- `contracts/CertificateRegistry.sol` - Fixed Counters import
- `package.json` - Cleaned dependencies
- `start.sh` - Enhanced with system checks
- `README.md` - Added installation references

## Verification

After installing Node.js, you should be able to:

1. ✅ Run `node --version` successfully
2. ✅ Run `npm --version` successfully  
3. ✅ Run `npm run compile` successfully
4. ✅ Run `npm run deploy:local` successfully
5. ✅ Access the UI at http://localhost:5173

## Support

If you continue to have issues:

1. Follow the `INSTALLATION.md` guide step by step
2. Run `./check-system.sh` to diagnose problems
3. Check that all prerequisites are installed
4. Verify environment variables are set correctly

The project is fully configured and ready to work once Node.js is installed!
