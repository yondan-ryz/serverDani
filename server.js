const cors = require('cors');
const pg = require('pg');
const jwt = require('jsonwebtoken');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { Pool } = pg;

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

const jwtSecretKey = 'jwtsecret'; // Ganti dengan kunci rahasia JWT yang kuat

const connectionString = "postgres://awmhhxgt:yZ1HVE5U6a6WzGJZP8JbMksTuOSzl2sf@batyr.db.elephantsql.com/awmhhxgt";
const pool = new Pool({ connectionString });


const allowedOrigins = ['https://ok-pastor.vercel.app', 'https://ok-pastor-frontend.vercel.app', 'http://localhost:9000'];

const corsOptions = {
    origin: function (origin, callback) {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Akses ditolak oleh CORS'));
        }
    },
};

app.use(cors(corsOptions));

function authenticateJWT(req, res, next) {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, jwtSecretKey, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

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
            const token = jwt.sign({ username: user.username }, jwtSecretKey, { expiresIn: '1h' });
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

app.get('/pastor', authenticateJWT, async (req, res) => {
    // Hanya dapat diakses dengan API key dan JWT yang valid
    try {
        const client = await pool.connect();
        const result = await pool.query('SELECT * FROM pastor WHERE is_completed = false');
        client.release();
        res.json(result.rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Terjadi kesalahan saat mengambil data');
    }
});

app.put('/update-profile/:id', async (req, res) => {
    const userId = req.params.id;
    const { oldPassword, newUsername, newPassword } = req.body;
    let client;

    try {
        client = await pool.connect();

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

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred while updating profile');
    } finally {
        if (client) {
            client.release(); // Selalu pastikan koneksi dilepaskan, bahkan jika terjadi kesalahan.
        }
    }
});

app.get('/pastor/completed', authenticateJWT, async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await pool.query('SELECT * FROM pastor WHERE is_completed = true');
        client.release();
        res.json(result.rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Terjadi kesalahan saat mengambil data');
    }
});


// Fungsi untuk mendapatkan post berdasarkan ID
app.get('/pastor/:id', authenticateJWT, async (req, res) => {
    const postId = req.params.id;

    try {
        const client = await pool.connect();
        const result = await pool.query('SELECT * FROM pastor WHERE id = $1', [postId]);
        client.release();

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

app.put('/pastor/:id', authenticateJWT, async (req, res) => {
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

app.delete('/pastor/:id', authenticateJWT, async (req, res) => {
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
