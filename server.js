const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

const BASE_URL = 'https://api.deezer.com';

// GET /search?q=Anirudh
app.get('/search', async (req, res) => {
  const query = req.query.q;
  try {
    const { data } = await axios.get(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
    const tracks = data.data.map(track => ({
      title: track.title,
      artist: track.artist.name,
      album: track.album.title,
      album_cover: track.album.cover_medium,
      preview_url: track.preview,
      duration: track.duration,
      link: track.link
    }));
    res.json(tracks);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// GET /recent
app.get('/recent', async (req, res) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/chart`);
    const tracks = data.tracks.data.map(track => ({
      title: track.title,
      artist: track.artist.name,
      album: track.album.title,
      album_cover: track.album.cover_medium,
      preview_url: track.preview,
      duration: track.duration,
      link: track.link
    }));
    res.json(tracks);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// GET /artist?q=Anirudh
app.get('/artist', async (req, res) => {
  const query = req.query.q;
  try {
    const search = await axios.get(`${BASE_URL}/search/artist?q=${encodeURIComponent(query)}`);
    const artistId = search.data.data?.[0]?.id;
    if (!artistId) return res.status(404).json({ error: 'Artist not found' });

    const topTracksRes = await axios.get(`${BASE_URL}/artist/${artistId}/top?limit=10`);
    const tracks = topTracksRes.data.data.map(track => ({
      title: track.title,
      album: track.album.title,
      album_cover: track.album.cover_medium,
      preview_url: track.preview,
      duration: track.duration,
      link: track.link
    }));

    res.json({
      artist: search.data.data[0].name,
      picture: search.data.data[0].picture_medium,
      tracks
    });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
