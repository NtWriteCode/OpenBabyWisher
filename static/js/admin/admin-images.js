// Admin Image Handling Functions

function previewImages(input) {
    const container = document.getElementById('image-preview');
    const files = Array.from(input.files);

    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                addImagePreview(e.target.result, 'file', file.name);
            };
            reader.readAsDataURL(file);
        }
    });
}

function addImageFromUrl() {
    const urlInput = document.getElementById('image-url-input');
    const url = urlInput.value.trim();
    
    if (!url) {
        showToast('Please enter an image URL', 'error');
        return;
    }
    
    // Validate URL format
    try {
        new URL(url);
    } catch {
        showToast('Please enter a valid URL', 'error');
        return;
    }
    
    // Test if URL is accessible and is an image
    const img = new Image();
    img.onload = function() {
        addImagePreview(url, 'url');
        urlInput.value = '';
        showToast('Image added successfully', 'success');
    };
    img.onerror = function() {
        showToast('Unable to load image from URL', 'error');
    };
    img.src = url;
}

function addImagePreview(src, type, filename = '') {
    const container = document.getElementById('image-preview');
    const imageDiv = document.createElement('div');
    imageDiv.className = 'relative group';
    imageDiv.dataset.imageType = type;
    imageDiv.dataset.imageSrc = src;
    
    imageDiv.innerHTML = `
        <img src="${src}" alt="${filename || 'Preview'}" class="w-full h-24 object-cover rounded-lg">
        <div class="absolute top-1 left-1">
            <span class="px-2 py-1 bg-black bg-opacity-60 text-white text-xs rounded">
                ${type === 'url' ? 'URL' : 'File'}
            </span>
        </div>
        <button type="button" onclick="this.parentElement.remove()" 
                class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity">
            <i class="fas fa-times"></i>
        </button>
    `;
    container.appendChild(imageDiv);
}

function capturePhoto() {
    // Simple camera access for mobile devices
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use rear camera
    input.onchange = function(e) {
        if (e.target.files.length > 0) {
            previewImages(e.target);
        }
    };
    input.click();
}

function navigateImage(direction) {
    if (!currentImageItem || currentImageItem.images.length <= 1) return;
    
    let newIndex = currentImageIndex + direction;
    
    // Circular navigation - wrap around
    if (newIndex < 0) {
        newIndex = currentImageItem.images.length - 1; // Go to last image
    } else if (newIndex >= currentImageItem.images.length) {
        newIndex = 0; // Go to first image
    }
    
    // Update to new image
    currentImageIndex = newIndex;
    const newImage = currentImageItem.images[currentImageIndex];
    
    const img = document.getElementById('modal-image');
    const name = document.getElementById('modal-image-name');
    const counter = document.getElementById('modal-image-counter');
    const prevBtn = document.getElementById('prev-image-btn');
    const nextBtn = document.getElementById('next-image-btn');
    
    // Smooth slide animation
    const slideDirection = direction > 0 ? 'translateX(-100%)' : 'translateX(100%)';
    const slideBack = direction > 0 ? 'translateX(100%)' : 'translateX(-100%)';
    
    // Start animation: slide current image out
    img.style.transition = 'transform 0.3s ease-in-out';
    img.style.transform = slideDirection;
    
    setTimeout(() => {
        // Change image source and position it off-screen on the opposite side
        img.src = newImage.url;
        img.alt = newImage.original_filename;
        if (name) name.textContent = newImage.original_filename;
        if (counter) counter.textContent = `${currentImageIndex + 1} of ${currentImageItem.images.length}`;
        
        // Position new image off-screen (opposite side)
        img.style.transition = 'none';
        img.style.transform = slideBack;
        
        // Force reflow
        img.offsetHeight;
        
        // Slide new image in
        img.style.transition = 'transform 0.3s ease-in-out';
        img.style.transform = 'translateX(0)';
        
        // Clean up after animation
        setTimeout(() => {
            img.style.transition = '';
            img.style.transform = '';
        }, 300);
        
    }, 150);
}
