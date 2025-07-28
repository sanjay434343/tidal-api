const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

const BASE_URL = 'https://api.deezer.com';

// Utility: Sort by year
function sortByYear(tracks, order = 'desc') {
  return tracks.sort((a, b) => {
    const yearA = parseInt(a.release_date?.substring(0, 4)) || 0;
    const yearB = parseInt(b.release_date?.substring(0, 4)) || 0;
    return order === 'asc' ? yearA - yearB : yearB - yearA;
  });
}

// 🔍 General search with year and sort
app.get('/search', async (req, res) => {
  const query = req.query.q;
  const year = req.query.year;
  const sort = req.query.sort || 'desc';

  try {
    const { data } = await axios.get(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);

    let filtered = data.data.map(track => ({
      title: track.title,
      artist: track.artist.name,
      album: track.album.title,
      album_cover: track.album.cover_medium,
      preview_url: track.preview,
      duration: track.duration,
      release_date: track.release_date || '',
      link: track.link
    }));

    if (year) {
      filtered = filtered.filter(t => t.release_date?.startsWith(year));
    }

    filtered = sortByYear(filtered, sort);

    res.json({ total: filtered.length, results: filtered });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

// 🎵 Songs by Artist (with year + sort)
app.get('/artist', async (req, res) => {
  const artistName = req.query.q;
  const year = req.query.year;
  const sort = req.query.sort || 'desc';

  try {
    const { data } = await axios.get(`${BASE_URL}/search?q=artist:"${encodeURIComponent(artistName)}"`);

    let tracks = data.data.map(track => ({
      title: track.title,
      artist: track.artist.name,
      album: track.album.title,
      album_cover: track.album.cover_medium,
      preview_url: track.preview,
      duration: track.duration,
      release_date: track.release_date || '',
      link: track.link
    }));

    if (year) {
      tracks = tracks.filter(t => t.release_date?.startsWith(year));
    }

    tracks = sortByYear(tracks, sort);

    res.json({ artist: artistName, total: tracks.length, tracks });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// 💿 Albums by Artist (with year + sort)
app.get('/albums', async (req, res) => {
  const artistName = req.query.q;
  const year = req.query.year;
  const sort = req.query.sort || 'desc';

  try {
    const searchRes = await axios.get(`${BASE_URL}/search/artist?q=${encodeURIComponent(artistName)}`);
    const artist = searchRes.data.data[0];
    if (!artist) return res.status(404).json({ error: 'Artist not found' });

    const albumsRes = await axios.get(`${BASE_URL}/artist/${artist.id}/albums`);
    let albums = albumsRes.data.data.map(album => ({
      title: album.title,
      cover: album.cover_medium,
      release_date: album.release_date,
      tracklist: album.tracklist,
      link: album.link
    }));

    if (year) {
      albums = albums.filter(a => a.release_date?.startsWith(year));
    }

    albums = sortByYear(albums, sort);

    res.json({ artist: artist.name, total: albums.length, albums });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

// 🟢 Start
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
