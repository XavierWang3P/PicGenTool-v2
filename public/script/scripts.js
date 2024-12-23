document.addEventListener('DOMContentLoaded', function() {
    // 日期选择器初始化
    $('#date').datepicker({
        format: 'yyyy-mm-dd',
        autoclose: true,
        language: 'zh-CN',
        todayHighlight: true
    });

    // 拖放区域处理
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('images');

    // 阻止默认拖放行为
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // 高亮拖放区域
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        dropArea.classList.add('highlight');
    }

    function unhighlight(e) {
        dropArea.classList.remove('highlight');
    }

    // 处理拖放的文件
    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 30) {
            alert('最多只能上传30张图片');
            return;
        }
        
        // 检查文件类型
        const validFiles = Array.from(files).every(file => file.type.startsWith('image/'));
        if (!validFiles) {
            alert('只能上传图片文件');
            return;
        }
        
        // 更新文件输入框的文件
        const dataTransfer = new DataTransfer();
        Array.from(files).forEach(file => {
            dataTransfer.items.add(file);
        });
        fileInput.files = dataTransfer.files;
        
        updatePreview(files);
    }

    // 点击拖放区域触发文件选择
    dropArea.addEventListener('click', () => {
        fileInput.click();
    });

    // 清空按钮处理
    document.getElementById('clearButton').addEventListener('click', function() {
        document.getElementById('documentForm').reset();
        document.getElementById('preview').innerHTML = '';
    });

    // 表单提交处理
    document.getElementById('documentForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="bi bi-hourglass-split pe-2"></i>正在生成...';
        
        const formData = new FormData(this);
        
        try {
            const response = await fetch('/generate', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            // 处理文件下载
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const contentDisposition = response.headers.get('content-disposition');
            let filename = 'document.docx';
            
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/);
                if (filenameMatch) {
                    filename = decodeURIComponent(filenameMatch[1]);
                }
            }

            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            // 显示成功消息
            document.getElementById('result').innerHTML = `
                <div class="alert alert-success" role="alert">
                    <i class="bi bi-check-circle pe-2"></i>文档生成成功
                </div>
            `;

        } catch (error) {
            console.error('Error:', error);
            document.getElementById('result').innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <i class="bi bi-exclamation-triangle pe-2"></i>${error.message}
                </div>
            `;
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    });
});

// 更新预览
function updatePreview(files) {
    if (!files || files.length === 0) return;

    const preview = document.getElementById('preview');
    preview.innerHTML = ''; // 清空现有预览

    Array.from(files).forEach((file, index) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            const div = document.createElement('div');
            div.className = 'preview-item';
            
            reader.onload = function(e) {
                div.innerHTML = `
                    <img src="${e.target.result}" alt="预览图片 ${index + 1}">
                    <div class="preview-filename">${file.name}</div>
                `;
            };
            
            reader.readAsDataURL(file);
            preview.appendChild(div);
        }
    });
}