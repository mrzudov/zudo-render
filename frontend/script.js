document.getElementById('render-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const prompt = document.getElementById('prompt').value;
  const imageFile = document.getElementById('image').files[0];

  if (!prompt || !imageFile) {
    alert('Vui lòng nhập prompt và chọn ảnh.');
    return;
  }

  const formData = new FormData();
  formData.append('prompt', prompt);
  formData.append('image', imageFile);

  document.getElementById('result').innerHTML = 'Đang render...';

  try {
    const response = await fetch('https://zudo-render-backend.onrender.com/render', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error('Render thất bại');

    const data = await response.json();
    const imageUrl = data.image_url;

    document.getElementById('result').innerHTML = `<img src="${imageUrl}" style="max-width:100%; margin-top:20px;" />`;
  } catch (err) {
    console.error(err);
    document.getElementById('result').innerText = 'Lỗi khi render ảnh.';
  }
});
