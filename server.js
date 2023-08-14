const cors = require('cors'); // Import library CORS
const pg = require('pg');
const express = require('express');
const bodyParser = require('body-parser');
const { Pool, Client } = pg;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const connectionString = "postgres://awmhhxgt:yZ1HVE5U6a6WzGJZP8JbMksTuOSzl2sf@batyr.db.elephantsql.com/awmhhxgt";
const pool = new Pool({ connectionString });


const pastor = [];

app.get('/pastor', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM pastor WHERE is_completed = false');
        res.json(result.rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Terjadi kesalahan saat mengambil data');
    }
});

app.get('/pastor/completed', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM pastor WHERE is_completed = true');
        res.json(result.rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Terjadi kesalahan saat mengambil data');
    }
});


// Fungsi untuk mendapatkan post berdasarkan ID
app.get('/pastor/:id', async (req, res) => {
    const postId = req.params.id;

    try {
        const result = await pool.query('SELECT * FROM pastor WHERE id = $1', [postId]);

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Post tidak ditemukan' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Terjadi kesalahan saat mengambil data');
    }
});

app.put('/pastor/:id', async (req, res) => {
    const postId = req.params.id;

    try {
        const { is_completed } = req.body;

        const result = await pool.query('UPDATE pastor SET is_completed = $1 WHERE id = $2', [is_completed, postId]);

        if (result.rowCount > 0) {
            res.json({ message: 'Status is_completed berhasil diperbarui' });
        } else {
            res.status(404).json({ message: 'Post tidak ditemukan' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Terjadi kesalahan saat memperbarui status is_completed');
    }
});

app.post('/pastor', async (req, res) => {
    const { name, content } = req.body;
    try {
        const client = await pool.connect();
        const query = 'INSERT INTO pastor (name, content, category, is_completed) VALUES ($1, $2, $3, $4) RETURNING *';
        const values = [name, content, 'Pendidikan', false]; // Set default category and is_completed
        const result = await client.query(query, values);
        const insertedPost = result.rows[0];
        client.release();
        res.json(insertedPost);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Terjadi kesalahan saat menyimpan data');
    }
});


app.delete('/pastor/:id', async (req, res) => {
    const postId = req.params.id;

    try {
        const result = await pool.query('DELETE FROM pastor WHERE id = $1', [postId]);

        if (result.rowCount > 0) {
            res.json({ message: 'Post berhasil dihapus' });
        } else {
            res.status(404).json({ message: 'Post tidak ditemukan' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Terjadi kesalahan saat menghapus data');
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
