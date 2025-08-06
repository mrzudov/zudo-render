const express = require("express");
const multer = require("multer");
const cors = require("cors");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });
app.use(cors());

app.post("/render", upload.single("image"), async (req, res) => {
try {
const imagePath = req.file.path;
const prompt = req.body.prompt;

const form = new FormData();
form.append("image", fs.createReadStream(imagePath));
form.append("prompt", prompt);

const response = await axios.post(
"https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
form,
{
headers: {
...form.getHeaders(),
},
responseType: "arraybuffer",
}
);

fs.unlinkSync(imagePath); // xóa ảnh sau khi dùng

res.set("Content-Type", "image/png");
res.send(response.data);
} catch (err) {
console.error(err.message);
res.status(500).send("Lỗi khi render ảnh.");
}
});

app.get("/", (req, res) => {
res.send("Zudo Render Backend hoạt động!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`Zudo Render backend chạy tại cổng ${PORT}`);
});