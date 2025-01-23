const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files
app.use(express.static('public'));

// Endpoint to save score
app.post('/save-score', (req, res) => {
    const { name, score } = req.body;

    // Validate input
    if (!name || isNaN(score)) {
        return res.status(400).json({ error: 'Invalid name or score' });
    }

    // Append the score to the CSV file
    const csvLine = `${name},${score}\n`;
    fs.appendFile('scores.csv', csvLine, (err) => {
        if (err) {
            console.error('Error saving score:', err);
            return res.status(500).json({ error: 'Failed to save score' });
        }
        res.status(200).json({ message: 'Score saved successfully' });
    });
});

// Endpoint to get leaderboard data
app.get('/leaderboard', (req, res) => {
    const scores = [];
    fs.createReadStream('scores.csv')
        .pipe(csv({ headers: false }))
        .on('data', (row) => {
            const name = row[0];
            const score = parseInt(row[1], 10);
            if (name && !isNaN(score)) {
                scores.push({ name, score });
            }
        })
        .on('end', () => {
            const topScores = scores
                .sort((a, b) => b.score - a.score)
                .slice(0, 10);
            res.json(topScores);
        })
        .on('error', (err) => {
            console.error('Error reading CSV file:', err);
            res.status(500).send('Failed to read leaderboard data.');
        });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));