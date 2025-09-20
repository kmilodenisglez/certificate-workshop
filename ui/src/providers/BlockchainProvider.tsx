import React, { createContext, useContext, useEffect, useState } from 'react';
import { BlockchainService, VerificationResult, CertificateInfo } from '../services/BlockchainService';
import { message } from 'antd';

export interface BlockchainState {
  // Connection
  isConnected: boolean;
  account: string | null;
  network: { name: string; chainId: number } | null;
  
  // Services
  blockchainService: BlockchainService;
  
  // Actions
  connectWallet: () => Promise<boolean>;
  switchToAmoyNetwork: () => Promise<boolean>;
  switchToLocalhostNetwork: () => Promise<boolean>;
  uploadCertificate: (file: File) => Promise<{ success: boolean; hash?: string; metadataURI?: string; error?: string }>;
  issueCertificate: (recipientAddress: string, certificateHash: string, metadataURI: string) => Promise<{ success: boolean; tokenId?: number; transactionHash?: string; error?: string }>;
  verifyCertificate: (certificateHash: string) => Promise<VerificationResult>;
  getCertificateInfo: (tokenId: number) => Promise<CertificateInfo | null>;
  signPDF: (file: File, signature: string) => Promise<File>;
  
  // State
  isLoading: boolean;
  error: string | null;
  totalCertificates: number;
  contractInfo: { name: string; symbol: string; owner: string } | null;
}

const BlockchainContext = createContext<BlockchainState | undefined>(undefined);

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};

interface BlockchainProviderProps {
  children: React.ReactNode;
}

export const BlockchainProvider: React.FC<BlockchainProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [network, setNetwork] = useState<{ name: string; chainId: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCertificates, setTotalCertificates] = useState(0);
  const [contractInfo, setContractInfo] = useState<{ name: string; symbol: string; owner: string } | null>(null);

  const blockchainService = new BlockchainService();

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            await connectWallet();
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setIsConnected(false);
          setAccount(null);
        } else {
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const connectWallet = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await blockchainService.connectWallet();
      
      if (success) {
        setIsConnected(true);
        
        // Get account
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }

        // Get network info
        const networkInfo = await blockchainService.getNetworkInfo();
        setNetwork(networkInfo);

        // Get contract info
        const contract = await blockchainService.getContractInfo();
        setContractInfo(contract);

        // Get total certificates
        const total = await blockchainService.getTotalCertificates();
        setTotalCertificates(total);

        message.success('Wallet connected successfully!');
        return true;
      } else {
        setError('Failed to connect wallet');
        message.error('Failed to connect wallet');
        return false;
      }
    } catch (error: any) {
      setError(error.message);
      message.error(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const switchToAmoyNetwork = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await blockchainService.switchToAmoyNetwork();
      
      if (success) {
        // Update network info
        const networkInfo = await blockchainService.getNetworkInfo();
        setNetwork(networkInfo);
        
        message.success('Switched to Polygon Amoy network!');
        return true;
      } else {
        setError('Failed to switch network');
        message.error('Failed to switch network');
        return false;
      }
    } catch (error: any) {
      setError(error.message);
      message.error(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const switchToLocalhostNetwork = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const success = await blockchainService.switchToLocalhostNetwork();
      if (success) {
        const networkInfo = await blockchainService.getNetworkInfo();
        setNetwork(networkInfo);
        message.success('Switched to Localhost network!');
      } else {
        setError('Failed to switch network');
        message.error('Failed to switch network');
      }
      return success;
    } finally {
      setIsLoading(false);
    }
};


  const uploadCertificate = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await blockchainService.uploadCertificate(file);
      
      if (result.success) {
        message.success('Certificate uploaded successfully!');
      } else {
        setError(result.error || 'Upload failed');
        message.error(result.error || 'Upload failed');
      }
      
      return result;
    } catch (error: any) {
      setError(error.message);
      message.error(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const issueCertificate = async (recipientAddress: string, certificateHash: string, metadataURI: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await blockchainService.issueCertificate(recipientAddress, certificateHash, metadataURI);
      
      if (result.success) {
        message.success(`Certificate issued successfully! Token ID: ${result.tokenId}`);
        
        // Update total certificates
        const total = await blockchainService.getTotalCertificates();
        setTotalCertificates(total);
      } else {
        setError(result.error || 'Failed to issue certificate');
        message.error(result.error || 'Failed to issue certificate');
      }
      
      return result;
    } catch (error: any) {
      setError(error.message);
      message.error(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCertificate = async (certificateHash: string): Promise<VerificationResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await blockchainService.verifyCertificate(certificateHash);
      
      if (result.valid) {
        message.success('Certificate verified successfully!');
      } else {
        message.warning('Certificate not found or invalid');
      }
      
      return result;
    } catch (error: any) {
      setError(error.message);
      message.error(error.message);
      return { valid: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const getCertificateInfo = async (tokenId: number): Promise<CertificateInfo | null> => {
    try {
      return await blockchainService.getCertificateInfo(tokenId);
    } catch (error: any) {
      setError(error.message);
      return null;
    }
  };

  const signPDF = async (file: File, signature: string): Promise<File> => {
    try {
      return await blockchainService.signPDF(file, signature);
    } catch (error: any) {
      setError(error.message);
      message.error(error.message);
      return file;
    }
  };

  const value: BlockchainState = {
    // Connection
    isConnected,
    account,
    network,
    
    // Services
    blockchainService,
    
    // Actions
    connectWallet,
    switchToAmoyNetwork,
    switchToLocalhostNetwork,
    uploadCertificate,
    issueCertificate,
    verifyCertificate,
    getCertificateInfo,
    signPDF,
    
    // State
    isLoading,
    error,
    totalCertificates,
    contractInfo,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};
