import express from 'express';
import multer from 'multer';
import cors from 'cors';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(cors());

app.post('/render', upload.single('image'), async (req, res) => {
  try {
    const prompt = req.body.prompt || '';
    const filePath = req.file.path;

    const formData = new FormData();
    formData.append('image', fs.createReadStream(filePath));
    formData.append('prompt', prompt);

    const response = await axios.post(
      'https://api-inference.huggingface.co/models/SimianLuo/LCM_Dreamshaper_v7',
      formData,
      {
        headers: {
          ...formData.getHeaders()
        },
        responseType: 'arraybuffer'
      }
    );

    const imageBase64 = Buffer.from(response.data, 'binary').toString('base64');
    const imageUrl = `data:image/png;base64,${imageBase64}`;

    fs.unlinkSync(filePath);
    res.json({ image_url: imageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Render thất bại.' });
  }
});

app.listen(3000, () => {
  console.log('Server chạy ở cổng 3000');
});
