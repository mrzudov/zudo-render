const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const axios = require("axios");

const app = express();
const upload = multer({ dest: "uploads/" });
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.post("/render", upload.single("image"), async (req, res) => {
  const prompt = req.body.prompt;
  const imagePath = req.file.path;

  try {
    const imgData = fs.readFileSync(imagePath).toString("base64");

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/SG161222/Realistic_Vision_V6.0_B1_noVAE",
      {
        inputs: {
          prompt: prompt,
          image: `data:image/png;base64,${imgData}`,
        },
        options: {
          wait_for_model: true
        }
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const output = response.data;
    if (output && output.length > 0 && output[0].image) {
      res.json({ image_url: output[0].image });
    } else {
      res.status(500).json({ error: "Không nhận được ảnh từ HuggingFace" });
    }

  } catch (err) {
    res.status(500).json({ error: "Lỗi khi render", details: err.message });
  } finally {
    fs.unlinkSync(imagePath);
  }
});

app.listen(3000, () => {
  console.log("✅ Zudo Render backend đang chạy tại http://localhost:3000");
});
