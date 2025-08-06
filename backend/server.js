import express from 'express';
import cors from 'cors';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.post('/render', upload.single('image'), async (req, res) => {
  try {
    const imagePath = req.file.path;
    const prompt = req.body.prompt || 'default prompt';

    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));
    form.append('prompt', prompt);

    const response = await axios.post(
      'https://api-inference.huggingface.co/models/your-model-name',
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
      }
    );

    fs.unlinkSync(imagePath); // Xoá ảnh tạm sau khi xong
    res.send(response.data);
  } catch (err) {
    console.error('❌ Render error:', err);
    res.status(500).json({ error: 'Failed to render image' });
  }
});

app.listen(port, () => {
  console.log(`✅ Zudo Render backend đang chạy tại http://localhost:${port}`);
});
