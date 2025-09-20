import React from 'react';
import { Button, Card, Space, Typography, Tag, Alert } from 'antd';
import { WalletOutlined, LinkOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useBlockchain } from '../providers/BlockchainProvider';

const { Title, Text } = Typography;

const WalletConnection: React.FC = () => {
  const {
    isConnected,
    account,
    network,
    connectWallet,
    switchToAmoyNetwork,
    switchToLocalhostNetwork,
    isLoading,
    error,
    contractInfo,
    totalCertificates
  } = useBlockchain();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkColor = (chainId: number) => {
    switch (chainId) {
      case 80002:
        return 'purple';
      case 31337:
        return 'blue';
      default:
        return 'default';
    }
  };

  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 80002:
        return 'Polygon Amoy';
      case 31337:
        return 'Local Network';
      default:
        return 'Unknown';
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <div className="text-center">
          <WalletOutlined className="text-4xl text-blue-500 mb-4" />
          <Title level={3}>Connect Your Wallet</Title>
          <Text type="secondary" className="block mb-6">
            Connect your MetaMask wallet to interact with the Certificate Registry
          </Text>
          
          {error && (
            <Alert
              message="Connection Error"
              description={error}
              type="error"
              className="mb-4"
            />
          )}
          
          <Button
            type="primary"
            size="large"
            icon={<WalletOutlined />}
            loading={isLoading}
            onClick={connectWallet}
            className="w-full"
          >
            Connect MetaMask
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Title level={3} className="mb-0">Wallet Connected</Title>
          <Tag color="green" icon={<WalletOutlined />}>
            Connected
          </Tag>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Text strong>Account:</Text>
            <div className="mt-1">
              <Text code>{formatAddress(account || '')}</Text>
            </div>
          </div>

          <div>
            <Text strong>Network:</Text>
            <div className="mt-1">
              <Tag color={getNetworkColor(network?.chainId || 0)}>
                {getNetworkName(network?.chainId || 0)}
              </Tag>
            </div>
            {/* Selector de red */}
            <Space className="mt-2">
              <Button
                type="default"
                size="small"
                onClick={switchToLocalhostNetwork}
                disabled={network?.chainId === 31337}
                loading={isLoading}
              >
                Localhost
              </Button>
              <Button
                type="default"
                size="small"
                onClick={switchToAmoyNetwork}
                disabled={network?.chainId === 80002}
                loading={isLoading}
              >
                Amoy
              </Button>
            </Space>
          </div>
        </div>

        {network?.chainId !== 80002 && network?.chainId !== 31337 && (
          <Alert
            message="Wrong Network"
            description="Please switch to Polygon Amoy testnet or local network"
            type="warning"
            action={
              <Button
                size="small"
                icon={<LinkOutlined />}
                onClick={switchToAmoyNetwork}
                loading={isLoading}
              >
                Switch to Amoy
              </Button>
            }
          />
        )}

        {contractInfo && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <InfoCircleOutlined className="mr-2" />
              <Text strong>Contract Information</Text>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <Text type="secondary">Name:</Text>
                <div><Text strong>{contractInfo.name}</Text></div>
              </div>
              <div>
                <Text type="secondary">Symbol:</Text>
                <div><Text strong>{contractInfo.symbol}</Text></div>
              </div>
              <div>
                <Text type="secondary">Total Certificates:</Text>
                <div><Text strong>{totalCertificates}</Text></div>
              </div>
              <div>
                <Text type="secondary">Owner:</Text>
                <div><Text code className="text-xs">{formatAddress(contractInfo.owner)}</Text></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default WalletConnection;
