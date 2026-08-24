import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { BlobServiceClient } from '@azure/storage-blob';
import homeRoutes from './routes/home';
import clientLogosRoutes from './routes/clientLogos';
import servicesRoutes from './routes/services';
import testimonialsRoutes from './routes/testimonials';
import portfolioRoutes from './routes/portfolio';
import blogRoutes from './routes/blog';
import aboutRoutes from './routes/about';
import teamRoutes from './routes/team';
import contactRoutes from './routes/contact';
import translationsRoutes from './routes/translations';
import authRoutes from './routes/auth';
import adminUsersRoutes from './routes/adminUsers';
import { requireAuth } from './middleware/requireAuth';

// ---------------------------------------------------------------------------
// Storage configuration
// When AZURE_STORAGE_CONNECTION_STRING is set (production), files are uploaded
// directly to Azure Blob Storage. When it is absent (local dev), files fall
// back to local disk so the local workflow is unchanged.
// ---------------------------------------------------------------------------
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const AZURE_STORAGE_CONTAINER = process.env.AZURE_STORAGE_CONTAINER || 'uploads';

const isAzureStorageEnabled = Boolean(AZURE_STORAGE_CONNECTION_STRING);

// Local disk fallback (used when AZURE_STORAGE_CONNECTION_STRING is not set)
const uploadsDir = path.join(__dirname, '../../uploads');
if (!isAzureStorageEnabled && !fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// In Azure: use memory storage so the buffer can be streamed to Blob Storage.
// Locally: use disk storage as before.
const multerStorage = isAzureStorageEnabled
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, uploadsDir),
      filename: (_req, file, cb) =>
        cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`),
    });

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|svg\+xml|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Yalnızca JPG, PNG, WEBP və SVG formatlı şəkillərə icazə verilir!'));
  },
});

/**
 * Upload a file buffer to Azure Blob Storage and return the public blob URL.
 * The blob name includes a timestamp prefix to prevent collisions.
 */
async function uploadToAzureBlob(file: Express.Multer.File): Promise<string> {
  if (!AZURE_STORAGE_CONNECTION_STRING) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING is not configured');
  }
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER);

  const blobName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(file.buffer, {
    blobHTTPHeaders: { blobContentType: file.mimetype },
  });

  return blockBlobClient.url;
}

const app = express();
const port = process.env.PORT || 4000;
const prisma = new PrismaClient();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,   // required for httpOnly cookie cross-origin
}));
app.use(express.json());
app.use(cookieParser());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'The9thway Agency API',
      version: '1.0.0',
      description: 'API for The9thway Agency admin and public frontend',
    },
    servers: [
      {
        url: 'http://localhost:4000',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve local uploads directory (backward-compat for local dev and any existing local URLs)
if (!isAzureStorageEnabled) {
  app.use('/uploads', express.static(uploadsDir));
}

app.use('/api/auth', authRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/client-logos', clientLogosRoutes);
console.log('SERVICES ROUTES:', servicesRoutes);
app.use('/api/services/test', (req, res) => res.send('test ok'));
app.use('/api/services', servicesRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/translations', translationsRoutes);

// Helper: run multer middleware and catch errors uniformly
const handleSingleUpload = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  upload.single('file')(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Faylın ölçüsü çox böyükdür. Maksimum 5MB icazə verilir.' });
      }
      return res.status(400).json({ error: `Yükləmə xətası: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

/**
 * POST /api/uploads — upload a single image file.
 *
 * In production (Azure): streams the file buffer to Azure Blob Storage and
 * returns the public blob URL (https://<account>.blob.core.windows.net/uploads/<filename>).
 *
 * In local dev: saves the file to the local uploads/ directory and returns a
 * host-relative URL as before.
 */
app.post('/api/uploads', requireAuth, handleSingleUpload, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Fayl yüklənməyib' });
  }

  try {
    let fileUrl: string;

    if (isAzureStorageEnabled) {
      // Production: upload buffer to Azure Blob Storage
      fileUrl = await uploadToAzureBlob(req.file);
    } else {
      // Local dev: file was saved to disk by multer diskStorage
      fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    res.json({ url: fileUrl });
  } catch (err: any) {
    console.error('[Upload] Error uploading file:', err);
    res.status(500).json({ error: 'Fayl yüklənə bilmədi. Yenidən cəhd edin.' });
  }
});

/**
 * POST /api/upload — deprecated alias, kept for backward compatibility.
 */
app.post('/api/upload', requireAuth, handleSingleUpload, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Fayl yüklənməyib' });
  }

  try {
    let fileUrl: string;

    if (isAzureStorageEnabled) {
      fileUrl = await uploadToAzureBlob(req.file);
    } else {
      fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    res.json({ url: fileUrl });
  } catch (err: any) {
    console.error('[Upload] Error uploading file:', err);
    res.status(500).json({ error: 'Fayl yüklənə bilmədi. Yenidən cəhd edin.' });
  }
});

app.get('/health', async (req, res) => {
  try {
    // Test DB connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      db: 'connected',
      storage: isAzureStorageEnabled ? 'azure-blob' : 'local-disk',
    });
  } catch (error) {
    res.status(500).json({ status: 'error', db: 'disconnected', error: String(error) });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Storage backend: ${isAzureStorageEnabled ? 'Azure Blob Storage' : 'local disk'}`);
});
