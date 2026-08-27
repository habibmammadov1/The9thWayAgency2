"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const client_1 = require("@prisma/client");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const storage_blob_1 = require("@azure/storage-blob");
const home_1 = __importDefault(require("./routes/home"));
const clientLogos_1 = __importDefault(require("./routes/clientLogos"));
const services_1 = __importDefault(require("./routes/services"));
const testimonials_1 = __importDefault(require("./routes/testimonials"));
const portfolio_1 = __importDefault(require("./routes/portfolio"));
const blog_1 = __importDefault(require("./routes/blog"));
const about_1 = __importDefault(require("./routes/about"));
const team_1 = __importDefault(require("./routes/team"));
const contact_1 = __importDefault(require("./routes/contact"));
const translations_1 = __importDefault(require("./routes/translations"));
const auth_1 = __importDefault(require("./routes/auth"));
const adminUsers_1 = __importDefault(require("./routes/adminUsers"));
const requireAuth_1 = require("./middleware/requireAuth");
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
const uploadsDir = path_1.default.join(__dirname, '../../uploads');
if (!isAzureStorageEnabled && !fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// In Azure: use memory storage so the buffer can be streamed to Blob Storage.
// Locally: use disk storage as before.
const multerStorage = isAzureStorageEnabled
    ? multer_1.default.memoryStorage()
    : multer_1.default.diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadsDir),
        filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`),
    });
const upload = (0, multer_1.default)({
    storage: multerStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (_req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp|svg\+xml|svg/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
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
async function uploadToAzureBlob(file) {
    if (!AZURE_STORAGE_CONNECTION_STRING) {
        throw new Error('AZURE_STORAGE_CONNECTION_STRING is not configured');
    }
    const blobServiceClient = storage_blob_1.BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER);
    const blobName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: { blobContentType: file.mimetype },
    });
    return blockBlobClient.url;
}
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
const prisma = new client_1.PrismaClient();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use((0, cors_1.default)({
    origin: FRONTEND_URL,
    credentials: true, // required for httpOnly cookie cross-origin
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
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
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
// Serve local uploads directory (backward-compat for local dev and any existing local URLs)
if (!isAzureStorageEnabled) {
    app.use('/uploads', express_1.default.static(uploadsDir));
}
app.use('/api/auth', auth_1.default);
app.use('/api/admin/users', adminUsers_1.default);
app.use('/api/home', home_1.default);
app.use('/api/client-logos', clientLogos_1.default);
console.log('SERVICES ROUTES:', services_1.default);
app.use('/api/services/test', (req, res) => res.send('test ok'));
app.use('/api/services', services_1.default);
app.use('/api/testimonials', testimonials_1.default);
app.use('/api/portfolio', portfolio_1.default);
app.use('/api/blog', blog_1.default);
app.use('/api/about', about_1.default);
app.use('/api/team', team_1.default);
app.use('/api/contact', contact_1.default);
app.use('/api/translations', translations_1.default);
// Helper: run multer middleware and catch errors uniformly
const handleSingleUpload = (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err instanceof multer_1.default.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'Faylın ölçüsü çox böyükdür. Maksimum 5MB icazə verilir.' });
            }
            return res.status(400).json({ error: `Yükləmə xətası: ${err.message}` });
        }
        else if (err) {
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
app.post('/api/uploads', requireAuth_1.requireAuth, handleSingleUpload, async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Fayl yüklənməyib' });
    }
    try {
        let fileUrl;
        if (isAzureStorageEnabled) {
            // Production: upload buffer to Azure Blob Storage
            fileUrl = await uploadToAzureBlob(req.file);
        }
        else {
            // Local dev: file was saved to disk by multer diskStorage
            fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }
        res.json({ url: fileUrl });
    }
    catch (err) {
        console.error('[Upload] Error uploading file:', err);
        res.status(500).json({ error: 'Fayl yüklənə bilmədi. Yenidən cəhd edin.' });
    }
});
/**
 * POST /api/upload — deprecated alias, kept for backward compatibility.
 */
app.post('/api/upload', requireAuth_1.requireAuth, handleSingleUpload, async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Fayl yüklənməyib' });
    }
    try {
        let fileUrl;
        if (isAzureStorageEnabled) {
            fileUrl = await uploadToAzureBlob(req.file);
        }
        else {
            fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }
        res.json({ url: fileUrl });
    }
    catch (err) {
        console.error('[Upload] Error uploading file:', err);
        res.status(500).json({ error: 'Fayl yüklənə bilmədi. Yenidən cəhd edin.' });
    }
});
app.get('/health', async (req, res) => {
    try {
        // Test DB connection
        await prisma.$queryRaw `SELECT 1`;
        res.json({
            status: 'ok',
            db: 'connected',
            storage: isAzureStorageEnabled ? 'azure-blob' : 'local-disk',
        });
    }
    catch (error) {
        res.status(500).json({ status: 'error', db: 'disconnected', error: String(error) });
    }
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Storage backend: ${isAzureStorageEnabled ? 'Azure Blob Storage' : 'local disk'}`);
});
