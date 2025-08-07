import express from 'express';
import cors from 'cors';
import multer from 'multer';
import axios from 'axios';
import fs from 'fs';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

const upload = multer({ dest: 'uploads/' });

app.post('/render', upload.single('image'), async (req, res) => {
  try {
    const imagePath = req.file.path;
    const prompt = req.body.prompt || 'default prompt';

    // Chuẩn bị form gửi lên HuggingFace Spaces
    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));
    form.append('prompt', prompt);

    // Gửi lên Spaces (không cần token)
    const response = await axios.post(
      'https://replicate-vision-image-to-image.hf.space/api/predict',
      {
        data: [
          prompt, // prompt
          null,   // mask
          {
            name: req.file.originalname,
            type: 'image/jpeg',
            data: fs.readFileSync(imagePath).toString('base64'),
          },
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    fs.unlinkSync(imagePath); // Xoá file ảnh local sau render

    // Lấy ảnh trả về từ API
    const imageUrl = response.data?.data?.[0];

    if (!imageUrl) {
      throw new Error('Không có ảnh trả về từ HuggingFace');
    }

    res.json({ image_url: imageUrl });
  } catch (err) {
    console.error('❌ Render error:', err.message);
    res.status(500).json({ error: 'Failed to render image' });
  }
});

app.get('/', (req, res) => {
  res.send('✅ Zudo Render Backend đang chạy ngon lành!');
});

app.listen(port, () => {
  console.log(`✅ Backend chạy tại http://localhost:${port}`);
});
