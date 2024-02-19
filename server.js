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

function checkDomainAdmin(req, res, next) {
    const allowedDomains = ['https://ok-pastor.vercel.app']; // Daftar domain yang diizinkan

    const requestDomain = req.headers.host; // Mendapatkan domain dari header host

    // Memeriksa apakah domain pengguna termasuk dalam daftar yang diizinkan
    if (allowedDomains.includes(requestDomain)) {
        next(); // Lanjutkan ke middleware berikutnya
    } else {
        res.status(403).json({ message: "Akses ditolak untuk domain ini." }); // Tampilkan pesan kesalahan jika domain tidak diizinkan
    }
}
function authenticateJWTAdmin(req, res, next) {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Terjadi kesalahan.' });
    }

    jwt.verify(token, jwtSecretKey, async (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token.' });
        }

        const client = await pool.connect();
        const altIdQuery = 'SELECT superadmin FROM user_admin WHERE username = $1';
        const altIdResult = await client.query(altIdQuery, [user.username]);
        const userAltId = altIdResult.rows[0].superadmin;
        client.release();

        if (userAltId === null) {
            return res.status(403).json({ message: 'Akses ditolak.' });
        }
        req.user = user;
        next();
    });
}


function authenticateJWTUser(req, res, next) {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Terjadi kesalahan.' });
    }

    jwt.verify(token, jwtSecretKey, async (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token.' });
        }
        // Check if the user has alt_id 100
        const client = await pool.connect();
        const altIdQuery = 'SELECT username FROM users WHERE username = $1';
        const altIdResult = await client.query(altIdQuery, [user.username]);
        const userAltId = altIdResult.rows[0].username;
        client.release();

        if (userAltId === null) {
            return res.status(403).json({ message: 'Anda bukan user.' });
        }
        req.user = user;
        next();
    });
}
function authenticateJWTSuperAdmin(req, res, next) {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Terjadi Kesalahan' });
    }

    jwt.verify(token, jwtSecretKey, async (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }

        // Check if the user has alt_id 100
        const client = await pool.connect();
        const altIdQuery = 'SELECT superadmin FROM user_admin WHERE username = $1';
        const altIdResult = await client.query(altIdQuery, [user.username]);
        const userAltId = altIdResult.rows[0].superadmin;
        client.release();

        if (userAltId !== true) {
            return res.status(403).json({ message: 'Anda bukan Superadmin.' });
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
            return res.status(401).json({ message: 'Username atau Password salah.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            const token = jwt.sign({ username: user.username }, jwtSecretKey, { expiresIn: '1h' });
            res.cookie('token', token, {
                maxAge: 3600000,
                domain: 'ok-pastor.frontend.vercel.app',
                sameSite: 'Strict'
            });

            res.json({ username: user.username ,token });
        } else {
            res.status(401).json({ message: 'Username atau Password salah.' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Terjadi kesalahan pada Server.' });
    }
});


app.post('/login_admin', async (req, res) => {
    const { username, password } = req.body;

    try {
        const client = await pool.connect();
        const query = 'SELECT * FROM user_admin WHERE username = $1';
        const result = await client.query(query, [username]);
        const user = result.rows[0];
        client.release();

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            const token = jwt.sign({ username: user.username }, jwtSecretKey, { expiresIn: '1h' });
            res.cookie('token', token, {
                maxAge: 3600000,
                domain: 'ok-pastor.vercel.app',
                sameSite: 'Strict'
            });
            res.json({ username: user.username ,token });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Terjadi kesalahan saat proses login');
    }
});

app.post('/create-user', async (req, res) => {
    const { username, password, alt_id } = req.body;

    try {
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const client = await pool.connect();
        const query = 'INSERT INTO users (username, password, alt_id) VALUES ($1, $2, $3) RETURNING *';
        const result = await client.query(query, [username, hashedPassword, alt_id]);
        const newUser = result.rows[0];
        client.release();

        res.json(newUser);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Terjadi kesalahan saat menambahkan pengguna');
    }
});

app.get('/pastor',  authenticateJWTAdmin, async (req, res) => {
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

app.put('/update-profile-superadmin', authenticateJWTSuperAdmin,async (req, res) => {

    const { oldPassword, newPassword } = req.body;
    let client;

    try {
        client = await pool.connect();

        // Check if the user exists
        const userQuery = 'SELECT * FROM user_admin WHERE superadmin = true';
        const userResult = await client.query(userQuery);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(404).json({ message: 'Terdapat error harap hubungi developer.' });
        }

        // Verify old password
        const validPassword = await bcrypt.compare(oldPassword, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Password lama salah.' });
        }
        // Update Password if provided
        if (newPassword) {
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            const updatePasswordQuery = 'UPDATE user_admin SET password = $1 WHERE superadmin = true';
            await client.query(updatePasswordQuery, [hashedNewPassword]);
        }

        res.json({ message: 'Password berhasil diupdate.' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Terdapat error ketika melakukan update password.');
    } finally {
        if (client) {
            client.release(); // Selalu pastikan koneksi dilepaskan, bahkan jika terjadi kesalahan.
        }
    }
});

app.get('/pastor/completed', authenticateJWTAdmin, async (req, res) => {
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
app.get('/pastor/:id', authenticateJWTAdmin, async (req, res) => {
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

app.put('/pastor/:id', authenticateJWTAdmin, async (req, res) => {
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

app.get('/qrlink',  authenticateJWTAdmin, async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await pool.query('SELECT * FROM qrlink WHERE main = 1');
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

app.put('/qrlink/edit', authenticateJWTAdmin, async (req, res) => {
    const { newLink } = req.body;

    try {
        const client = await pool.connect();

        // Assuming you have an 'id' field in your qrlink table
        const result = await pool.query(
            'UPDATE qrlink SET link = $1', // Update based on your actual schema
            [newLink]
        );

        client.release();

        if (result.rowCount > 0) {
            res.json({ message: 'QR link updated successfully' });
        } else {
            res.status(404).json({ message: 'QR link not found for update' });
        }
    } catch (error) {
        console.error('Error updating QR link:', error);
        res.status(500).json({ message: 'An error occurred while updating QR link' });
    }
});

//kategori pendidikan
app.post('/pastor',  async (req, res) => {
    const { name, content } = req.body;

// Ganti dengan token yang benar

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

app.post('/pastor/keluarga', authenticateJWTUser, async (req, res) => {
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

app.post('/pastor/percintaan', authenticateJWTUser, async (req, res) => {
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

app.post('/pastor/pekerjaan', authenticateJWTUser, async (req, res) => {
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

app.delete('/pastor/:id', authenticateJWTAdmin, async (req, res) => {
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
