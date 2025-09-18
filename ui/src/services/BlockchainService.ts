import { ethers } from 'ethers';

// Contract ABI - we'll define this manually for now
const CERTIFICATE_REGISTRY_ABI = [
  "function issueCertificate(address to, bytes32 certHash, string memory metadataURI) external returns (uint256)",
  "function verifyCertificate(bytes32 certHash) external view returns (bool valid, uint256 tokenId)",
  "function getCertificateHash(uint256 tokenId) external view returns (bytes32)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function totalCertificates() external view returns (uint256)",
  "function name() external view returns (string memory)",
  "function symbol() external view returns (string memory)",
  "function owner() external view returns (address)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "event CertificateIssued(uint256 indexed tokenId, bytes32 indexed certHash, address indexed to, string metadataURI)"
];

export interface CertificateMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  external_url: string;
  certificate_hash: string;
  file_path: string;
}

export interface VerificationResult {
  valid: boolean;
  tokenId?: number;
  metadata?: CertificateMetadata;
  transactionHash?: string;
  error?: string;
}

export interface CertificateInfo {
  tokenId: number;
  certificateHash: string;
  owner: string;
  metadataURI: string;
  isValid: boolean;
}

export class BlockchainService {
  private provider: ethers.Provider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: any = null;
  private contractAddress: string;

  constructor() {
    this.contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || '';
  }

