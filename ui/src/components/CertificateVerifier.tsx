import React, { useState } from 'react';
import { Input, Button, Card, Typography, Space, Alert, Tag, Descriptions, Upload } from 'antd';
import { SearchOutlined, FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { useBlockchain } from '../providers/BlockchainProvider';
import { VerificationResult } from '../services/BlockchainService';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CertificateVerifier: React.FC = () => {
  const { verifyCertificate, isLoading } = useBlockchain();
  const [searchValue, setSearchValue] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (!searchValue.trim()) return;

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const result = await verifyCertificate(searchValue.trim());
      setVerificationResult(result);
    } catch (error) {
      setVerificationResult({ valid: false, error: 'Verification failed' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFileUpload = (file: File) => {
    // Generate hash from file content
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        const arrayBuffer = e.target.result as ArrayBuffer;
        const hash = await generateFileHash(arrayBuffer);
        setSearchValue(hash);
      }
    };
    reader.readAsArrayBuffer(file);
    return false; // Prevent default upload
  };

  const generateFileHash = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return '0x' + hashHex;
  };

  return (
    <div className="space-y-6">
      <Card>
        <Title level={3}>Verify Certificate</Title>
        <Text type="secondary" className="block mb-4">
          Enter a certificate hash or upload a file to verify its authenticity on the blockchain
        </Text>

        <Space.Compact className="w-full mb-4">
          <Input
            placeholder="Enter certificate hash (0x...)"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onPressEnter={handleVerify}
            disabled={isVerifying}
            className="flex-1"
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            loading={isVerifying}
            onClick={handleVerify}
            disabled={!searchValue.trim()}
          >
            Verify
          </Button>
        </Space.Compact>

        <div className="mb-4">
          <Text type="secondary" className="block mb-2">Or upload a file to get its hash:</Text>
          <Upload
            accept=".pdf,.doc,.docx"
            beforeUpload={handleFileUpload}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>Upload File</Button>
          </Upload>
        </div>

        {verificationResult && (
          <div className="mt-4">
            {verificationResult.valid ? (
              <Alert
                message="Certificate Verified"
                description="This certificate is valid and registered on the blockchain"
                type="success"
                icon={<CheckCircleOutlined />}
                className="mb-4"
              />
            ) : (
              <Alert
                message="Certificate Not Found"
                description={verificationResult.error || "This certificate is not registered on the blockchain"}
                type="error"
                icon={<CloseCircleOutlined />}
                className="mb-4"
              />
            )}

            {verificationResult.valid && verificationResult.tokenId && (
              <Card size="small" className="bg-gray-50">
                <Title level={5}>Certificate Details</Title>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Token ID">
                    <Tag color="blue">{verificationResult.tokenId}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Certificate Hash">
                    <Text code className="text-xs break-all">{searchValue}</Text>
                  </Descriptions.Item>
                  {verificationResult.metadata && (
                    <>
                      <Descriptions.Item label="Name">
                        {verificationResult.metadata.name}
                      </Descriptions.Item>
                      <Descriptions.Item label="Description">
                        {verificationResult.metadata.description}
                      </Descriptions.Item>
                      <Descriptions.Item label="File Path">
                        <Text code>{verificationResult.metadata.file_path}</Text>
                      </Descriptions.Item>
                    </>
                  )}
                </Descriptions>
              </Card>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CertificateVerifier;
