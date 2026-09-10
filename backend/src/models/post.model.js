const sql = require('mssql/msnodesqlv8');
const { getPool } = require('../db/db');

// Helper to get a connected pool
const getConnection = async () => {
    const pool = await getPool();
    return pool;
};

// ---------- CRUD Functions ----------

// Create a new post
async function createPost(imageBuffer, caption, imageUrl = null) {
    const pool = await getConnection();
    const request = pool.request();

    request.input('image', sql.VarBinary(sql.MAX), imageBuffer || null);
    request.input('caption', sql.NVarChar(255), caption);
    request.input('imageUrl', sql.NVarChar(sql.MAX), imageUrl || null);

    const result = await request.query(`
        INSERT INTO Posts (Post_Image, Caption, Image_Url, Likes, CreatedAt)
        OUTPUT INSERTED.id, INSERTED.Caption, INSERTED.Image_Url, INSERTED.Likes, INSERTED.CreatedAt, INSERTED.Post_Image
        VALUES (@image, @caption, @imageUrl, 0, GETDATE())
    `);

    return result.recordset[0];
}

// Get all posts ordered by newest first with comment counts
async function getAllPosts() {
    const pool = await getConnection();
    const result = await pool.request().query(`
        SELECT 
            p.id, 
            p.Caption, 
            p.Image_Url, 
            p.Likes, 
            p.CreatedAt, 
            p.Post_Image,
            COUNT(c.id) AS CommentsCount
        FROM Posts p
        LEFT JOIN Comments c ON p.id = c.PostId
        GROUP BY p.id, p.Caption, p.Image_Url, p.Likes, p.CreatedAt, p.Post_Image
        ORDER BY p.id DESC
    `);
    return result.recordset;
}

// Get a single post by id with comment count
async function getPostById(id) {
    const pool = await getConnection();
    const request = pool.request();
    request.input('id', sql.Int, id);

    const result = await request.query(`
        SELECT 
            p.id, 
            p.Caption, 
            p.Image_Url, 
            p.Likes, 
            p.CreatedAt, 
            p.Post_Image,
            COUNT(c.id) AS CommentsCount
        FROM Posts p
        LEFT JOIN Comments c ON p.id = c.PostId
        WHERE p.id = @id
        GROUP BY p.id, p.Caption, p.Image_Url, p.Likes, p.CreatedAt, p.Post_Image
    `);
    return result.recordset[0] || null;
}

// Update a post (image, caption, and/or imageUrl)
async function updatePost(id, imageBuffer, caption, imageUrl = null) {
    const pool = await getConnection();
    const request = pool.request();

    request.input('id', sql.Int, id);
    request.input('image', sql.VarBinary(sql.MAX), imageBuffer || null);
    request.input('caption', sql.NVarChar(255), caption);
    request.input('imageUrl', sql.NVarChar(sql.MAX), imageUrl || null);

    const result = await request.query(`
        UPDATE Posts
        SET Post_Image = COALESCE(@image, Post_Image),
            Caption = @caption,
            Image_Url = COALESCE(@imageUrl, Image_Url)
        WHERE id = @id;

        SELECT id, Caption, Image_Url, Likes, CreatedAt, Post_Image
        FROM Posts
        WHERE id = @id;
    `);
    return result.recordset[0] || null;
}

// Delete a post by id
async function deletePost(id) {
    const pool = await getConnection();
    const request = pool.request();
    request.input('id', sql.Int, id);

    const result = await request.query(`
        DELETE FROM Posts WHERE id = @id
    `);
    return result.rowsAffected[0] > 0;
}

// Like a post (increment like count)
async function likePost(id) {
    const pool = await getConnection();
    const request = pool.request();
    request.input('id', sql.Int, id);

    const result = await request.query(`
        UPDATE Posts
        SET Likes = ISNULL(Likes, 0) + 1
        WHERE id = @id;

        SELECT id, Caption, Image_Url, Likes, CreatedAt
        FROM Posts
        WHERE id = @id;
    `);
    return result.recordset[0] || null;
}

// ---------- Comments CRUD Operations ----------

// Get comments for a post
async function getCommentsByPostId(postId) {
    const pool = await getConnection();
    const request = pool.request();
    request.input('postId', sql.Int, postId);

    const result = await request.query(`
        SELECT id, PostId, Author, Text, CreatedAt
        FROM Comments
        WHERE PostId = @postId
        ORDER BY id ASC
    `);
    return result.recordset;
}

// Add a comment to a post
async function addComment(postId, text, author = 'Community Member') {
    const pool = await getConnection();
    const request = pool.request();
    request.input('postId', sql.Int, postId);
    request.input('author', sql.NVarChar(100), author);
    request.input('text', sql.NVarChar(500), text);

    const result = await request.query(`
        INSERT INTO Comments (PostId, Author, Text, CreatedAt)
        OUTPUT INSERTED.id, INSERTED.PostId, INSERTED.Author, INSERTED.Text, INSERTED.CreatedAt
        VALUES (@postId, @author, @text, GETDATE())
    `);
    return result.recordset[0];
}

// Delete a comment
async function deleteComment(commentId) {
    const pool = await getConnection();
    const request = pool.request();
    request.input('id', sql.Int, commentId);

    const result = await request.query(`
        DELETE FROM Comments WHERE id = @id
    `);
    return result.rowsAffected[0] > 0;
}

// ---------- Export all functions ----------
module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    likePost,
    getCommentsByPostId,
    addComment,
    deleteComment,
};