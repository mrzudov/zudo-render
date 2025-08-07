const express = require('express');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(cors());

app.post('/render', upload.single('image'), async (req, res) => {
  const prompt = req.body.prompt;
  const filePath = req.file.path;

  const form = new FormData();
  form.append('image', fs.createReadStream(filePath));
  form.append('prompt', prompt);
  form.append('num_inference_steps', '25');
  form.append('guidance_scale', '7.5');

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/lllyasviel/control_v11p_sd15_canny',
      form,
      { headers: { ...form.getHeaders() }, responseType: 'arraybuffer' }
    );

    res.set('Content-Type', 'image/png');
    res.send(response.data);
  } catch (err) {
    res.status(500).send('Render lỗi');
  } finally {
    fs.unlinkSync(filePath);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Zudo backend chạy tại http://localhost:${PORT}`));
