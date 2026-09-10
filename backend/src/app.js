const express = require('express');
const cors = require('cors');
const app = express();
const multer = require('multer');
const postModel = require('./models/post.model');
const { uploadImage } = require('./servicers/storage.service');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.post('/posts', upload.any(), async (req, res) => {
    try {
        const caption = req.body?.caption;

        // Accept file under 'Post_Image', 'image', or any uploaded file
        const uploadedFile = req.files?.find(f => f.fieldname === 'Post_Image' || f.fieldname === 'image') || req.files?.[0];

        let imageBuffer;
        if (uploadedFile) {
            imageBuffer = uploadedFile.buffer; // multer memoryStorage provides a direct Buffer
        } else if (req.body?.imageBase64) {
            imageBuffer = Buffer.from(req.body.imageBase64, 'base64');
        }

        if (!caption || !imageBuffer) {
            return res.status(400).json({
                error: 'Missing caption or image. Attach an image file or provide "imageBase64".'
            });
        }

        // Upload to ImageKit and log URL to terminal
        const fileName = uploadedFile?.originalname || `post_${Date.now()}.jpg`;
        const uploadResult = await uploadImage(imageBuffer, fileName);

        const newPost = await postModel.createPost(imageBuffer, caption, uploadResult.url);
        res.status(201).json(newPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all posts
app.get('/posts', async (req, res) => {
    try {
        const posts = await postModel.getAllPosts();
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get a single post
app.get('/posts/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const post = await postModel.getPostById(id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        res.json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a post
app.delete('/posts/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const deleted = await postModel.deletePost(id);
        if (!deleted) return res.status(404).json({ error: 'Post not found' });
        res.json({ message: 'Post deleted successfully', id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Like a post (increment like count)
app.patch('/posts/:id/like', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const updated = await postModel.likePost(id);
        if (!updated) return res.status(404).json({ error: 'Post not found' });
        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get raw image from MSSQL
app.get('/posts/:id/image', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const post = await postModel.getPostById(id);
        if (!post || !post.Post_Image) return res.status(404).json({ error: 'Image not found' });

        res.setHeader('Content-Type', 'image/jpeg');
        res.send(post.Post_Image);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update a post
app.put('/posts/:id', upload.any(), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const existing = await postModel.getPostById(id);
        if (!existing) return res.status(404).json({ error: 'Post not found' });

        const uploadedFile = req.files?.find(f => f.fieldname === 'Post_Image' || f.fieldname === 'image') || req.files?.[0];
        let imageBuffer = existing.Post_Image;
        let imageUrl = existing.Image_Url;

        if (uploadedFile) {
            imageBuffer = uploadedFile.buffer;
            const uploadResult = await uploadImage(imageBuffer, uploadedFile.originalname || `post_${Date.now()}.jpg`);
            imageUrl = uploadResult.url;
        } else if (req.body?.imageBase64) {
            imageBuffer = Buffer.from(req.body.imageBase64, 'base64');
            const uploadResult = await uploadImage(imageBuffer, `post_${Date.now()}.jpg`);
            imageUrl = uploadResult.url;
        }

        const caption = req.body?.caption !== undefined ? req.body.caption : existing.Caption;

        const updated = await postModel.updatePost(id, imageBuffer, caption, imageUrl);
        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ---------- Comments Routes ----------

// Get all comments for a post
app.get('/posts/:id/comments', async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const comments = await postModel.getCommentsByPostId(postId);
        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add a comment to a post
app.post('/posts/:id/comments', async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const { text, author } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ error: 'Comment text cannot be empty' });
        }

        const newComment = await postModel.addComment(postId, text.trim(), author?.trim() || 'Community Member');
        res.status(201).json(newComment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a comment
app.delete('/comments/:id', async (req, res) => {
    try {
        const commentId = parseInt(req.params.id);
        const deleted = await postModel.deleteComment(commentId);
        if (!deleted) return res.status(404).json({ error: 'Comment not found' });
        res.json({ message: 'Comment deleted successfully', id: commentId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Existing root route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Multer and general error-handling middleware
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `Upload error: ${err.message}` });
    }
    if (err) {
        return res.status(500).json({ error: err.message || 'Internal server error' });
    }
    next();
});

module.exports = app;
