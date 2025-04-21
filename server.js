const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = 3000;

// Enable CORS for your frontend
app.use(cors({
    origin: 'http://127.0.0.1:5500'
}));

const shopifyConfig = {
    storeUrl: '738eda.myshopify.com',
    adminAccessToken: 'shpat_1234567890' // Replace with your Admin API access token
};

// Proxy endpoint for fetching files
app.get('/api/file/:fileId', async (req, res) => {
    try {
        const response = await fetch(`https://${shopifyConfig.storeUrl}/admin/api/2024-04/files/${req.params.fileId}.json`, {
            headers: {
                'X-Shopify-Access-Token': shopifyConfig.adminAccessToken,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Failed to fetch file data' });
    }
});

app.listen(port, () => {
    console.log(`Proxy server running at http://localhost:${port}`);
}); 