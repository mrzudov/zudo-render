const express = require("express");
const multer = require("multer");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
const upload = multer();

app.use(express.static(".")); // phục vụ index.html

app.post("/render", upload.single("image"), async (req, res) => {
  const prompt = req.body.prompt || "photorealistic, ultra detailed architecture";
  const imageBuffer = req.file?.buffer;

  if (!imageBuffer) {
    return res.status(400).json({ error: "Không nhận được ảnh." });
  }

  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
      {
        inputs: prompt,
        image: imageBuffer.toString("base64")
      },
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    const result = response.data;
    const image = result?.image_base64;
    if (!image) throw new Error("Không có ảnh trả về.");

    res.json({ image_url: "data:image/png;base64," + image });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi render", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("✅ Zudo Render đang chạy tại http://localhost:" + PORT));
