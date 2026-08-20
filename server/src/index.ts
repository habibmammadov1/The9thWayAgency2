import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
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

// Ensure uploads dir exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|svg\+xml|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Yalnızca JPG, PNG, WEBP və SVG formatlı şəkillərə icazə verilir!'));
  }
});

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
app.use('/uploads', express.static(uploadsDir));
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

// Helper function to handle single file upload with middleware error handling
const handleSingleUpload = (req: express.Request, res: express.Response, next: express.NextFunction) => {
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

app.post('/api/uploads', requireAuth, handleSingleUpload, (req, res) => {
  // TODO: migrate to cloud storage (S3/Cloudinary) before production launch
  if (!req.file) {
    return res.status(400).json({ error: 'Fayl yüklənməyib' });
  }
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Deprecated upload route fallback
app.post('/api/upload', requireAuth, handleSingleUpload, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Fayl yüklənməyib' });
  }
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

app.get('/health', async (req, res) => {
  try {
    // Test DB connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', db: 'disconnected', error: String(error) });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
