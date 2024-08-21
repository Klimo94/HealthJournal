const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const PORT = 3001;

app.use(bodyParser.json());
app.use(express.static('public'));

const dbFile = './db.json';

const readDB = () => {
    return JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
};

const writeDB = (data) => {
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
};

app.get('/measurements', (req, res) => {
    const data = readDB();
    res.json(data.measurements);
});

app.post('/measurements', (req, res) => {
    const newMeasurement = req.body;
    const data = readDB();
    data.measurements.push(newMeasurement);
    writeDB(data);
    res.status(201).json(newMeasurement);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
