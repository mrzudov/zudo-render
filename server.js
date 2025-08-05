const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const axios = require("axios");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dùng API Key mới
const API_KEY = "sk-hfHQQPT05bIHWaWs63Cf861622Bc4a3bAa8eD80b868dD024";

app.post("/render", upload.single("image"), async (req, res) => {
  const prompt = req.body.prompt;
  const imagePath = req.file?.path;

  if (!prompt || !imagePath) {
    return res.status(400).json({ error: "Thiếu prompt hoặc hình ảnh" });
  }

  try {
    const imgData = fs.readFileSync(imagePath, { encoding: "base64" });

    const response = await axios.post(
      "https://api.laozhang.ai/sdapi/v1/img2img",
      {
        init_images: ["data:image/png;base64," + imgData],
        prompt: prompt,
        denoising_strength: 0.75,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 60000, // chờ tối đa 60s
      }
    );

    const outputImage = response.data?.images?.[0];
    if (!outputImage) {
      return res.status(500).json({ error: "Không nhận được ảnh từ AI" });
    }

    res.json({ image_url: "data:image/png;base64," + outputImage });
  } catch (err) {
    console.error("Render lỗi:", err?.message);
    res.status(500).json({ error: "Lỗi mạng hoặc server", detail: err?.message });
  } finally {
    if (imagePath) fs.unlinkSync(imagePath); // xoá hình gốc
  }
});

app.listen(3000, () => {
  console.log("✅ Zudo Render backend đang chạy tại http://localhost:3000");
});
