const express = require('express');
const app = express();
const port = 3000;

app.get('/blacklist/check', (req, res) => {
    const response = {
        errors: null,
        data: [
            {
                idNumber: "1408045207750001",
                source: "smmf",
                contactNumber: "08100000269",
                custName: "Asep",
                category: "HR_REASONS",
                blacklistDatetime: "2024-06-06 17:01:12",
                blacklistUpdateDate: "2024-06-06 17:01:12",
                reason: "Melanggar kontrak kerja",
                whitelist: false
            },
            {
                idNumber: "1408045207750001",
                source: "bsim",
                contactNumber: "08100000269",
                custName: "Asep",
                category: "DANI",
                blacklistDatetime: "2024-06-06 17:01:12",
                blacklistUpdateDate: "2024-06-06 17:01:12",
                reason: "Fraud Issue",
                whitelist: true
            },
            {
                idNumber: "1408045207750001",
                source: "bsim",
                contactNumber: "08100000269",
                custName: "Asep",
                category: "ARREARS_TUNGGAKAN",
                blacklistDatetime: "2024-06-06 17:01:12",
                blacklistUpdateDate: "2024-06-06 17:01:12",
                reason: "Fraud Issue",
                whitelist: true
            },
            {
                idNumber: "1408045207750001",
                source: "bsim",
                contactNumber: "08100000269",
                custName: "Asep",
                category: "REPOSSESSION",
                blacklistDatetime: "2024-06-06 17:01:12",
                blacklistUpdateDate: "2024-06-06 17:01:12",
                reason: "Fraud Issue",
                whitelist: true
            }
        ],
        transactionId: "2opYog4YMzbic6JcFNQFJJgkn9l"
    };
    res.json(response);
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
