const cors = require('cors'); // Import library CORS
const pg = require('pg');
const jwt = require('jsonwebtoken');
const express = require('express');
const bodyParser = require('body-parser');
const { Pool, Client } = pg;

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

const secretKey = 'your_secret_key'; // Ganti dengan kunci rahasia yang kuat


const connectionString = "postgres://awmhhxgt:yZ1HVE5U6a6WzGJZP8JbMksTuOSzl2sf@batyr.db.elephantsql.com/awmhhxgt";
const pool = new Pool({ connectionString });


const pastor = [];

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const client = await pool.connect();
        const query = 'SELECT * FROM users WHERE username = $1';
        const result = await client.query(query, [username]);
        const user = result.rows[0];
        client.release();

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // WARNING: Insecure method, not recommended for production
        if (password === user.password) {
            const token = jwt.sign({ username: user.username }, secretKey, { expiresIn: '1h' });
            res.cookie('token', token, { maxAge: 3600000 });
            res.json({ token });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Terjadi kesalahan saat proses login');
    }
});

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

//kategori pendidikan
app.post('/pastor', async (req, res) => {
    const { name, content, token } = req.body;

    // Ganti dengan token yang benar
    const validToken = "dani";

    try {
        if (token !== validToken) {
            return res.status(403).send('Akses ditolak');
        }

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

app.post('/pastor/keluarga', async (req, res) => {
    const { name, content, token } = req.body;

    // Ganti dengan token yang benar
    const validToken = "dani";

    try {
        if (token !== validToken) {
            return res.status(403).send('Akses ditolak');
        }

        const client = await pool.connect();
        const query = 'INSERT INTO pastor (name, content, category, is_completed) VALUES ($1, $2, $3, $4) RETURNING *';
        const values = [name, content, 'Keluarga', false]; // Set default category and is_completed
        const result = await client.query(query, values);
        const insertedPost = result.rows[0];
        client.release();
        res.json(insertedPost);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Terjadi kesalahan saat menyimpan data');
    }
});

app.post('/pastor/percintaan', async (req, res) => {
    const { name, content, token } = req.body;

    // Ganti dengan token yang benar
    const validToken = "dani";

    try {
        if (token !== validToken) {
            return res.status(403).send('Akses ditolak');
        }

        const client = await pool.connect();
        const query = 'INSERT INTO pastor (name, content, category, is_completed) VALUES ($1, $2, $3, $4) RETURNING *';
        const values = [name, content, 'Percintaan', false]; // Set default category and is_completed
        const result = await client.query(query, values);
        const insertedPost = result.rows[0];
        client.release();
        res.json(insertedPost);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Terjadi kesalahan saat menyimpan data');
    }
});

app.post('/pastor/pekerjaan', async (req, res) => {
    const { name, content, token } = req.body;

    // Ganti dengan token yang benar
    const validToken = "dani";

    try {
        if (token !== validToken) {
            return res.status(403).send('Akses ditolak');
        }

        const client = await pool.connect();
        const query = 'INSERT INTO pastor (name, content, category, is_completed) VALUES ($1, $2, $3, $4) RETURNING *';
        const values = [name, content, 'Pekerjaan', false]; // Set default category and is_completed
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
