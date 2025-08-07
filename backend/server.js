const form = document.getElementById('render-form');
const imageInput = document.getElementById('image');
const promptInput = document.getElementById('prompt');
const originalImg = document.getElementById('original-img');
const resultImg = document.getElementById('result-img');
const progress = document.getElementById('progress');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const file = imageInput.files[0];
  const prompt = promptInput.value;
  if (!file || !prompt) return;

  originalImg.src = URL.createObjectURL(file);
  resultImg.src = '';
  progress.textContent = 'Đang xử lý (0%)...';

  const formData = new FormData();
  formData.append('image', file);
  formData.append('prompt', prompt);

  const start = Date.now();

  try {
    const response = await fetch('https://zudo-render-backend.onrender.com/render', {
      method: 'POST',
      body: formData
    });

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    resultImg.src = url;

    const duration = ((Date.now() - start) / 1000).toFixed(1);
    progress.textContent = `Hoàn tất sau ${duration} giây`;
  } catch (err) {
    progress.textContent = 'Lỗi render. Vui lòng thử lại.';
    console.error(err);
  }
});
