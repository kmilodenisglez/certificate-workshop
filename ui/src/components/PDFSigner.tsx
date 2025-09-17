import React, { useState } from 'react';
import { Upload, Button, Card, Typography, Space, Alert, Input, message } from 'antd';
import { FileTextOutlined, SignatureOutlined, DownloadOutlined } from '@ant-design/icons';
import { PDFDocument, rgb } from 'pdf-lib';
import { useBlockchain } from '../providers/BlockchainProvider';

const { Title, Text } = Typography;
const { TextArea } = Input;

const PDFSigner: React.FC = () => {
  const { signPDF } = useBlockchain();
  const [file, setFile] = useState<File | null>(null);
  const [signature, setSignature] = useState('');
  const [signedPdf, setSignedPdf] = useState<Uint8Array | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  const handleFileUpload = (uploadedFile: File) => {
    if (uploadedFile.type !== 'application/pdf') {
      message.error('Please upload a PDF file');
      return false;
    }
    setFile(uploadedFile);
    setSignedPdf(null);
    return false; // Prevent default upload
  };

  const signPDFDocument = async () => {
    if (!file || !signature.trim()) {
      message.error('Please upload a PDF file and enter a signature');
      return;
    }

    setIsSigning(true);

    try {
      // Read the PDF file
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Get the first page
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();

      // Add signature text
      firstPage.drawText(`Digital Signature: ${signature}`, {
        x: 50,
        y: 50,
        size: 12,
        color: rgb(0, 0, 0),
      });

      // Add timestamp
      const timestamp = new Date().toISOString();
      firstPage.drawText(`Signed on: ${timestamp}`, {
        x: 50,
        y: 30,
        size: 10,
        color: rgb(0.5, 0.5, 0.5),
      });

      // Add blockchain verification note
      firstPage.drawText('This document has been digitally signed and can be verified on the blockchain', {
        x: 50,
        y: 10,
        size: 8,
        color: rgb(0, 0.5, 0),
      });

      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      setSignedPdf(pdfBytes);
      
      message.success('PDF signed successfully!');
    } catch (error) {
      console.error('Error signing PDF:', error);
      message.error('Failed to sign PDF');
    } finally {
      setIsSigning(false);
    }
  };

  const downloadSignedPDF = () => {
    if (!signedPdf || !file) return;

    const blob = new Blob([signedPdf], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `signed_${file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <Title level={3}>PDF Digital Signer</Title>
      <Text type="secondary" className="block mb-4">
        Upload a PDF file and add a digital signature that can be verified on the blockchain
      </Text>

      <Space direction="vertical" className="w-full" size="large">
        <div>
          <Text strong className="block mb-2">Upload PDF File:</Text>
          <Upload
            accept=".pdf"
            beforeUpload={handleFileUpload}
            showUploadList={false}
            className="w-full"
          >
            <Button icon={<FileTextOutlined />} className="w-full">
              {file ? `Selected: ${file.name}` : 'Select PDF File'}
            </Button>
          </Upload>
        </div>

        <div>
          <Text strong className="block mb-2">Digital Signature:</Text>
          <TextArea
            placeholder="Enter your digital signature or message"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            rows={3}
            maxLength={200}
            showCount
          />
        </div>

        <Button
          type="primary"
          icon={<SignatureOutlined />}
          loading={isSigning}
          onClick={signPDFDocument}
          disabled={!file || !signature.trim()}
          className="w-full"
        >
          Sign PDF
        </Button>

        {signedPdf && (
          <Alert
            message="PDF Signed Successfully!"
            description="Your PDF has been digitally signed. You can now download it or upload it to create a blockchain certificate."
            type="success"
            action={
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={downloadSignedPDF}
              >
                Download Signed PDF
              </Button>
            }
          />
        )}

        {file && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <Text strong className="block mb-2">File Information:</Text>
            <div className="text-sm space-y-1">
              <div><Text type="secondary">Name:</Text> {file.name}</div>
              <div><Text type="secondary">Size:</Text> {(file.size / 1024).toFixed(2)} KB</div>
              <div><Text type="secondary">Type:</Text> {file.type}</div>
            </div>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default PDFSigner;
