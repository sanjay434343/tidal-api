const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const BASE_URL = 'https://api.deezer.com';

// Sort tracks by release date
function sortByYear(arr, order = 'desc') {
  return arr.sort((a, b) => {
    const dateA = new Date(a.release_date || '1900-01-01');
    const dateB = new Date(b.release_date || '1900-01-01');
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
}

// 🎵 General Search
app.get('/search', async (req, res) => {
  const query = req.query.q;
  const year = req.query.year;
  const sort = req.query.sort || 'desc';

  if (!query) return res.status(400).json({ error: 'Missing query param `q`' });

  try {
    const { data } = await axios.get(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);

    let results = data.data.map(track => ({
      title: track.title,
      artist: track.artist.name,
      album: track.album.title,
      album_cover: track.album.cover_medium,
      preview_url: track.preview,
      duration: track.duration,
      release_date: track.release_date || track.album?.release_date || '',
      link: track.link
    }));

    if (year) {
      results = results.filter(t => t.release_date && t.release_date.startsWith(year));
    }

    results = sortByYear(results, sort);

    res.json({ total: results.length, results });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

// 👤 Artist Search
app.get('/artist', async (req, res) => {
  const artistName = req.query.q;
  const year = req.query.year;
  const sort = req.query.sort || 'desc';

  if (!artistName) return res.status(400).json({ error: 'Missing query param `q`' });

  try {
    const { data } = await axios.get(`${BASE_URL}/search?q=artist:"${encodeURIComponent(artistName)}"`);

    let tracks = data.data.map(track => ({
      title: track.title,
      artist: track.artist.name,
      album: track.album.title,
      album_cover: track.album.cover_medium,
      preview_url: track.preview,
      duration: track.duration,
      release_date: track.release_date || track.album?.release_date || '',
      link: track.link
    }));

    if (year) {
      tracks = tracks.filter(t => t.release_date && t.release_date.startsWith(year));
    }

    tracks = sortByYear(tracks, sort);

    res.json({ artist: artistName, total: tracks.length, tracks });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// 💿 Album Search
app.get('/albums', async (req, res) => {
  const query = req.query.q;

  if (!query) return res.status(400).json({ error: 'Missing query param `q`' });

  try {
    const { data } = await axios.get(`${BASE_URL}/search/album?q=${encodeURIComponent(query)}`);

    const results = data.data.map(album => ({
      title: album.title,
      id: album.id,
      cover: album.cover_medium,
      artist: album.artist.name,
      link: album.link
    }));

    res.json({ total: results.length, results });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// 🏠 Home
app.get('/', (req, res) => {
  res.send('🎵 Tidal API Proxy — Use /search, /artist, /albums');
});

// 🚀 Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎧 Server running at http://localhost:${PORT}`);
});
