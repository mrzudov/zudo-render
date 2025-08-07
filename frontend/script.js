document.getElementById('render-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const imageInput = document.getElementById('image-input');
  const promptInput = document.getElementById('prompt-input');
  const originalImage = document.getElementById('original-image');
  const renderedImage = document.getElementById('rendered-image');
  const status = document.getElementById('status');

  const file = imageInput.files[0];
  if (!file) return;

  // Hiện hình gốc
  const reader = new FileReader();
  reader.onload = () => {
    originalImage.src = reader.result;
  };
  reader.readAsDataURL(file);

  // Hiện thông báo đang xử lý
  status.style.display = 'block';
  renderedImage.src = '';

  const formData = new FormData();
  formData.append('image', file);
  formData.append('prompt', promptInput.value);

  try {
    const res = await fetch('https://zudo-render-backend.onrender.com/render', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (data && data.image_url) {
      renderedImage.src = data.image_url;
    } else {
      alert('Render thất bại!');
    }
  } catch (err) {
    alert('Lỗi kết nối đến backend.');
  }

  status.style.display = 'none';
});
