const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const axios = require("axios");

const app = express();
const upload = multer({ dest: "uploads/" });
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route mặc định để Render kiểm tra xem server sống không
app.get("/", (req, res) => {
  res.send("Zudo Render backend is running.");
});

// Replace bằng API HuggingFace miễn phí nếu bạn dùng cái đó
app.post("/render", upload.single("image"), async (req, res) => {
  const prompt = req.body.prompt;
  const imagePath = req.file.path;

  try {
    const imgData = fs.readFileSync(imagePath).toString("base64");

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/lllyasviel/sd-controlnet-canny",
      {
        inputs: {
          prompt: prompt,
          image: "data:image/png;base64," + imgData
        }
      },
      {
        headers: {
          Authorization: "Bearer YOUR_HF_API_KEY" // hoặc không cần nếu xài model public
        }
      }
    );

    const outputImage = response.data; // response dạng gì tùy model

    res.json({ result: outputImage });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi render", details: err.message });
  } finally {
    fs.unlinkSync(imagePath);
  }
});

// 🚨 Cách lắng nghe PORT đúng chuẩn để deploy được
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Zudo Render backend đang chạy tại http://localhost:${PORT}`);
});
