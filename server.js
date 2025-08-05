const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

const app = express();
const upload = multer({ dest: "uploads/" });
app.use(cors());

const API_KEY = "sk-hfHQQPT05bIHWaWs63Cf861622Bc4a3bAa8eD80b868dD024"; // <- Mày đổi lại nếu cần

app.post("/render", upload.single("image"), async (req, res) => {
  const prompt = req.body.prompt;
  const imagePath = req.file.path;

  try {
    const formData = new FormData();
    formData.append("image", fs.createReadStream(imagePath));
    formData.append("prompt", prompt);

    const response = await axios.post(
      "https://api.laozhang.ai/generate/sora-img",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${API_KEY}`
        },
        timeout: 60000 // 60s timeout
      }
    );

    const resultImageUrl = response.data?.data?.url;
    console.log("✅ Kết quả từ LaoZhang:", resultImageUrl);

    if (resultImageUrl) {
      res.json({ image_url: resultImageUrl });
    } else {
      res.status(500).json({ error: "Không nhận được ảnh từ API LaoZhang" });
    }
  } catch (err) {
    console.error("❌ Lỗi khi render:", err.message);
    res.status(500).json({ error: "Lỗi khi render", details: err.message });
  } finally {
    fs.unlinkSync(imagePath); // Xoá ảnh tạm
  }
});

app.listen(3000, () => {
  console.log("Zudo Render backend hoạt động tại http://localhost:3000");
});
