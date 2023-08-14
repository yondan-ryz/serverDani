const pg = require('pg');
const express = require('express');
const bodyParser = require('body-parser');
const { Pool, Client } = pg;

const app = express();
const PORT = process.env.PORT || 3000;

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

app.post('/add-data', (req, res) => {
    const { name, isi } = req.body;
    const newData = { name, isi, type: 'user' };
    posts.push(newData);
    res.status(201).json(newData);
});

// Endpoint untuk melihat data oleh admin
app.get('/view-data', (req, res) => {
    const type = req.query.type;
    if (type === 'admin') {
        res.json(posts);
    } else {
        res.status(403).send('Anda tidak memiliki izin untuk melihat data');
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
