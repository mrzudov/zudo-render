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

app.post("/render", upload.single("image"), async (req, res) => {
  const prompt = req.body.prompt;
  const imagePath = req.file.path;

  try {
    const form = new FormData();
    form.append("inputs", fs.createReadStream(imagePath));
    form.append("options", JSON.stringify({ wait_for_model: true }));
    form.append("parameters", JSON.stringify({ prompt: prompt }));

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/SG161222/Realistic_Vision_V6.0_B1_noVAE",
      form,
      {
        headers: {
          ...form.getHeaders()
        },
        maxBodyLength: Infinity,
        timeout: 120000
      }
    );

    const outputImage = response.data;

    // HuggingFace sẽ trả ảnh dạng base64 PNG hoặc trực tiếp blob
    // Giả sử nó trả file ảnh URL hoặc buffer base64
    if (outputImage && outputImage[0] && outputImage[0].image) {
      res.json({ image_url: outputImage[0].image });
    } else {
      res.status(500).json({ error: "Không nhận được ảnh từ HuggingFace." });
    }

  } catch (err) {
    res.status(500).json({ error: "Lỗi render từ HuggingFace", details: err.message });
  } finally {
    fs.unlinkSync(imagePath); // xoá ảnh tạm
  }
});

app.listen(3000, () => {
  console.log("✅ Backend đang chạy tại http://localhost:3000");
});
