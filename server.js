const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
app.use(cors());
const upload = multer({ dest: 'uploads/' });

app.post('/render', upload.single('image'), async (req, res) => {
  const imagePath = req.file.path;
  const prompt = req.body.prompt;

  const form = new FormData();
  form.append("image", fs.createReadStream(imagePath));
  form.append("prompt", prompt);

  try {
    const response = await axios.post(
      'https://hf.space/embed/hogiahien/cinematic-vision/+/api/predict/',
      form,
      { headers: form.getHeaders() }
    );

    const output_url = response.data.data?.[0]; // link ảnh
    res.json({ output_url });

  } catch (err) {
    console.error("Lỗi render HuggingFace:", err.message);
    res.status(500).json({ error: "Render thất bại" });
  } finally {
    fs.unlinkSync(imagePath); // xóa file sau khi xử lý
  }
});

app.listen(3000, () => {
  console.log("Zudo Render đang chạy tại http://localhost:3000");
});
