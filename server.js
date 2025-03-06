const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const MANIFEST = {
    id: "xtream-login-addon",
    version: "1.0.0",
    name: "Xtream Login for Stremio",
    description: "Login to Xtream Codes and stream IPTV in Stremio.",
    types: ["tv", "channel", "movie"],
    idPrefixes: ["xtream"],
    catalogs: [],
    resources: ["stream"],
};

app.get("/manifest.json", (req, res) => {
    res.json(MANIFEST);
});

app.post("/login", async (req, res) => {
    const { username, password, server } = req.body;
    if (!username || !password || !server) {
        return res.status(400).json({ error: "Missing credentials" });
    }

    try {
        const response = await axios.get(`${server}/player_api.php`, {
            params: { username, password }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to login to Xtream Codes" });
    }
});

app.get("/stream/:contentType/:vodId", async (req, res) => {
    const { contentType, vodId } = req.params;
    const { username, password, server } = req.query;
    if (!username || !password || !server) {
        return res.status(400).json({ error: "Missing credentials" });
    }

    try {
        const detailsResponse = await axios.get(`${server}/player_api.php`, {
            params: { username, password, action: "get_vod_info", vod_id: vodId }
        });
        
        const title = detailsResponse.data.info.name;
        const streamUrl = `${server}/movie/${username}/${password}/${vodId}.m3u8`;
        
        res.json({
            streams: [{
                url: streamUrl,
                title: title,
                name: title
            }]
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch VOD details" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Xtream Login Addon running on port ${PORT}`);
});
