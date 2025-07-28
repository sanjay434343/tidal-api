// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Missing query parameter `q`" });

  try {
    const response = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(query)}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
