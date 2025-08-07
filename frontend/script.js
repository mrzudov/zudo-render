document.getElementById('render-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const imageInput = document.getElementById('image');
  const promptInput = document.getElementById('prompt');
  const originalImage = document.getElementById('original-image');
  const resultImage = document.getElementById('result-image');
  const progressText = document.getElementById('progress-text');
  const progressBar = document.getElementById('progress-bar');

  const file = imageInput.files[0];
  const prompt = promptInput.value;

  if (!file || !prompt) return alert('Chọn ảnh và nhập mô tả trước khi render.');

  const formData = new FormData();
  formData.append('image', file);
  formData.append('prompt', prompt);

  originalImage.src = URL.createObjectURL(file);
  resultImage.src = '';
  progressText.textContent = 'Đang render...';
  progressBar.style.width = '0%';

  // Giả lập tiến trình % cho cảm giác real
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 10) + 5;
    if (progress >= 95) {
      clearInterval(interval);
      progressText.textContent = 'Gần xong...';
      progressBar.style.width = '95%';
    } else {
      progressText.textContent = `${progress}%`;
      progressBar.style.width = `${progress}%`;
    }
  }, 1000);

  try {
    const response = await fetch('https://zudo-render-backend.onrender.com/render', {
      method: 'POST',
      body: formData,
    });

    clearInterval(interval);
    progressText.textContent = 'Hoàn tất 100%';
    progressBar.style.width = '100%';

    const blob = await response.blob();
    resultImage.src = URL.createObjectURL(blob);
  } catch (error) {
    clearInterval(interval);
    progressText.textContent = 'Lỗi khi render.';
    progressBar.style.width = '0%';
    alert('Có lỗi xảy ra.');
  }
});
