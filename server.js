const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const axios = require("axios");

const app = express();
const upload = multer({ dest: "uploads/" });
app.use(cors());

const API_KEY = "sk-hfHQQPT05bIHWaWs63Cf861622Bc4a3bAa8eD80b868dD024"; // LaoZhang API key

app.post("/render", upload.single("image"), async (req, res) => {
  const prompt = req.body.prompt;
  const imagePath = req.file.path;

  try {
    const imgData = fs.readFileSync(imagePath).toString("base64");

    const response = await axios.post(
      "https://api.laozhang.ai/sdapi/v1/img2img",
      {
        init_images: ["data:image/png;base64," + imgData],
        prompt: prompt,
        denoising_strength: 0.75
      },
      {
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const outputImage = response.data.images[0]; // base64

    res.json({ image_url: "data:image/png;base64," + outputImage });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi render", details: err.message });
  } finally {
    fs.unlinkSync(imagePath); // Xoá file tạm
  }
});

app.listen(3000, () => {
  console.log("Zudo Render backend chạy tại http://localhost:3000");
});
