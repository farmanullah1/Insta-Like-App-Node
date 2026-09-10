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

// Get all posts ordered by newest first
async function getAllPosts() {
    const pool = await getConnection();
    const result = await pool.request().query(`
        SELECT id, Caption, Image_Url, Likes, CreatedAt, Post_Image
        FROM Posts
        ORDER BY id DESC
    `);
    return result.recordset;
}

// Get a single post by id
async function getPostById(id) {
    const pool = await getConnection();
    const request = pool.request();
    request.input('id', sql.Int, id);

    const result = await request.query(`
        SELECT id, Caption, Image_Url, Likes, CreatedAt, Post_Image
        FROM Posts
        WHERE id = @id
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

// ---------- Export all functions ----------
module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    likePost,
};