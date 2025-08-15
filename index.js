const express = require('express');
const path = require('path');
const multer = require('multer');
const app = express();

// Cấu hình Multer để lưu trữ file ảnh tạm thời
const upload = multer({ dest: 'uploads/' });

// Cung cấp file tĩnh
app.use(express.static(path.join(__dirname, '/')));

// Route chính để tránh lỗi "Cannot GET /"
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Giả lập trạng thái render (thay bằng API thật)
const renderJobs = new Map(); // Lưu trạng thái render theo jobId

app.post('/render', upload.single('sketch'), (req, res) => {
  const prompt = req.body.prompt;
  const file = req.file;

  if (!file || !prompt) {
    return res.status(400).json({ error: 'Vui lòng cung cấp ảnh và prompt' });
  }

  const jobId = Date.now().toString();
  renderJobs.set(jobId, { progress: 0, original: `/uploads/${file.filename}`, rendered: null });

  // Giả lập gọi API render và cập nhật tiến trình (thay bằng API thật)
  let progress = 0;
  const interval = setInterval(() => {
    progress += 20;
    renderJobs.set(jobId, { ...renderJobs.get(jobId), progress });
    if (progress >= 100) {
      clearInterval(interval);
      renderJobs.set(jobId, {
        ...renderJobs.get(jobId),
        progress: 100,
        rendered: `/uploads/${file.filename}` // Thay bằng URL từ API render
      });
    }
  }, 1000);

  res.json({ jobId });
});

// Route kiểm tra tiến trình render
app.get('/render-status/:jobId', (req, res) => {
  const job = renderJobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: 'Không tìm thấy job' });
  }
  res.json(job);
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server chạy trên cổng ${PORT}`);
});
