"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const home_1 = __importDefault(require("./routes/home"));
const clientLogos_1 = __importDefault(require("./routes/clientLogos"));
const services_1 = __importDefault(require("./routes/services"));
// Ensure uploads dir exists
const uploadsDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
    }
});
const upload = (0, multer_1.default)({ storage });
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
const prisma = new client_1.PrismaClient();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
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
app.use('/uploads', express_1.default.static(uploadsDir));
app.use('/api/home', home_1.default);
app.use('/api/client-logos', clientLogos_1.default);
console.log('SERVICES ROUTES:', services_1.default);
app.use('/api/services/test', (req, res) => res.send('test ok'));
app.use('/api/services', services_1.default);
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});
app.get('/health', async (req, res) => {
    try {
        // Test DB connection
        await prisma.$queryRaw `SELECT 1`;
        res.json({ status: 'ok', db: 'connected' });
    }
    catch (error) {
        res.status(500).json({ status: 'error', db: 'disconnected', error: String(error) });
    }
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
