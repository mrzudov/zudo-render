document.getElementById('renderForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('sketch', document.getElementById('sketch').files[0]);
  formData.append('prompt', document.getElementById('prompt').value);

  // Reset giao diện
  document.getElementById('progress').style.width = '0%';
  document.getElementById('progressText').textContent = '0%';
  document.getElementById('originalImage').src = '';
  document.getElementById('renderedImage').src = '';

  try {
    const response = await fetch('/render', {
      method: 'POST',
      body: formData
    });
    const { jobId } = await response.json();

    // Polling tiến trình render
    const poll = setInterval(async () => {
      const statusResponse = await fetch(`/render-status/${jobId}`);
      const status = await statusResponse.json();

      if (status.error) {
        alert(status.error);
        clearInterval(poll);
        return;
      }

      document.getElementById('progress').style.width = `${status.progress}%`;
      document.getElementById('progressText').textContent = `${status.progress}%`;

      if (status.progress >= 100) {
        clearInterval(poll);
        document.getElementById('originalImage').src = status.original;
        document.getElementById('renderedImage').src = status.rendered;
      }
    }, 1000);
  } catch (error) {
    alert('Lỗi khi render. Vui lòng thử lại.');
  }
});
