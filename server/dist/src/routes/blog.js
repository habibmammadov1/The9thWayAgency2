"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const requireAuth_1 = require("../middleware/requireAuth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Validation Schemas
const validate = (schema) => (req, res, next) => {
    try {
        req.body = schema.parse(req.body);
        next();
    }
    catch (err) {
        res.status(400).json({ error: err.errors || 'Validation Error' });
    }
};
const categoryItemSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    name: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(1),
    order: zod_1.z.number().int(),
});
const syncCategoriesSchema = zod_1.z.object({
    categories: zod_1.z.array(categoryItemSchema),
});
const contentBlockSchema = zod_1.z.object({
    type: zod_1.z.enum(['paragraph', 'heading', 'image', 'quote']),
    value: zod_1.z.string(),
});
const createPostSchema = zod_1.z.object({
    locale: zod_1.z.string().min(2).max(5),
    slug: zod_1.z.string().min(1),
    title: zod_1.z.string().min(1),
    excerpt: zod_1.z.string().min(1),
    content: zod_1.z.array(contentBlockSchema),
    featuredImageUrl: zod_1.z.string().nullable().optional(),
    categoryId: zod_1.z.string().nullable().optional(),
    authorName: zod_1.z.string().min(1),
    authorAvatarUrl: zod_1.z.string().nullable().optional(),
    authorBio: zod_1.z.string().nullable().optional(),
    isPublished: zod_1.z.boolean().optional(),
    publishedAt: zod_1.z.string().optional().transform((val) => val ? new Date(val) : new Date()),
});
const updatePostSchema = zod_1.z.object({
    slug: zod_1.z.string().min(1).optional(),
    title: zod_1.z.string().min(1).optional(),
    excerpt: zod_1.z.string().min(1).optional(),
    content: zod_1.z.array(contentBlockSchema).optional(),
    featuredImageUrl: zod_1.z.string().nullable().optional(),
    categoryId: zod_1.z.string().nullable().optional(),
    authorName: zod_1.z.string().min(1).optional(),
    authorAvatarUrl: zod_1.z.string().nullable().optional(),
    authorBio: zod_1.z.string().nullable().optional(),
    isPublished: zod_1.z.boolean().optional(),
    publishedAt: zod_1.z.string().optional().transform((val) => val ? new Date(val) : undefined),
});
/**
 * @swagger
 * /api/blog/categories:
 *   get:
 *     summary: List blog categories for a locale
 *     tags: [Blog]
 *     parameters:
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/categories', async (req, res) => {
    try {
        const { locale } = req.query;
        if (!locale || typeof locale !== 'string') {
            res.status(400).json({ error: 'locale query param is required' });
            return;
        }
        const categories = await prisma.blogCategory.findMany({
            where: { locale },
            orderBy: { order: 'asc' },
        });
        res.json(categories);
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/blog/categories:
 *   put:
 *     summary: Replace/sync ordered category list for a locale
 *     tags: [Blog]
 *     parameters:
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Categories synchronized
 */
