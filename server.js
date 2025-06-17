const express = require('express');
const app = express();
const port = 3000;

// Middleware untuk parsing JSON
app.use(express.json());

// Endpoint POST
app.post('/, (req, res) => {
    const response = {
        status: "1",
        error: "00000000",
        msg: null,
        data: {
            status: "finish",
            result: "eligible",
            order_id: "TESTELGI1",
            retry_number: 1,
            reason: null,
            approval_level: "Korwil",
            reason_category: [],
            reason_description: null
        }
    };
    res.json(response);
});

// Jalankan server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
