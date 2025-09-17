import { ethers } from 'ethers';
import { CertificateRegistry__factory } from '../../contracts/CertificateRegistry__factory';

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
        this.signer = await this.provider.getSigner();
        
        // Initialize contract
        if (this.contractAddress) {
          this.contract = CertificateRegistry__factory.connect(this.contractAddress, this.signer);
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

  async uploadCertificate(file: File): Promise<{ success: boolean; hash?: string; metadataURI?: string; error?: string }> {
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
          metadataURI: result.metadataURI
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

  async issueCertificate(recipientAddress: string, certificateHash: string, metadataURI: string): Promise<{ success: boolean; tokenId?: number; transactionHash?: string; error?: string }> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Contract not initialized or wallet not connected');
      }

      const tx = await this.contract.issueCertificate(recipientAddress, certificateHash, metadataURI);
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
      return {
        success: false,
        error: error.message || 'Failed to issue certificate'
      };
    }
  }

  async verifyCertificate(certificateHash: string): Promise<VerificationResult> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const [isValid, tokenId] = await this.contract.verifyCertificate(certificateHash);
      
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
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

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
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      return Number(await this.contract.totalCertificates());
    } catch (error) {
      console.error('Error getting total certificates:', error);
      return 0;
    }
  }

  async getContractInfo(): Promise<{ name: string; symbol: string; owner: string } | null> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

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
    const hash = ethers.keccak256(ethers.getBytes(fileBuffer));
    return hash;
  }

  async signPDF(file: File, signature: string): Promise<File> {
    // This is a placeholder for PDF signing functionality
    // In a real implementation, you would use a PDF library to add a digital signature
    console.log('Signing PDF with signature:', signature);
    
    // For now, return the original file
    // TODO: Implement actual PDF signing with pdf-lib
    return file;
  }
}

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}
