# Deployment Guide

This guide provides step-by-step instructions for deploying the Certificate Registry DApp.

## Prerequisites

1. **Node.js** (v16 or higher)
2. **MetaMask** browser extension
3. **Git** for version control
4. **Test MATIC** for Polygon Amoy testnet

## Step 1: Environment Setup

### 1.1 Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd cert-workshop_dapp

# Install smart contract dependencies
npm install

# Install UI dependencies
cd ui
npm install
cd ..
```

### 1.2 Configure Environment Variables

Create `.env` file in the root directory:
```bash
# Copy the example file
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

## Step 2: Smart Contract Deployment

### 2.1 Local Development Deployment

```bash
# Terminal 1: Start Hardhat node
npm run node

# Terminal 2: Deploy to local network
npm run deploy:local
```

Expected output:
```
Deploying contracts with the account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Account balance: 10000.0
Certificate Registry deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Network: hardhat Chain ID: 31337
```

### 2.2 Polygon Amoy Testnet Deployment

```bash
# Deploy to Amoy testnet
npm run deploy:amoy
```

Expected output:
```
Deploying contracts with the account: 0x...
Account balance: 0.5
Certificate Registry deployed to: 0x...
Network: amoy Chain ID: 80002
```

### 2.3 Verify Contract (Optional)

```bash
# Verify on PolygonScan
npm run verify:amoy <CONTRACT_ADDRESS> "Certificate Registry" "CERT"
```

## Step 3: Update Configuration

### 3.1 Update Contract Address

After deployment, update the contract address in `ui/.env.local`:
```bash
VITE_CONTRACT_ADDRESS=0x... # Your deployed contract address
```

### 3.2 Update Hardhat Scripts

Update the contract address in `scripts/interact.js`:
```javascript
const contractAddress = "0x..."; // Your deployed contract address
```

## Step 4: Start Services

### 4.1 Start Metadata Server

```bash
# Terminal 1: Start metadata server
npm run metadata-server
```

Expected output:
```
Metadata server running on http://localhost:3000
Upload endpoint: POST http://localhost:3000/api/upload-certificate
Metadata endpoint: GET http://localhost:3000/api/metadata/:tokenId
Verification endpoint: GET http://localhost:3000/api/verify/:hash
```

### 4.2 Start UI Development Server

```bash
# Terminal 2: Start UI
cd ui
npm run dev
```

Expected output:
```
  VITE v5.3.5  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Step 5: Test the Application

### 5.1 Connect Wallet

1. Open http://localhost:5173 in your browser
2. Click "Connect MetaMask"
3. Switch to the correct network:
   - **Local**: Hardhat Localhost (Chain ID: 31337)
   - **Testnet**: Polygon Amoy (Chain ID: 80002)

### 5.2 Test Certificate Flow

1. **Sign PDF**: Upload a PDF and add a digital signature
2. **Upload Certificate**: Upload a certificate file and issue it as an NFT
3. **Verify Certificate**: Verify a certificate using its hash

## Step 6: Production Deployment

### 6.1 Build UI for Production

```bash
cd ui
npm run build
```

### 6.2 Deploy UI

You can deploy the built UI to any static hosting service:
- **Vercel**: `vercel --prod`
- **Netlify**: Drag and drop the `dist` folder
- **GitHub Pages**: Use GitHub Actions

### 6.3 Update Environment Variables

For production, update the environment variables:
```bash
VITE_CONTRACT_ADDRESS=0x... # Production contract address
VITE_API_BASE_URL=https://your-api-domain.com
```

## Troubleshooting

### Common Deployment Issues

1. **"Insufficient funds" error**
   - Ensure you have enough MATIC for gas fees
   - Get test MATIC from [Polygon Faucet](https://faucet.polygon.technology/)

2. **"Contract already deployed" error**
   - Use a different private key
   - Or deploy to a different network

3. **"Network not found" error**
   - Add Polygon Amoy network to MetaMask manually
   - Or use the "Switch to Amoy" button in the UI

4. **"Contract not found" error**
   - Verify the contract address is correct
   - Ensure the contract is deployed on the correct network

### Network Configuration

#### Polygon Amoy Testnet
- **Network Name**: Polygon Amoy Testnet
- **RPC URL**: https://rpc-amoy.polygon.technology
- **Chain ID**: 80002
- **Currency Symbol**: MATIC
- **Block Explorer**: https://amoy.polygonscan.com

#### Hardhat Local Network
- **Network Name**: Hardhat Local
- **RPC URL**: http://127.0.0.1:8545
- **Chain ID**: 31337
- **Currency Symbol**: ETH

## Security Considerations

1. **Private Keys**: Never commit private keys to version control
2. **Environment Variables**: Use `.env` files and add them to `.gitignore`
3. **Contract Verification**: Always verify contracts on block explorers
4. **Access Control**: Ensure only authorized users can issue certificates

## Next Steps

1. **Customize UI**: Modify the UI components to match your brand
2. **Add Features**: Implement additional certificate management features
3. **Integration**: Integrate with existing systems
4. **Monitoring**: Set up monitoring and analytics
5. **Documentation**: Create user documentation and guides
