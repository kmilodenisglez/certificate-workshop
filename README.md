# Certificate Registry DApp

A blockchain-based certificate registry system using ERC-721 tokens on Polygon Amoy testnet and local development networks. This DApp allows users to issue, sign, and verify certificates on the blockchain.

## Features

- **ERC-721 Certificate Tokens**: Each certificate is minted as a unique NFT
- **PDF Digital Signing**: Sign PDF documents with digital signatures
- **Blockchain Verification**: Verify certificate authenticity using transaction hashes
- **Local Metadata Storage**: Store certificate metadata locally (no IPFS required)
- **Polygon Amoy Support**: Deploy and interact with Polygon Amoy testnet
- **MetaMask Integration**: Connect and interact with MetaMask wallet

## Architecture

### Smart Contract
- **CertificateRegistry.sol**: ERC-721 contract for certificate management
- **Functions**:
  - `issueCertificate(address to, bytes32 certHash, string metadataURI)`: Mint a new certificate
  - `verifyCertificate(bytes32 certHash)`: Verify certificate by hash
  - `getCertificateHash(uint256 tokenId)`: Get hash by token ID
  - `tokenURI(uint256 tokenId)`: Get metadata URI

### Backend Services
- **Metadata Server**: Express.js server for local metadata storage
- **File Upload**: Handle certificate file uploads
- **Hash Generation**: Generate SHA-256 hashes for certificates

### Frontend
- **React + TypeScript**: Modern UI with Ant Design components
- **Ethers.js**: Blockchain interaction
- **PDF-lib**: PDF signing functionality
- **MetaMask Integration**: Wallet connection and transaction signing

## Setup Instructions

### 1. Prerequisites
- Node.js (v16 or higher)
- MetaMask browser extension
- Git

### 2. Install Dependencies

```bash
# Install smart contract dependencies
npm install

# Install UI dependencies
cd ui
npm install
cd ..
```

### 3. Environment Configuration

Create a `.env` file in the root directory:
```bash
# Polygon Amoy Testnet Configuration
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=your-private-key
POLYGONSCAN_API_KEY=your-polygonscan-api-key

# Local Development
LOCAL_RPC_URL=http://127.0.0.1:8545
```

Create a `.env.local` file in the `ui` directory:
```bash
# Contract Configuration
VITE_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# API Configuration
VITE_API_BASE_URL=http://localhost:3000

# UI Configuration
VITE_PRIMARY_COLOR=#0084B8
VITE_FONT_FAMILY=Montserrat, sans-serif
```

### 4. Deploy Smart Contract

#### Local Development
```bash
# Start local Hardhat node
npm run node

# In another terminal, deploy to local network
npm run deploy:local
```

#### Polygon Amoy Testnet
```bash
# Deploy to Amoy testnet
npm run deploy:amoy

# Verify contract on PolygonScan
npm run verify:amoy <CONTRACT_ADDRESS> "Certificate Registry" "CERT"
```

### 5. Start Services

#### Start Metadata Server
```bash
# Start the metadata server (Terminal 1)
npm run metadata-server
```

#### Start UI Development Server
```bash
# Start the UI (Terminal 2)
cd ui
npm run dev
```

## Usage Guide

### 1. Connect Wallet
1. Open the application in your browser
2. Click "Connect MetaMask"
3. Switch to Polygon Amoy testnet (or local network)
4. Confirm the connection

### 2. Sign PDF Documents
1. Go to "Sign PDF" tab
2. Upload a PDF file
3. Enter your digital signature
4. Click "Sign PDF"
5. Download the signed document

### 3. Upload and Issue Certificates
1. Go to "Upload Certificate" tab
2. Upload a certificate file (PDF, DOC, DOCX)
3. Click "Issue Certificate" to mint an ERC-721 token
4. Confirm the transaction in MetaMask

### 4. Verify Certificates
1. Go to "Verify Certificate" tab
2. Enter a certificate hash or upload a file
3. Click "Verify" to check blockchain authenticity
4. View certificate details and metadata

## API Endpoints

The metadata server provides the following endpoints:

- `POST /api/upload-certificate`: Upload certificate file
- `GET /api/metadata/:tokenId`: Get certificate metadata
- `GET /api/verify/:hash`: Verify certificate by hash
- `GET /api/certificates`: Get all certificates
- `GET /api/health`: Health check

## Network Configuration

### Polygon Amoy Testnet
- **Chain ID**: 80002
- **RPC URL**: https://rpc-amoy.polygon.technology
- **Explorer**: https://amoy.polygonscan.com
- **Currency**: MATIC

### Local Development
- **Chain ID**: 31337
- **RPC URL**: http://127.0.0.1:8545
- **Currency**: ETH

## Scripts

### Smart Contract Scripts
```bash
npm run compile          # Compile contracts
npm run test            # Run tests
npm run deploy:local    # Deploy to local network
npm run deploy:amoy     # Deploy to Amoy testnet
npm run interact:local  # Interact with local contract
npm run interact:amoy   # Interact with Amoy contract
```

### UI Scripts
```bash
cd ui
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build
```

## Troubleshooting

### Common Issues

1. **MetaMask Connection Failed**
   - Ensure MetaMask is installed and unlocked
   - Check if the correct network is selected
   - Try refreshing the page

2. **Contract Not Found**
   - Verify the contract address in environment variables
   - Ensure the contract is deployed on the correct network
   - Check if the contract address is correct

3. **Transaction Failed**
   - Ensure you have enough MATIC for gas fees
   - Check if you're on the correct network
   - Verify the contract is deployed and accessible

4. **File Upload Issues**
   - Ensure the metadata server is running
   - Check file size limits (10MB max)
   - Verify file format is supported (PDF, DOC, DOCX)

### Getting Test MATIC

For Polygon Amoy testnet, get test MATIC from:
- [Polygon Faucet](https://faucet.polygon.technology/)
- [Alchemy Faucet](https://mumbaifaucet.com/)

## Development

### Project Structure
```
cert-workshop_dapp/
├── contracts/           # Smart contracts
├── scripts/            # Deployment and interaction scripts
├── test/              # Contract tests
├── ui/                # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── providers/     # Context providers
│   │   ├── services/      # API services
│   │   └── ...
│   └── ...
└── certificates/      # Local certificate storage
```

### Adding New Features

1. **Smart Contract**: Add functions to `CertificateRegistry.sol`
2. **Backend**: Extend the metadata server in `scripts/metadata-server.js`
3. **Frontend**: Create new components in `ui/src/components/`
4. **Integration**: Update services and providers as needed

## License

This project is licensed under the ISC License.