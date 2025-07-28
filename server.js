const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

// GET recent songs (simulated using Deezer Charts)
app.get('/recent', async (req, res) => {
  try {
    const response = await axios.get('https://api.deezer.com/chart');
    const tracks = response.data.tracks?.data || [];
    res.json(tracks);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

// (Optional) Keep your old search endpoint too
app.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Missing search query" });

  try {
    const response = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(query)}`);
    res.json(response.data);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

app.listen(3000, () => console.log('API running on port 3000'));
