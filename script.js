// Image Converter Professional - JavaScript
// Advanced image conversion tool with modern UI/UX

class ImageConverter {
    constructor() {
        this.uploadedFiles = [];
        this.convertedFiles = [];
        this.isConverting = false;
        this.maintainAspectRatio = true;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.hideLoadingScreen();
        this.setupThemeToggle();
        this.setupSmoothScrolling();
    }

    // Initialize event listeners
    setupEventListeners() {
        // File upload
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');
        const uploadBtn = document.getElementById('upload-btn');

        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        uploadArea.addEventListener('drop', this.handleDrop.bind(this));
        
        fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        uploadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.click();
        });

        // Controls
        const qualitySlider = document.getElementById('quality-slider');
        const qualityValue = document.getElementById('quality-value');
        const resizeCheckbox = document.getElementById('resize-checkbox');
        const resizeOptions = document.getElementById('resize-options');
        const maintainRatioBtn = document.getElementById('maintain-ratio-btn');
        const widthInput = document.getElementById('width-input');
        const heightInput = document.getElementById('height-input');

        qualitySlider.addEventListener('input', (e) => {
            qualityValue.textContent = e.target.value;
        });

        resizeCheckbox.addEventListener('change', (e) => {
            resizeOptions.style.display = e.target.checked ? 'block' : 'none';
        });

        maintainRatioBtn.addEventListener('click', () => {
            this.maintainAspectRatio = !this.maintainAspectRatio;
            maintainRatioBtn.classList.toggle('active', this.maintainAspectRatio);
        });

        widthInput.addEventListener('input', () => {
            if (this.maintainAspectRatio && this.uploadedFiles.length > 0) {
                this.updateHeightFromWidth();
            }
        });

        heightInput.addEventListener('input', () => {
            if (this.maintainAspectRatio && this.uploadedFiles.length > 0) {
                this.updateWidthFromHeight();
            }
        });

        // Buttons
        document.getElementById('clear-all-btn').addEventListener('click', this.clearAllFiles.bind(this));
        document.getElementById('convert-btn').addEventListener('click', this.convertImages.bind(this));
        document.getElementById('download-all-btn').addEventListener('click', this.downloadAllResults.bind(this));
    }

    // Hide loading screen
    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 1500);
    }

    // Theme toggle functionality
    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        const currentTheme = localStorage.getItem('theme') || 'dark';
        
        document.documentElement.setAttribute('data-theme', currentTheme);
        this.updateThemeIcon(currentTheme);

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            this.updateThemeIcon(newTheme);
        });
    }

    updateThemeIcon(theme) {
        const themeToggle = document.getElementById('theme-toggle');
        const icon = themeToggle.querySelector('i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Smooth scrolling for navigation links
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Drag and drop handlers
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files);
        this.processFiles(files);
    }

    // File selection handler
    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.processFiles(files);
    }

    // Process selected files
    processFiles(files) {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            this.showToast('يرجى اختيار ملفات صور صالحة', 'warning');
            return;
        }

        if (imageFiles.length !== files.length) {
            this.showToast(`تم تجاهل ${files.length - imageFiles.length} ملف غير صالح`, 'warning');
        }

        imageFiles.forEach(file => {
            if (!this.uploadedFiles.find(f => f.file.name === file.name && f.file.size === file.size)) {
                this.addFileToList(file);
            }
        });

        this.updateUI();
        this.showToast(`تم رفع ${imageFiles.length} صورة بنجاح`, 'success');
    }

    // Add file to uploaded files list
    addFileToList(file) {
        const fileData = {
            id: Date.now() + Math.random(),
            file: file,
            name: file.name,
            size: this.formatFileSize(file.size),
            type: file.type,
            url: URL.createObjectURL(file)
        };

        this.uploadedFiles.push(fileData);
        this.createPreviewItem(fileData);
    }

    // Create preview item
    createPreviewItem(fileData) {
        const previewGrid = document.getElementById('preview-grid');
        
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.dataset.fileId = fileData.id;

        // Get image dimensions
        const img = new Image();
        img.onload = () => {
            const dimensions = `${img.width} × ${img.height}`;
            previewItem.innerHTML = `
                <img src="${fileData.url}" alt="${fileData.name}" class="preview-image">
                <div class="preview-info">
                    <div class="preview-name">${fileData.name}</div>
                    <div class="preview-details">
                        <span>${fileData.size}</span>
                        <span>${dimensions}</span>
                    </div>
                    <div class="preview-details">
                        <span>${fileData.type.split('/')[1].toUpperCase()}</span>
                    </div>
                    <button class="remove-btn" onclick="imageConverter.removeFile('${fileData.id}')">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </div>
            `;
        };
        img.src = fileData.url;

        previewGrid.appendChild(previewItem);
    }

    // Remove file from list
    removeFile(fileId) {
        const fileIndex = this.uploadedFiles.findIndex(f => f.id == fileId);
        if (fileIndex > -1) {
            URL.revokeObjectURL(this.uploadedFiles[fileIndex].url);
            this.uploadedFiles.splice(fileIndex, 1);
            
            const previewItem = document.querySelector(`[data-file-id="${fileId}"]`);
            if (previewItem) {
                previewItem.remove();
            }
            
            this.updateUI();
            this.showToast('تم حذف الصورة', 'success');
        }
    }

    // Clear all files
    clearAllFiles() {
        this.uploadedFiles.forEach(file => URL.revokeObjectURL(file.url));
        this.uploadedFiles = [];
        this.convertedFiles.forEach(file => URL.revokeObjectURL(file.url));
        this.convertedFiles = [];
        
        document.getElementById('preview-grid').innerHTML = '';
        document.getElementById('results-grid').innerHTML = '';
        
        this.updateUI();
        this.showToast('تم مسح جميع الصور', 'success');
    }

    // Update UI visibility
    updateUI() {
        const previewArea = document.getElementById('preview-area');
        const conversionControls = document.getElementById('conversion-controls');
        const resultsArea = document.getElementById('results-area');

        previewArea.style.display = this.uploadedFiles.length > 0 ? 'block' : 'none';
        conversionControls.style.display = this.uploadedFiles.length > 0 ? 'block' : 'none';
        resultsArea.style.display = this.convertedFiles.length > 0 ? 'block' : 'none';
    }

    // Update height based on width (maintain aspect ratio)
    updateHeightFromWidth() {
        const widthInput = document.getElementById('width-input');
        const heightInput = document.getElementById('height-input');
        
        if (this.uploadedFiles.length > 0 && widthInput.value) {
            const firstFile = this.uploadedFiles[0];
            const img = new Image();
            img.onload = () => {
                const aspectRatio = img.height / img.width;
                heightInput.value = Math.round(widthInput.value * aspectRatio);
            };
            img.src = firstFile.url;
        }
    }

    // Update width based on height (maintain aspect ratio)
    updateWidthFromHeight() {
        const widthInput = document.getElementById('width-input');
        const heightInput = document.getElementById('height-input');
        
        if (this.uploadedFiles.length > 0 && heightInput.value) {
            const firstFile = this.uploadedFiles[0];
            const img = new Image();
            img.onload = () => {
                const aspectRatio = img.width / img.height;
                widthInput.value = Math.round(heightInput.value * aspectRatio);
            };
            img.src = firstFile.url;
        }
    }

    // Convert images
    async convertImages() {
        if (this.isConverting || this.uploadedFiles.length === 0) return;

        this.isConverting = true;
        const convertBtn = document.getElementById('convert-btn');
        const originalText = convertBtn.innerHTML;
        convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحويل...';
        convertBtn.disabled = true;

        // Get conversion settings
        const outputFormat = document.getElementById('output-format').value;
        const quality = parseInt(document.getElementById('quality-slider').value) / 100;
        const shouldResize = document.getElementById('resize-checkbox').checked;
        const newWidth = shouldResize ? parseInt(document.getElementById('width-input').value) : null;
        const newHeight = shouldResize ? parseInt(document.getElementById('height-input').value) : null;

        // Show progress modal
        this.showProgressModal();

        try {
            // Clear previous results
            this.convertedFiles.forEach(file => URL.revokeObjectURL(file.url));
            this.convertedFiles = [];
            document.getElementById('results-grid').innerHTML = '';

            const totalFiles = this.uploadedFiles.length;
            
            for (let i = 0; i < totalFiles; i++) {
                const fileData = this.uploadedFiles[i];
                const progress = ((i + 1) / totalFiles) * 100;
                
                this.updateProgress(progress, `تحويل ${i + 1} من ${totalFiles}`);
                
                try {
                    const convertedFile = await this.convertSingleImage(
                        fileData, 
                        outputFormat, 
                        quality, 
                        newWidth, 
                        newHeight
                    );
                    
                    this.convertedFiles.push(convertedFile);
                    this.createResultItem(convertedFile);
                } catch (error) {
                    console.error(`Error converting ${fileData.name}:`, error);
                    this.showToast(`فشل في تحويل ${fileData.name}`, 'error');
                }
                
                // Small delay for better UX
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            this.hideProgressModal();
            this.updateUI();
            this.showToast(`تم تحويل ${this.convertedFiles.length} صورة بنجاح`, 'success');

        } catch (error) {
            console.error('Conversion error:', error);
            this.hideProgressModal();
            this.showToast('حدث خطأ أثناء التحويل', 'error');
        } finally {
            this.isConverting = false;
            convertBtn.innerHTML = originalText;
            convertBtn.disabled = false;
        }
    }

    // Convert single image
    async convertSingleImage(fileData, outputFormat, quality, newWidth, newHeight) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Set canvas dimensions
                    let { width, height } = this.calculateDimensions(
                        img.width, 
                        img.height, 
                        newWidth, 
                        newHeight
                    );

                    canvas.width = width;
                    canvas.height = height;

                    // Handle different image formats
                    if (outputFormat === 'jpeg') {
                        // Fill white background for JPEG
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillRect(0, 0, width, height);
                    }

                    // Draw image
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to blob
                    const mimeType = this.getMimeType(outputFormat);
                    
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const newFileName = this.generateFileName(fileData.name, outputFormat);
                            const convertedFile = {
                                id: Date.now() + Math.random(),
                                name: newFileName,
                                size: this.formatFileSize(blob.size),
                                type: mimeType,
                                format: outputFormat.toUpperCase(),
                                url: URL.createObjectURL(blob),
                                blob: blob,
                                dimensions: `${width} × ${height}`
                            };
                            resolve(convertedFile);
                        } else {
                            reject(new Error('Failed to convert image'));
                        }
                    }, mimeType, quality);

                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = fileData.url;
        });
    }

    // Calculate new dimensions
    calculateDimensions(originalWidth, originalHeight, newWidth, newHeight) {
        if (!newWidth && !newHeight) {
            return { width: originalWidth, height: originalHeight };
        }

        if (newWidth && newHeight) {
            return { width: newWidth, height: newHeight };
        }

        if (newWidth) {
            const aspectRatio = originalHeight / originalWidth;
            return { width: newWidth, height: Math.round(newWidth * aspectRatio) };
        }

        if (newHeight) {
            const aspectRatio = originalWidth / originalHeight;
            return { width: Math.round(newHeight * aspectRatio), height: newHeight };
        }

        return { width: originalWidth, height: originalHeight };
    }

    // Get MIME type for format
    getMimeType(format) {
        const mimeTypes = {
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'webp': 'image/webp',
            'bmp': 'image/bmp',
            'tiff': 'image/tiff',
            'ico': 'image/x-icon'
        };
        return mimeTypes[format] || 'image/png';
    }

    // Generate new filename
    generateFileName(originalName, newFormat) {
        const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
        return `${nameWithoutExt}.${newFormat}`;
    }

    // Create result item
    createResultItem(fileData) {
        const resultsGrid = document.getElementById('results-grid');
        
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.dataset.fileId = fileData.id;

        resultItem.innerHTML = `
            <img src="${fileData.url}" alt="${fileData.name}" class="result-image">
            <div class="result-info">
                <div class="result-name">${fileData.name}</div>
                <div class="result-details">
                    <span>${fileData.size}</span>
                    <span>${fileData.dimensions}</span>
                </div>
                <div class="result-details">
                    <span>${fileData.format}</span>
                </div>
                <button class="download-btn" onclick="imageConverter.downloadFile('${fileData.id}')">
                    <i class="fas fa-download"></i> تحميل
                </button>
            </div>
        `;

        resultsGrid.appendChild(resultItem);
    }

    // Download single file
    downloadFile(fileId) {
        const file = this.convertedFiles.find(f => f.id == fileId);
        if (file) {
            const link = document.createElement('a');
            link.href = file.url;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showToast(`تم تحميل ${file.name}`, 'success');
        }
    }

    // Download all results
    async downloadAllResults() {
        if (this.convertedFiles.length === 0) return;

        if (this.convertedFiles.length === 1) {
            this.downloadFile(this.convertedFiles[0].id);
            return;
        }

        // For multiple files, download as ZIP
        try {
            const JSZip = await this.loadJSZip();
            const zip = new JSZip();

            for (const file of this.convertedFiles) {
                zip.file(file.name, file.blob);
            }

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            link.download = 'converted-images.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

            this.showToast('تم تحميل جميع الصور في ملف مضغوط', 'success');
        } catch (error) {
            console.error('Error creating ZIP:', error);
            // Fallback: download files individually
            for (const file of this.convertedFiles) {
                await new Promise(resolve => setTimeout(resolve, 500));
                this.downloadFile(file.id);
            }
        }
    }

    // Load JSZip library dynamically
    async loadJSZip() {
        if (window.JSZip) return window.JSZip;

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = () => resolve(window.JSZip);
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Show progress modal
    showProgressModal() {
        const modal = document.getElementById('progress-modal');
        modal.classList.add('show');
    }

    // Hide progress modal
    hideProgressModal() {
        const modal = document.getElementById('progress-modal');
        modal.classList.remove('show');
    }

    // Update progress
    updateProgress(percentage, text) {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `${Math.round(percentage)}% ${text}`;
    }

    // Show toast notification
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = this.getToastIcon(type);
        
        toast.innerHTML = `
            <i class="toast-icon ${icon}"></i>
            <span>${message}</span>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        toastContainer.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toastContainer.removeChild(toast);
                    }
                }, 300);
            }
        }, 5000);

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (toast.parentNode) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        });
    }

    // Get toast icon based on type
    getToastIcon(type) {
        const icons = {
            'success': 'fas fa-check-circle',
            'warning': 'fas fa-exclamation-triangle',
            'error': 'fas fa-times-circle',
            'info': 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Additional CSS animations for toast
const additionalStyles = `
@keyframes slideOutRight {
    from {
        opacity: 1;
        transform: translateX(0);
    }
    to {
        opacity: 0;
        transform: translateX(100%);
    }
}
`;

// Add additional styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize the image converter when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.imageConverter = new ImageConverter();
});

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, pause any ongoing operations if needed
    } else {
        // Page is visible again
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    // Update UI if needed for responsive design
});

// Prevent default drag behaviors on document
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());

