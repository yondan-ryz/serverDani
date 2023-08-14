
const cors = require('cors'); // Import library CORS
const pg = require('pg');
const express = require('express');
const bodyParser = require('body-parser');
const { Pool, Client } = pg;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Ganti dengan URL koneksi PostgreSQL dari ElephantSQL
const connectionString = "postgres://awmhhxgt:yZ1HVE5U6a6WzGJZP8JbMksTuOSzl2sf@batyr.db.elephantsql.com/awmhhxgt";
const pool = new Pool({ connectionString });

// Data sementara untuk penyimpanan
const posts = [];

app.get('/posts', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM posts');
        const posts = result.rows;
        client.release();
        res.json(posts);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Terjadi kesalahan saat mengambil data');
    }
});

app.post('/posts', async (req, res) => {
    const { name, isi } = req.body;
    try {
        const client = await pool.connect();
        const query = 'INSERT INTO posts (name, isi) VALUES ($1, $2) RETURNING *';
        const values = [name, isi];
        const result = await client.query(query, values);
        const insertedPost = result.rows[0];
        client.release();
        res.json(insertedPost);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Terjadi kesalahan saat menyimpan data');
    }
});

app.delete('/posts/:id', async (req, res) => {
    const postId = req.params.id;
    try {
        const client = await pool.connect();
        const query = 'DELETE FROM posts WHERE id_post = $1 RETURNING *';
        const values = [postId];
        const result = await client.query(query, values);
        const deletedPost = result.rows[0];
        client.release();

        if (deletedPost) {
            res.json({ message: 'Post berhasil dihapus', deletedPost });
        } else {
            res.status(404).json({ message: 'Post tidak ditemukan' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Terjadi kesalahan saat menghapus data');
    }
});

// Fungsi untuk mendapatkan post berdasarkan ID
app.get('/posts/:id', async (req, res) => {
    const postId = req.params.id;
    try {
        const client = await pool.connect();
        const query = 'SELECT * FROM posts WHERE id_post = $1';
        const values = [postId];
        const result = await client.query(query, values);
        const post = result.rows[0];
        client.release();

        if (post) {
            res.json(post);
        } else {
            res.status(404).json({ message: 'Post tidak ditemukan' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Terjadi kesalahan saat mengambil data');
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
