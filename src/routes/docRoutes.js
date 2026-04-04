import express from 'express';
import path from 'path';
import { apiData } from '../docs/apiData.js';

const router = express.Router();
const __dirname = path.resolve();

// Serve the documentation HTML
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/docs/apiExplorer.html'));
});

// Serve the documentation logic
router.get('/explorer.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/docs/explorer.js'));
});

// Serve the documentation metadata for the frontend
router.get('/apiData', (req, res) => {
    res.json(apiData);
});

export default router;
