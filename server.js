const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const axios = require("axios");

const app = express();
const upload = multer({ dest: "uploads/" });
app.use(cors());

const API_KEY = "sk-hfHQQPT05bIHWaWs63Cf861622Bc4a3bAa8eD80b868dD024"; // Thay đúng key

// Route kiểm tra server sống
app.get("/", (req, res) => {
  res.send("✅ Zudo Render backend đang chạy. Gửi POST tới /render để sử dụng.");
});

// Route render
app.post("/render", upload.single("image"), async (req, res) => {
  const prompt = req.body.prompt;
  const imagePath = req.file?.path;

  if (!prompt || !imagePath) {
    return res.status(400).json({ error: "Thiếu prompt hoặc ảnh" });
  }

  try {
    const imgData = fs.readFileSync(imagePath, { encoding: "base64" });

    const response = await axios.post(
      "https://api.laozhang.ai/sdapi/v1/img2img", // <-- Đảm bảo URL này là đúng
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

    console.log("✅ Toàn bộ phản hồi từ LaoZhang:", response.data);

    const base64Image = response.data?.images?.[0];

    if (!base64Image) {
      return res.status(500).json({ error: "Không nhận được ảnh từ API LaoZhang" });
    }

    res.json({ image_url: "data:image/png;base64," + base64Image });

  } catch (err) {
    console.error("❌ Lỗi khi gọi LaoZhang:", err.response?.data || err.message);
    res.status(500).json({
      error: "Lỗi khi render",
      details: err.response?.data || err.message
    });
  } finally {
    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath); // Xoá ảnh tạm
    }
  }
});

app.listen(3000, () => {
  console.log("🚀 Zudo Render backend chạy tại http://localhost:3000");
});
