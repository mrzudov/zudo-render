
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.static("public"));

// Image to Image
app.post("/render", upload.single("image"), async (req, res) => {
  const prompt = req.body.prompt;
  const imagePath = req.file.path;

  try {
    const form = new FormData();
    form.append("inputs", fs.createReadStream(imagePath));
    form.append("parameters", JSON.stringify({ prompt }));
    form.append("options", JSON.stringify({ wait_for_model: true }));

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/SG161222/Realistic_Vision_V6.0_B1_noVAE",
      form,
      {
        headers: form.getHeaders(),
        responseType: "arraybuffer",
        timeout: 120000
      }
    );

    const base64Image = Buffer.from(response.data, "binary").toString("base64");
    res.json({ image_url: `data:image/png;base64,${base64Image}` });

  } catch (err) {
    res.status(500).json({ error: "Lỗi render từ HuggingFace", details: err.message });
  } finally {
    fs.unlinkSync(imagePath);
  }
});

// Text to Image
app.post("/text2img", express.urlencoded({ extended: true }), async (req, res) => {
  const prompt = req.body.prompt;

  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/SG161222/Realistic_Vision_V6.0_B1_noVAE",
      { inputs: prompt, options: { wait_for_model: true } },
      { responseType: "arraybuffer", timeout: 120000 }
    );

    const base64Image = Buffer.from(response.data, "binary").toString("base64");
    res.json({ image_url: `data:image/png;base64,${base64Image}` });

  } catch (err) {
    res.status(500).json({ error: "Lỗi render Text-to-Image", details: err.message });
  }
});

app.listen(3000, () => {
  console.log("✅ Zudo Render backend đang chạy tại http://localhost:3000");
});
