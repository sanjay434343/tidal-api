const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

// GET recent/trending songs with full details
app.get('/recent', async (req, res) => {
  try {
    const response = await axios.get('https://api.deezer.com/chart');
    const tracks = response.data.tracks?.data || [];

    const detailedTracks = tracks.map(track => ({
      title: track.title,
      artist: track.artist?.name,
      album: track.album?.title,
      album_cover: track.album?.cover_medium,
      preview_url: track.preview,
      duration: track.duration,
      link: track.link
    }));

    res.json(detailedTracks);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

// Optional: Search endpoint for custom queries
app.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Missing search query" });

  try {
    const response = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(query)}`);
    const results = response.data.data.map(track => ({
      title: track.title,
      artist: track.artist?.name,
      album: track.album?.title,
      album_cover: track.album?.cover_medium,
      preview_url: track.preview,
      duration: track.duration,
      link: track.link
    }));
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

app.listen(3000, () => console.log('API running on port 3000'));
