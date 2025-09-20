import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import crypto from 'crypto';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
const PORT = 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'certificates');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'certificates')));

// Store metadata in memory (in production, use a database)
const metadataStore = new Map();

// Generate certificate hash
function generateCertificateHash(fileBuffer) {
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

// Upload certificate and create metadata
app.post('/api/upload-certificate', upload.single('certificate'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No certificate file uploaded' });
    }

    const fileBuffer = fs.readFileSync(req.file.path);
    const certificateHash = generateCertificateHash(fileBuffer);
    const tokenId = metadataStore.size + 1;

    // Create metadata
    const metadata = {
      name: `Certificate #${tokenId}`,
      description: `Blockchain-verified certificate with hash: ${certificateHash}`,
      image: `http://localhost:${PORT}/${req.file.filename}`,
      attributes: [
        {
          trait_type: "Certificate Hash",
          value: certificateHash
        },
        {
          trait_type: "File Name",
          value: req.file.originalname
        },
        {
          trait_type: "File Size",
          value: req.file.size
        },
        {
          trait_type: "Upload Date",
          value: new Date().toISOString()
        }
      ],
      external_url: `http://localhost:${PORT}/api/metadata/${tokenId}`,
      certificate_hash: certificateHash,
      file_path: req.file.filename
    };

    // Store metadata
    metadataStore.set(tokenId, metadata);

    res.json({
      success: true,
      tokenId: tokenId,
      certificateHash: certificateHash,
      metadataURI: `http://localhost:${PORT}/api/metadata/${tokenId}`,
      filePath: req.file.filename
    });

  } catch (error) {
    console.error('Error uploading certificate:', error);
    res.status(500).json({ error: 'Failed to upload certificate' });
  }
});

// Get metadata by token ID
app.get('/api/metadata/:tokenId', (req, res) => {
  const tokenId = parseInt(req.params.tokenId);
  const metadata = metadataStore.get(tokenId);

  if (!metadata) {
    return res.status(404).json({ error: 'Metadata not found' });
  }

  res.json(metadata);
});

// Get all certificates
app.get('/api/certificates', (req, res) => {
  const certificates = Array.from(metadataStore.entries()).map(([tokenId, metadata]) => ({
    tokenId,
    ...metadata
  }));

  res.json(certificates);
});

// Verify certificate by hash
app.get('/api/verify/:hash', (req, res) => {
  const hash = req.params.hash;
  
  for (const [tokenId, metadata] of metadataStore.entries()) {
    if (metadata.certificate_hash === hash) {
      return res.json({
        valid: true,
        tokenId: tokenId,
        metadata: metadata
      });
    }
  }

  res.json({
    valid: false,
    message: 'Certificate not found'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    certificatesCount: metadataStore.size
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Metadata server running on http://localhost:${PORT}`);
  console.log(`Upload endpoint: POST http://localhost:${PORT}/api/upload-certificate`);
  console.log(`Metadata endpoint: GET http://localhost:${PORT}/api/metadata/:tokenId`);
  console.log(`Verification endpoint: GET http://localhost:${PORT}/api/verify/:hash`);
});

export default app;
