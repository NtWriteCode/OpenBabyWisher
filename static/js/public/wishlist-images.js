// Wishlist Image Handling Functions

function openImageModal(url, filename, itemId = null, imageIndex = 0) {
    const modal = document.getElementById('image-modal');
    const img = document.getElementById('modal-image');
    const name = document.getElementById('modal-image-name');
    const counter = document.getElementById('modal-image-counter');
    const prevBtn = document.getElementById('prev-image-btn');
    const nextBtn = document.getElementById('next-image-btn');
    
    // Find the item if itemId is provided
    if (itemId) {
        currentImageItem = wishlistItems.find(item => item.id === itemId);
        currentImageIndex = imageIndex;
    } else {
        // Fallback for single image viewing
        currentImageItem = null;
        currentImageIndex = 0;
    }
    
    // Set image and filename
    img.src = url;
    name.textContent = filename;
    
    // Update counter and navigation buttons
    if (currentImageItem && currentImageItem.images.length > 1) {
        counter.textContent = `${currentImageIndex + 1} of ${currentImageItem.images.length}`;
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
        
        // With circular navigation, buttons are always fully visible
        prevBtn.style.opacity = '1';
        nextBtn.style.opacity = '1';
    } else {
        counter.textContent = '';
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    }
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
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
        name.textContent = newImage.original_filename;
        counter.textContent = `${currentImageIndex + 1} of ${currentImageItem.images.length}`;
        
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

function closeImageModal() {
    const modal = document.getElementById('image-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset navigation variables
    currentImageItem = null;
    currentImageIndex = 0;
}
