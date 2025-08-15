const express = require('express');
const multer = require('multer');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// Cấu hình multer để xử lý upload ảnh
const upload = multer({ storage: multer.memoryStorage() });

// Phục vụ file tĩnh từ thư mục public
app.use(express.static('public'));

// Route xử lý render ảnh
app.post('/render', upload.single('image'), async (req, res) => {
    try {
        // Giả lập gọi API Replicate (thay bằng API key thật của bạn)
        const replicateApiKey = process.env.REPLICATE_API_KEY; // Lưu API key trong biến môi trường
        const response = await axios.post('https://api.replicate.com/v1/predictions', {
            version: 'YOUR_MODEL_VERSION', // Thay bằng version của mô hình Stable Diffusion trên Replicate
            input: {
                image: req.file.buffer.toString('base64'),
                prompt: 'High-quality architectural rendering, professional design, realistic lighting'
            }
        }, {
            headers: {
                'Authorization': `Token ${replicateApiKey}`,
                'Content-Type': 'application/json'
            }
        });

        // Lấy URL ảnh render từ Replicate (giả lập, cần điều chỉnh theo API thực tế)
        const imageUrl = response.data.output[0]; // Cần xử lý đúng theo response của Replicate
        res.json({ imageUrl });
    } catch (error) {
        console.error('Lỗi render:', error);
        res.status(500).json({ error: 'Không thể render ảnh' });
    }
});

app.listen(port, () => {
    console.log(`Server chạy tại http://localhost:${port}`);
});
