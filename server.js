const cors = require('cors'); // Import library CORS
const pg = require('pg');
const jwt = require('jsonwebtoken');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { Pool, Client } = pg;
const app = express();
const PORT = process.env.PORT || 4000;

const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = ['https://ok-pastor.vercel.app', 'http://localhost:9000'];
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Akses ditolak oleh CORS'));
        }
    },
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

const secretKey = 'dani'; // Ganti dengan kunci rahasia yang kuat

function blockPostman(req, res, next) {
    const postmanToken = req.get('postman-token');
    if (postmanToken) {
        return res.status(403).json({ message: 'Waduh, mau lihat data?' });
    }
    next();
}

app.use(blockPostman);

app.use(function (req, res, next) {
    const cacheControlHeader = req.headers['cache-control'];
    let nilai;

    if (cacheControlHeader) {
        nilai = '3';
    } else {
        nilai = '0';
    }

    req.nilai = nilai; // Menambahkan nilai ke req untuk digunakan di middleware selanjutnya
    next();
});

const validApiKey = 'dani12343'; // Kunci API yang valid

function authenticateApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    if (apiKey + req.nilai === validApiKey) {
        next();
    } else {
        res.status(403).json({ message: 'Invalid API key' });
    }
}

// Routes dan middleware lainnya

app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});


// Middleware autentikasi JWT


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

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
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

app.put('/update-profile/:id', async (req, res) => {
    const userId = req.params.id;
    const { oldPassword, newUsername, newPassword } = req.body;

    try {
        const client = await pool.connect();

// Check if the user exists
        const userQuery = 'SELECT * FROM users WHERE alt_id = $1';
        const userResult = await client.query(userQuery, [userId]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

// Verify old password
        const validPassword = await bcrypt.compare(oldPassword, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Old password is incorrect' });
        }

// Update Username if provided
        if (newUsername) {
            const updateUsernameQuery = 'UPDATE users SET username = $1 WHERE alt_id = $2';
            await client.query(updateUsernameQuery, [newUsername, userId]);
        }

// Update Password if provided
        if (newPassword) {
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            const updatePasswordQuery = 'UPDATE users SET password = $1 WHERE alt_id = $2';
            await client.query(updatePasswordQuery, [hashedNewPassword, userId]);
        }

        client.release();
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred while updating profile');
    }
});

app.get('/pastor', authenticateApiKey, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM pastor WHERE is_completed = false');
        res.json(result.rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Terjadi kesalahan saat mengambil data');
    }
});

app.get('/pastor/completed', authenticateApiKey, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM pastor WHERE is_completed = true');
        res.json(result.rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Terjadi kesalahan saat mengambil data');
    }
});


// Fungsi untuk mendapatkan post berdasarkan ID
app.get('/pastor/:id', authenticateApiKey, async (req, res) => {
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

app.put('/pastor/:id', authenticateApiKey, async (req, res) => {
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
app.post('/pastor', authenticateApiKey, async (req, res) => {
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

app.post('/pastor/keluarga', authenticateApiKey, async (req, res) => {
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

app.post('/pastor/percintaan', authenticateApiKey, async (req, res) => {
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

app.post('/pastor/pekerjaan', authenticateApiKey, async (req, res) => {
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

app.delete('/pastor/:id', authenticateApiKey, async (req, res) => {
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

app.get('/announcements', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM announcements');
        client.release();
        res.json(result.rows);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
