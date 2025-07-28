const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

const BASE_URL = 'https://api.deezer.com';

// 🔍 General Search with Year
app.get('/search', async (req, res) => {
  const query = req.query.q;
  try {
    const { data } = await axios.get(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
    const resultsWithYear = data.data.map(item => ({
      title: item.title,
      artist: item.artist.name,
      album: item.album.title,
      album_cover: item.album.cover_medium,
      preview_url: item.preview,
      duration: item.duration,
      link: item.link,
      year: item.release_date ? item.release_date.slice(0, 4) : 'Unknown'
    }));

    res.json({
      total: resultsWithYear.length,
      results: resultsWithYear
    });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

// 🎵 Recent Songs by Artist with Year
app.get('/artist', async (req, res) => {
  const query = req.query.q;
  try {
    const { data } = await axios.get(`${BASE_URL}/search?q=artist:"${encodeURIComponent(query)}"`);

    if (!data || !data.data || data.data.length === 0) {
      return res.status(404).json({ error: 'No songs found for this artist' });
    }

    const tracksWithYear = await Promise.all(data.data.slice(0, 20).map(async (track) => {
      let year = 'Unknown';
      try {
        const albumData = await axios.get(`${BASE_URL}/album/${track.album.id}`);
        year = albumData.data.release_date?.slice(0, 4) || 'Unknown';
      } catch {}

      return {
        title: track.title,
        artist: track.artist.name,
        album: track.album.title,
        album_cover: track.album.cover_medium,
        preview_url: track.preview,
        duration: track.duration,
        link: track.link,
        year
      };
    }));

    res.json({
      artist: query,
      total: tracksWithYear.length,
      tracks: tracksWithYear
    });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// 💿 Recent Albums by Artist with Year
app.get('/albums', async (req, res) => {
  const artistName = req.query.q;
  try {
    const searchRes = await axios.get(`${BASE_URL}/search/artist?q=${encodeURIComponent(artistName)}`);
    const artist = searchRes.data.data[0];

    if (!artist) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    const albumsRes = await axios.get(`${BASE_URL}/artist/${artist.id}/albums`);
    const albums = albumsRes.data.data.slice(0, 10).map(album => ({
      title: album.title,
      cover: album.cover_medium,
      tracklist: album.tracklist,
      release_date: album.release_date,
      year: album.release_date?.slice(0, 4) || 'Unknown',
      link: album.link
    }));

    res.json({
      artist: artist.name,
      albums
    });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

// 🟢 Start Server
app.listen(PORT, () => {
  console.log(`Tidal proxy running on port ${PORT}`);
});
