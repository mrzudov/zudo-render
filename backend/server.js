import express from 'express';
import cors from 'cors';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const upload = multer();
app.use(cors());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.post('/render', upload.single('image'), async (req, res) => {
  try {
    const imageBuffer = req.file.buffer;
    const prompt = req.body.prompt;

    const formData = new FormData();
    formData.append('image', imageBuffer, { filename: 'input.png' });
    formData.append('prompt', prompt);

    const apiResponse = await axios.post(
      'https://api-inference.huggingface.co/models/Sanster/Realistic_Vision_V5.1',
      formData,
      { headers: formData.getHeaders(), responseType: 'arraybuffer' }
    );

    res.set('Content-Type', 'image/png');
    res.send(apiResponse.data);
  } catch (error) {
    res.status(500).json({ error: 'Render thất bại.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Zudo Render Backend running at http://localhost:${PORT}`);
});
