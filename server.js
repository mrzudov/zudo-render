const express = require("express");
const cors = require("cors");
const multer = require("multer");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config();

const app = express();
const upload = multer();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Zudo Render backend hoạt động.");
});

app.post("/render", upload.single("image"), async (req, res) => {
  const imageBuffer = req.file.buffer;
  const prompt = req.body.prompt;

  try {
    const base64Image = imageBuffer.toString("base64");

    const response = await fetch("https://api.laozhang.ai/generate/sora-img", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SORA_API_KEY}`,
      },
      body: JSON.stringify({
        image: `data:image/png;base64,${base64Image}`,
        prompt: prompt,
      }),
    });

    const result = await response.json();
    console.log("Kết quả từ LaoZhang:", result);

    res.json({ image_url: result.data?.image });
  } catch (error) {
    console.error("Lỗi render:", error);
    res.status(500).json({ error: "Lỗi khi render ❌" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Zudo render backend chạy tại cổng ${PORT}`);
});
