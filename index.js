const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const app = express();

// Tạo thư mục uploads
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Cấu hình Multer
const upload = multer({ dest: 'uploads/' });

// Cung cấp file tĩnh
app.use(express.static(path.join(__dirname, '/')));

// Route chính
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Lưu trạng thái render
const renderJobs = new Map();

app.post('/render', upload.single('sketch'), (req, res) => {
  const prompt = req.body.prompt;
  const file = req.file;

  if (!file || !prompt) {
    return res.status(400).json({ error: 'Vui lòng cung cấp ảnh và prompt' });
  }

  const jobId = Date.now().toString();
  renderJobs.set(jobId, { progress: 0, original: `/uploads/${file.filename}`, rendered: null });

  // Giả lập API render (thay bằng API thật)
  let progress = 0;
  const interval = setInterval(() => {
    progress += 20;
    renderJobs.set(jobId, { ...renderJobs.get(jobId), progress });
    if (progress >= 100) {
      clearInterval(interval);
      renderJobs.set(jobId, {
        ...renderJobs.get(jobId),
        progress: 100,
        rendered: `/uploads/${file.filename}`
      });
    }
  }, 1000);

  res.json({ jobId });
});

app.get('/render-status/:jobId', (req, res) => {
  const job = renderJobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: 'Không tìm thấy job' });
  }
  res.json(job);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server chạy trên cổng ${PORT}`);
});
