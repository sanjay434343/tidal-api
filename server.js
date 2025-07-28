// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const HIFI_BASE = 'https://hifi.401658.xyz';

app.get('/search', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: 'Missing q param' });
  try {
    const response = await axios.get(`${HIFI_BASE}/search/`, {
      params: { query: q }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

app.get('/track', async (req, res) => {
  const id = req.query.id;
  const quality = req.query.quality || 'LOSSLESS';
  if (!id) return res.status(400).json({ error: 'Missing id param' });
  try {
    const response = await axios.get(`${HIFI_BASE}/track/`, {
      params: { id, quality }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy listening on port ${PORT}`));
