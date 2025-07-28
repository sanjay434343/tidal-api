const express = require('express');
const cors = require('cors');
const Tidal = require('tidal-api-wrapper');

const app = express();
app.use(cors());

const tidal = new Tidal({ countryCode: 'US' });

app.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Missing search query' });

    const result = await tidal.search(query, 'tracks', 1);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`TIDAL proxy running on port ${PORT}`));
