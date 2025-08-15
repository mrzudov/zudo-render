document.getElementById('uploadImage').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('originalImage').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('renderButton').addEventListener('click', async function() {
    const fileInput = document.getElementById('uploadImage');
    if (!fileInput.files[0]) {
        alert('Vui lòng tải lên ảnh trước!');
        return;
    }

    const formData = new FormData();
    formData.append('image', fileInput.files[0]);

    try {
        const response = await fetch('/render', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.imageUrl) {
            document.getElementById('renderedImage').src = result.imageUrl;
            const downloadLink = document.getElementById('downloadLink');
            downloadLink.href = result.imageUrl;
            downloadLink.classList.remove('hidden');
        } else {
            alert('Không thể render ảnh. Vui lòng thử lại!');
        }
    } catch (error) {
        console.error('Lỗi:', error);
        alert('Đã có lỗi xảy ra. Vui lòng thử lại!');
    }
});
