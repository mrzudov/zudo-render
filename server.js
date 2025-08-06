const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const axios = require("axios");

const app = express();
const upload = multer({ dest: "uploads/" });
app.use(cors());
app.use(express.static("public"));

app.post("/render", upload.single("image"), async (req, res) => {
  const prompt = req.body.prompt;
  const imagePath = req.file.path;

  try {
    const imageData = fs.readFileSync(imagePath);
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2",
      imageData,
      {
        headers: {
          "Content-Type": "image/png",
          "Accept": "application/json"
        },
        params: {
          inputs: prompt
        }
      }
    );

    const result = response.data;
    console.log("Kết quả từ HuggingFace:", result);
    res.json({ result });
  } catch (err) {
    console.error("Lỗi render:", err.message);
    res.status(500).json({ error: "Render thất bại", details: err.message });
  } finally {
    fs.unlinkSync(imagePath);
  }
});

app.listen(3000, () => {
  console.log("Zudo Render backend chạy tại http://localhost:3000");
});
