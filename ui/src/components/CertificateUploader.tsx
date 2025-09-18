import React, { useState, useCallback } from 'react';
import { Upload, Button, Card, Typography, Space, Alert, Progress, Tag } from 'antd';
import { InboxOutlined, FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useBlockchain } from '../providers/BlockchainProvider';
import type { UploadFile } from 'antd';

const { Title, Text } = Typography;
const { Dragger } = Upload;

interface UploadResult {
  success: boolean;
  hash?: string;
  metadataURI?: string;
  Filename?: string;
  error?: string;
}

const CertificateUploader: React.FC = () => {
  const { uploadCertificate, issueCertificate, account, isLoading } = useBlockchain();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [issueResult, setIssueResult] = useState<{ success: boolean; tokenId?: number; transactionHash?: string; error?: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);

  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadResult(null);
    setIssueResult(null);

    try {
      const result = await uploadCertificate(file);
      setUploadResult(result);
      return result;
    } catch (error) {
      const errorResult = { success: false, error: 'Upload failed' };
      setUploadResult(errorResult);
      return errorResult;
    } finally {
      setIsUploading(false);
    }
  }, [uploadCertificate]);

  const handleIssueCertificate = async () => {
    if (!uploadResult?.success || !uploadResult.hash || !uploadResult.metadataURI || !account) {
      return;
    }

    setIsIssuing(true);
    setIssueResult(null);

    try {
      const result = await issueCertificate(account, uploadResult.hash, uploadResult.metadataURI);
      setIssueResult(result);
    } catch (error) {
      setIssueResult({ success: false, error: 'Failed to issue certificate' });
    } finally {
      setIsIssuing(false);
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.pdf,.doc,.docx',
    fileList,
    beforeUpload: (file: File) => {
      const uploadFile: UploadFile = {
        uid: (file as any).uid || file.name,
        name: file.name,
        status: 'done',
        originFileObj: file as any,
        type: file.type,
        size: file.size,
      };
      setFileList([uploadFile]);
      handleUpload(file);
      return false; // Prevent auto upload
    },
    onRemove: () => {
      setFileList([]);
      setUploadResult(null);
      setIssueResult(null);
    },
  };

  return (
    <div className="space-y-6">
      <Card>
        <Title level={3}>Upload Certificate</Title>
        <Text type="secondary" className="block mb-4">
          Upload a certificate file (PDF, DOC, DOCX) to create a blockchain-verified certificate
        </Text>

        <Dragger {...uploadProps} className="mb-4">
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">
            Support for PDF, DOC, DOCX files. Maximum file size: 10MB
          </p>
        </Dragger>

        {isUploading && (
          <div className="mb-4">
            <Text>Uploading certificate...</Text>
            <Progress percent={100} status="active" />
          </div>
        )}

        {uploadResult && (
          <div className="mb-4">
            {uploadResult.success ? (
              <Alert
                message="Upload Successful"
                description={
                  <div>
                    <div>Certificate Hash: <Text code>{uploadResult.hash}</Text></div>
                    <div>Metadata URI: <Text code>{uploadResult.metadataURI}</Text></div>
                    <div>Filename: <Text code>{uploadResult.Filename}</Text></div>
                  </div>
                }
                type="success"
                icon={<CheckCircleOutlined />}
                action={
                  <Button
                    type="primary"
                    loading={isIssuing}
                    onClick={handleIssueCertificate}
                    disabled={!account}
                  >
                    Issue Certificate
                  </Button>
                }
              />
            ) : (
              <Alert
                message="Upload Failed"
                description={uploadResult.error}
                type="error"
              />
            )}
          </div>
        )}

        {issueResult && (
          <div className="mb-4">
            {issueResult.success ? (
              <Alert
                message="Certificate Issued Successfully!"
                description={
                  <div>
                    <div>Token ID: <Tag color="blue">{issueResult.tokenId}</Tag></div>
                    <div>Transaction Hash: <Text code>{issueResult.transactionHash}</Text></div>
                  </div>
                }
                type="success"
                icon={<CheckCircleOutlined />}
              />
            ) : (
              <Alert
                message="Certificate Issue Failed"
                description={
                  <div>
                    <div className="mb-2">{issueResult.error}</div>
                    {issueResult.error?.includes('already been issued') && (
                      <div className="text-sm text-gray-600">
                        💡 <strong>Tip:</strong> Try uploading a different file or check if this certificate was already issued.
                      </div>
                    )}
                    {issueResult.error?.includes('insufficient funds') && (
                      <div className="text-sm text-gray-600">
                        💡 <strong>Tip:</strong> Add more ETH to your wallet to cover gas fees.
                      </div>
                    )}
                    {issueResult.error?.includes('contract owner') && (
                      <div className="text-sm text-gray-600">
                        💡 <strong>Tip:</strong> Only the contract owner can issue certificates. Check your wallet connection.
                      </div>
                    )}
                  </div>
                }
                type="error"
                showIcon
              />
            )}
          </div>
        )}

        {!account && (
          <Alert
            message="Wallet Required"
            description="Please connect your wallet to issue certificates"
            type="warning"
          />
        )}
      </Card>
    </div>
  );
};

export default CertificateUploader;
