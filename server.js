const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());

const upload = multer(); // Nhận form-data

app.post('/render', upload.single('image'), async (req, res) => {
  const { prompt } = req.body;
  const imageBuffer = req.file?.buffer;

  if (!imageBuffer) {
    return res.status(400).json({ error: 'Không nhận được ảnh nào cả.' });
  }

  try {
    const apiResponse = await axios.post(
      'https://api.laozhang.ai/sdapi/v1/img2img',
      {
        init_images: [`data:image/png;base64,${imageBuffer.toString('base64')}`],
        prompt: prompt || "masterpiece, architectural rendering"
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.SORA_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const resultBase64 = apiResponse.data?.images?.[0];
    res.json({ image_url: `data:image/png;base64,${resultBase64}` });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi từ API render hoặc server.' });
  }
  
});

app.get("/", (req, res) => {
  res.send("✅ Zudo Render backend hoạt động!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Zudo Server đang chạy ở cổng ${PORT}`));