router.put('/categories', requireAuth_1.requireAuth, validate(syncCategoriesSchema), async (req, res) => {
    try {
        const { locale } = req.query;
        if (!locale || typeof locale !== 'string') {
            res.status(400).json({ error: 'locale query param is required' });
            return;
        }
        const payload = req.body;
        const incomingIds = payload.categories.map((c) => c.id).filter(Boolean);
        // 1. Delete categories not in the incoming payload for this locale
        // First, nullify references in BlogPost to prevent foreign key errors
        const categoriesToDelete = await prisma.blogCategory.findMany({
            where: {
                locale,
                NOT: { id: { in: incomingIds } },
            },
            select: { id: true },
        });
        const deleteIds = categoriesToDelete.map((c) => c.id);
        if (deleteIds.length > 0) {
            await prisma.blogPost.updateMany({
                where: { categoryId: { in: deleteIds } },
                data: { categoryId: null },
            });
            await prisma.blogCategory.deleteMany({
                where: { id: { in: deleteIds } },
            });
        }
        // 2. Insert or update categories
        const upsertedCategories = [];
        for (const cat of payload.categories) {
            if (cat.id) {
                const updated = await prisma.blogCategory.update({
                    where: { id: cat.id },
                    data: {
                        name: cat.name,
                        slug: cat.slug,
                        order: cat.order,
                    },
                });
                upsertedCategories.push(updated);
            }
            else {
                const created = await prisma.blogCategory.create({
                    data: {
                        locale,
                        name: cat.name,
                        slug: cat.slug,
                        order: cat.order,
                    },
                });
                upsertedCategories.push(created);
            }
        }
        res.json(upsertedCategories);
    }
    catch (error) {
        console.error('Error syncing categories:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/blog/posts:
 *   get:
 *     summary: Paginated blog posts list
 *     tags: [Blog]
 *     parameters:
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/posts', async (req, res) => {
    try {
        const { locale, page, category, search, limit } = req.query;
        if (!locale || typeof locale !== 'string') {
            res.status(400).json({ error: 'locale query param is required' });
            return;
        }
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 6;
        const skip = (pageNum - 1) * limitNum;
        // Build Prisma query clauses
        const whereClause = { locale };
        // Filter by Category slug if provided
        if (category && typeof category === 'string') {
            whereClause.category = { slug: category };
        }
        // Search filter: title, excerpt, or block content values
        if (search && typeof search === 'string') {
            const searchTerm = search.trim();
            whereClause.OR = [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { excerpt: { contains: searchTerm, mode: 'insensitive' } },
                {
                    content: {
                        path: '$[*].value',
                        array_contains: searchTerm,
                    },
                },
            ];
        }
        const [posts, totalCount] = await Promise.all([
            prisma.blogPost.findMany({
                where: whereClause,
                include: { category: true },
                orderBy: { publishedAt: 'desc' },
                skip,
                take: limitNum,
            }),
            prisma.blogPost.count({ where: whereClause }),
        ]);
        res.json({
            posts,
            totalCount,
            page: pageNum,
            totalPages: Math.ceil(totalCount / limitNum),
        });
    }
    catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/blog/posts/{slug}:
 *   get:
 *     summary: Single post by slug and locale
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/posts/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const { locale } = req.query;
        if (!locale || typeof locale !== 'string') {
            res.status(400).json({ error: 'locale query param is required' });
            return;
        }
        const post = await prisma.blogPost.findFirst({
            where: { slug, locale },
            include: { category: true },
        });
        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }
        res.json(post);
    }
    catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/blog/posts/id/{id}:
 *   get:
 *     summary: Single post by id
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/posts/id/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const post = await prisma.blogPost.findUnique({
            where: { id },
            include: { category: true },
        });
        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }
        res.json(post);
    }
    catch (error) {
        console.error('Error fetching post by id:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/blog/posts:
 *   post:
 *     summary: Create a new blog post
 *     tags: [Blog]
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/posts', requireAuth_1.requireAuth, validate(createPostSchema), async (req, res) => {
    try {
        const payload = req.body;
        // Check if slug is unique for this locale
        const existing = await prisma.blogPost.findUnique({
            where: {
                locale_slug: {
                    locale: payload.locale,
                    slug: payload.slug,
                },
            },
        });
        if (existing) {
            res.status(400).json({ error: 'Bu slaq (slug) ilə məqalə artıq mövcuddur.' });
            return;
        }
        const newPost = await prisma.blogPost.create({
            data: {
                locale: payload.locale,
                slug: payload.slug,
                title: payload.title,
                excerpt: payload.excerpt,
                content: payload.content,
                featuredImageUrl: payload.featuredImageUrl || null,
                categoryId: payload.categoryId || null,
                authorName: payload.authorName,
                authorAvatarUrl: payload.authorAvatarUrl || null,
                authorBio: payload.authorBio || null,
                isPublished: payload.isPublished ?? true,
                publishedAt: payload.publishedAt,
            },
            include: { category: true },
        });
        res.json(newPost);
    }
    catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/blog/posts/{id}:
 *   put:
 *     summary: Update an existing blog post
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.put('/posts/:id', requireAuth_1.requireAuth, validate(updatePostSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const payload = req.body;
        const existingPost = await prisma.blogPost.findUnique({ where: { id } });
        if (!existingPost) {
            res.status(404).json({ error: 'Məqalə tapılmadı.' });
            return;
        }
        // Check slug uniqueness if it is changing
        if (payload.slug && payload.slug !== existingPost.slug) {
            const duplicate = await prisma.blogPost.findUnique({
                where: {
                    locale_slug: {
                        locale: existingPost.locale,
                        slug: payload.slug,
                    },
                },
            });
            if (duplicate) {
                res.status(400).json({ error: 'Bu slaq (slug) ilə məqalə artıq mövcuddur.' });
                return;
            }
        }
        const updatedPost = await prisma.blogPost.update({
            where: { id },
            data: {
                slug: payload.slug,
                title: payload.title,
                excerpt: payload.excerpt,
                content: payload.content,
                featuredImageUrl: payload.featuredImageUrl,
                categoryId: payload.categoryId,
                authorName: payload.authorName,
                authorAvatarUrl: payload.authorAvatarUrl,
                authorBio: payload.authorBio,
                isPublished: payload.isPublished,
                publishedAt: payload.publishedAt,
            },
            include: { category: true },
        });
        res.json(updatedPost);
    }
    catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/blog/posts/{id}:
 *   delete:
 *     summary: Delete a blog post
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete('/posts/:id', requireAuth_1.requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma.blogPost.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: 'Məqalə tapılmadı.' });
            return;
        }
        await prisma.blogPost.delete({ where: { id } });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = router;
