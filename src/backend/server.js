import express from 'express';
import { spawn } from 'child_process';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

app.post('/generate', (req, res) => {
    const { sector, format } = req.body;

    if (!sector || !format) {
        return res.status(400).json({ error: 'sector and format required' });
    }

    const args = ['src/index.js', sector, format];
    const process = spawn('node', args);

    process.stdout.on('data', (data) => {
        console.log(`[stdout]: ${data}`);
    });

    process.stderr.on('data', (data) => {
        console.error(`[stderr]: ${data}`);
    });

    process.on('close', (code) => {
        if (code === 0) {
            res.status(200).json({ status: 'ok' });
        } else {
            res.status(500).json({ status: 'error', code });
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Backend server listening on http://localhost:${PORT}`);
});