  async connectWallet(): Promise<boolean> {
    try {
      if (typeof window.ethereum !== 'undefined') {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await (this.provider as ethers.BrowserProvider).getSigner();

        // Initialize contract
        if (this.contractAddress) {
          this.contract = new ethers.Contract(this.contractAddress, CERTIFICATE_REGISTRY_ABI, this.signer);
        }

        return true;
      } else {
        throw new Error('MetaMask not found. Please install MetaMask.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return false;
    }
  }

  async getNetworkInfo(): Promise<{ name: string; chainId: number } | null> {
    if (!this.provider) return null;

    try {
      const network = await this.provider.getNetwork();
      return {
        name: network.name,
        chainId: Number(network.chainId)
      };
    } catch (error) {
      console.error('Error getting network info:', error);
      return null;
    }
  }

  async switchToAmoyNetwork(): Promise<boolean> {
    try {
      if (typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x13882' }], // 80002 in hex
        });
        
        // Reinitialize contract after network switch
        if (this.contractAddress) {
          this.provider = new ethers.BrowserProvider(window.ethereum);
          this.signer = await (this.provider as ethers.BrowserProvider).getSigner();
          this.contract = new ethers.Contract(this.contractAddress, CERTIFICATE_REGISTRY_ABI, this.signer);
        }
        
        return true;
      }
      return false;
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added, add it
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x13882',
              chainName: 'Polygon Amoy Testnet',
              rpcUrls: ['https://rpc-amoy.polygon.technology'],
              nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18,
              },
              blockExplorerUrls: ['https://amoy.polygonscan.com'],
            }],
          });
          
          // Reinitialize contract after adding network
          if (this.contractAddress) {
            this.provider = new ethers.BrowserProvider(window.ethereum);
            this.signer = await (this.provider as ethers.BrowserProvider).getSigner();
            this.contract = new ethers.Contract(this.contractAddress, CERTIFICATE_REGISTRY_ABI, this.signer);
          }
          
          return true;
        } catch (addError) {
          console.error('Error adding Amoy network:', addError);
          return false;
        }
      }
      console.error('Error switching to Amoy network:', error);
      return false;
    }
  }

  async uploadCertificate(file: File): Promise<{ success: boolean; hash?: string; metadataURI?: string; Filename?: string; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('certificate', file);

      const response = await fetch('http://localhost:3000/api/upload-certificate', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          hash: result.certificateHash,
          metadataURI: result.metadataURI,
          Filename: result.filePath
        };
      } else {
        return {
          success: false,
          error: result.error || 'Upload failed'
        };
      }
    } catch (error) {
      console.error('Error uploading certificate:', error);
      return {
        success: false,
        error: 'Failed to upload certificate'
      };
    }
  }

  private async ensureContractInitialized(): Promise<void> {
    if (!this.contract || !this.signer) {
      // Try to reinitialize
      if (typeof window.ethereum !== 'undefined' && this.contractAddress) {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await (this.provider as ethers.BrowserProvider).getSigner();
        this.contract = new ethers.Contract(this.contractAddress, CERTIFICATE_REGISTRY_ABI, this.signer);
      } else {
        throw new Error('Contract not initialized or wallet not connected');
      }
    }
  }

  async issueCertificate(recipientAddress: string, certificateHash: string, metadataURI: string): Promise<{ success: boolean; tokenId?: number; transactionHash?: string; error?: string }> {
    try {
      await this.ensureContractInitialized();

      // Convert hex string to bytes32 format
      const hashWithPrefix = certificateHash.startsWith('0x') ? certificateHash : `0x${certificateHash}`;
      const hashBytes32 = ethers.getBytes(hashWithPrefix);
      const tx = await this.contract.issueCertificate(recipientAddress, hashBytes32, metadataURI);
      const receipt = await tx.wait();

      // Get the token ID from the event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed?.name === 'CertificateIssued';
        } catch {
          return false;
        }
      });

      let tokenId = 0;
      if (event) {
        const parsed = this.contract.interface.parseLog(event);
        tokenId = Number(parsed?.args.tokenId);
      }

      return {
        success: true,
        tokenId,
        transactionHash: receipt.hash
      };
    } catch (error: any) {
      console.error('Error issuing certificate:', error);
      
      // Handle specific error cases
      let errorMessage = 'Failed to issue certificate';
      
      if (error.reason) {
        // Handle revert reasons from smart contract
        switch (error.reason) {
          case 'Certificate already issued':
            errorMessage = 'This certificate has already been issued. Each certificate can only be issued once.';
            break;
          case 'Ownable: caller is not the owner':
            errorMessage = 'Only the contract owner can issue certificates.';
            break;
          default:
            errorMessage = `Smart contract error: ${error.reason}`;
        }
      } else if (error.message) {
        // Handle other errors
        if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for gas fees. Please add more ETH to your wallet.';
        } else if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction was cancelled by user.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async verifyCertificate(certificateHash: string): Promise<VerificationResult> {
    try {
      await this.ensureContractInitialized();

      // Convert hex string to bytes32 format
      const hashWithPrefix = certificateHash.startsWith('0x') ? certificateHash : `0x${certificateHash}`;
      const hashBytes32 = ethers.getBytes(hashWithPrefix);
      const [isValid, tokenId] = await this.contract.verifyCertificate(hashBytes32);

      if (isValid && tokenId > 0) {
        // Get metadata from local server
        const metadataResponse = await fetch(`http://localhost:3000/api/metadata/${tokenId}`);
        const metadata = await metadataResponse.json();

        return {
          valid: true,
          tokenId: Number(tokenId),
          metadata
        };
      } else {
        return {
          valid: false,
          error: 'Certificate not found on blockchain'
        };
      }
    } catch (error: any) {
      console.error('Error verifying certificate:', error);
      return {
        valid: false,
        error: error.message || 'Verification failed'
      };
    }
  }

  async getCertificateInfo(tokenId: number): Promise<CertificateInfo | null> {
    try {
      await this.ensureContractInitialized();

      const [owner, certificateHash, metadataURI] = await Promise.all([
        this.contract.ownerOf(tokenId),
        this.contract.getCertificateHash(tokenId),
        this.contract.tokenURI(tokenId)
      ]);

      const [isValid] = await this.contract.verifyCertificate(certificateHash);

      return {
        tokenId,
        certificateHash,
        owner,
        metadataURI,
        isValid
      };
    } catch (error) {
      console.error('Error getting certificate info:', error);
      return null;
    }
  }

  async getTotalCertificates(): Promise<number> {
    try {
      await this.ensureContractInitialized();

      return Number(await this.contract.totalCertificates());
    } catch (error) {
      console.error('Error getting total certificates:', error);
      return 0;
    }
  }

  async getContractInfo(): Promise<{ name: string; symbol: string; owner: string } | null> {
    try {
      await this.ensureContractInitialized();

      const [name, symbol, owner] = await Promise.all([
        this.contract.name(),
        this.contract.symbol(),
        this.contract.owner()
      ]);

      return { name, symbol, owner };
    } catch (error) {
      console.error('Error getting contract info:', error);
      return null;
    }
  }

  generateCertificateHash(fileBuffer: ArrayBuffer): string {
    // Simple hash generation - in production, use a more robust method
    const hash = ethers.keccak256(new Uint8Array(fileBuffer));
    return hash;
  }

  async signPDF(file: File, signature: string): Promise<File> {
    try {
      // Import pdf-lib dynamically to avoid build issues
      const { PDFDocument, rgb } = await import('pdf-lib');
      
      // Read the PDF file
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Get the first page
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();
      
      // Add signature text to the PDF
      firstPage.drawText(`Digitally signed by: ${signature}`, {
        x: 50,
        y: height - 100,
        size: 12,
        color: rgb(0, 0, 0),
      });
      
      // Add timestamp
      const timestamp = new Date().toISOString();
      firstPage.drawText(`Signed on: ${timestamp}`, {
        x: 50,
        y: height - 120,
        size: 10,
        color: rgb(0.5, 0.5, 0.5),
      });
      
      // Add a signature box
      firstPage.drawRectangle({
        x: 50,
        y: height - 150,
        width: 200,
        height: 30,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });
      
      firstPage.drawText('Digital Signature', {
        x: 60,
        y: height - 140,
        size: 10,
        color: rgb(0, 0, 0),
      });
      
      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      
      // Create a new File object with the signed PDF
      const signedFile = new File([pdfBytes], `signed_${file.name}`, {
        type: 'application/pdf',
        lastModified: Date.now(),
      });
      
      console.log('PDF signed successfully with signature:', signature);
      return signedFile;
    } catch (error) {
      console.error('Error signing PDF:', error);
      // Return original file if signing fails
      return file;
    }
  }
}

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}
