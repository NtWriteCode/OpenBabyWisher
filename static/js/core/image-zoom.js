// Image Zoom Functionality

let isImageZoomed = false;

function setupMagnifyingGlass() {
    const img = document.getElementById('modal-image');
    const magnifyIcon = document.getElementById('magnify-icon');
    const prevBtn = document.getElementById('prev-image-btn');
    const nextBtn = document.getElementById('next-image-btn');
    
    // Remove old event listeners by cloning
    const newImg = img.cloneNode(true);
    img.parentNode.replaceChild(newImg, img);
    
    // Get the updated reference
    const modalImage = document.getElementById('modal-image');
    
    // Create zone overlays if they don't exist
    let leftOverlay = document.getElementById('left-nav-overlay');
    let rightOverlay = document.getElementById('right-nav-overlay');
    
    if (!leftOverlay && prevBtn.style.display !== 'none') {
        leftOverlay = document.createElement('div');
        leftOverlay.id = 'left-nav-overlay';
        leftOverlay.style.cssText = 'position: absolute; top: 0; left: 0; bottom: 0; width: 100px; background: linear-gradient(to right, rgba(0,0,0,0.4), transparent); pointer-events: none; opacity: 0; transition: opacity 0.3s; z-index: 5;';
        modalImage.parentElement.appendChild(leftOverlay);
    }
    
    if (!rightOverlay && nextBtn.style.display !== 'none') {
        rightOverlay = document.createElement('div');
        rightOverlay.id = 'right-nav-overlay';
        rightOverlay.style.cssText = 'position: absolute; top: 0; right: 0; bottom: 0; width: 100px; background: linear-gradient(to left, rgba(0,0,0,0.4), transparent); pointer-events: none; opacity: 0; transition: opacity 0.3s; z-index: 5;';
        modalImage.parentElement.appendChild(rightOverlay);
    }
    
    // Mouse move handler for magnifying glass icon AND cursor changes
    modalImage.addEventListener('mousemove', function(e) {
        const rect = modalImage.getBoundingClientRect();
        const x = e.clientX - rect.left;
        
        // Calculate navigation zones (left/right buttons + 50px)
        const leftBtnRect = prevBtn.style.display !== 'none' ? prevBtn.getBoundingClientRect() : null;
        const rightBtnRect = nextBtn.style.display !== 'none' ? nextBtn.getBoundingClientRect() : null;
        
        const zonePadding = 50;
        let inLeftZone = false;
        let inRightZone = false;
        let leftZoneWidth = 0;
        let rightZoneWidth = 0;
        
        if (leftBtnRect) {
            const leftZoneRight = leftBtnRect.right - rect.left + zonePadding;
            leftZoneWidth = leftZoneRight;
            if (x < leftZoneRight) inLeftZone = true;
        }
        
        if (rightBtnRect) {
            const rightZoneLeft = rightBtnRect.left - rect.left - zonePadding;
            rightZoneWidth = rect.width - rightZoneLeft;
            if (x > rightZoneLeft) inRightZone = true;
        }
        
        // Get overlay references
        const leftOverlay = document.getElementById('left-nav-overlay');
        const rightOverlay = document.getElementById('right-nav-overlay');
        
        // Calculate image position relative to container for overlay positioning
        const containerRect = modalImage.parentElement.getBoundingClientRect();
        const imgLeftOffset = rect.left - containerRect.left;
        const imgRightOffset = containerRect.right - rect.right;
        
        // Update overlay sizes and positions dynamically to match image position
        if (leftOverlay && leftZoneWidth > 0) {
            leftOverlay.style.width = `${leftZoneWidth}px`;
            leftOverlay.style.left = `${imgLeftOffset}px`; // Position at image's left edge
        }
        if (rightOverlay && rightZoneWidth > 0) {
            rightOverlay.style.width = `${rightZoneWidth}px`;
            rightOverlay.style.right = `${imgRightOffset}px`; // Position at image's right edge
        }
        
        // Update cursor, magnifying glass, and overlays based on zone
        if (inLeftZone) {
            // In left navigation zone
            modalImage.style.cursor = 'pointer';
            magnifyIcon.style.opacity = '0';
            if (leftOverlay) leftOverlay.style.opacity = '1';
            if (rightOverlay) rightOverlay.style.opacity = '0';
        } else if (inRightZone) {
            // In right navigation zone
            modalImage.style.cursor = 'pointer';
            magnifyIcon.style.opacity = '0';
            if (leftOverlay) leftOverlay.style.opacity = '0';
            if (rightOverlay) rightOverlay.style.opacity = '1';
        } else {
            // In zoom zone - show zoom cursor, show magnifying glass (if not zoomed)
            modalImage.style.cursor = isImageZoomed ? 'zoom-out' : 'zoom-in';
            if (!isImageZoomed) {
                magnifyIcon.style.opacity = '1';
            }
            if (leftOverlay) leftOverlay.style.opacity = '0';
            if (rightOverlay) rightOverlay.style.opacity = '0';
        }
    });
    
    // Mouse leave handler
    modalImage.addEventListener('mouseleave', function() {
        if (!isImageZoomed) {
            magnifyIcon.style.opacity = '0';
        }
        // Hide overlays when mouse leaves
        const leftOverlay = document.getElementById('left-nav-overlay');
        const rightOverlay = document.getElementById('right-nav-overlay');
        if (leftOverlay) leftOverlay.style.opacity = '0';
        if (rightOverlay) rightOverlay.style.opacity = '0';
    });
    
    // Click handler for zoom toggle AND navigation zones
    modalImage.addEventListener('click', function(e) {
        const rect = modalImage.getBoundingClientRect();
        const x = e.clientX - rect.left;
        
        // Calculate navigation zones (button + 50px padding)
        const leftBtnRect = prevBtn.style.display !== 'none' ? prevBtn.getBoundingClientRect() : null;
        const rightBtnRect = nextBtn.style.display !== 'none' ? nextBtn.getBoundingClientRect() : null;
        
        const zonePadding = 50;
        let inLeftZone = false;
        let inRightZone = false;
        
        if (leftBtnRect) {
            const leftZoneRight = leftBtnRect.right - rect.left + zonePadding;
            if (x < leftZoneRight) inLeftZone = true;
        }
        
        if (rightBtnRect) {
            const rightZoneLeft = rightBtnRect.left - rect.left - zonePadding;
            if (x > rightZoneLeft) inRightZone = true;
        }
        
        // Handle click based on zone
        if (inLeftZone && leftBtnRect) {
            // Navigate to previous image
            navigateImage(-1);
        } else if (inRightZone && rightBtnRect) {
            // Navigate to next image
            navigateImage(1);
        } else {
            // Toggle zoom in center zone
            toggleImageZoom();
        }
    });
}

function toggleImageZoom() {
    const img = document.getElementById('modal-image');
    const magnifyIcon = document.getElementById('magnify-icon');
    const imgContainer = img.parentElement; // The wrapper div
    const prevBtn = document.getElementById('prev-image-btn');
    const nextBtn = document.getElementById('next-image-btn');
    
    isImageZoomed = !isImageZoomed;
    
    if (isImageZoomed) {
        // Zoom in - fill 90% of ENTIRE viewport (both dimensions)
        img.style.maxHeight = '90vh';
        img.style.maxWidth = '90vw';
        img.style.minHeight = '80vh';  // Ensure it's actually BIG
        img.style.minWidth = '60vw';   // Even for small images
        img.style.width = 'auto';      // Override w-full class
        img.style.height = 'auto';
        img.style.objectFit = 'contain';
        img.style.cursor = 'zoom-out';
        img.style.margin = '0 auto';   // Center horizontally
        img.style.display = 'block';   // Needed for margin auto
        
        // Make container flex to center content
        imgContainer.style.display = 'flex';
        imgContainer.style.justifyContent = 'center';
        imgContainer.style.alignItems = 'center';
        
        // Calculate image position and move buttons to image edges
        // Use setTimeout to ensure image has rendered at new size
        setTimeout(() => {
            const imgRect = img.getBoundingClientRect();
            const containerRect = imgContainer.parentElement.getBoundingClientRect();
            
            // Calculate distance from container edges to image edges
            const leftOffset = imgRect.left - containerRect.left;
            const rightOffset = containerRect.right - imgRect.right;
            
            if (prevBtn.style.display !== 'none') {
                prevBtn.style.left = `${leftOffset + 8}px`;  // 8px inside image edge
            }
            if (nextBtn.style.display !== 'none') {
                nextBtn.style.right = `${rightOffset + 8}px`; // 8px inside image edge
            }
        }, 50);
        
        // Change icon to zoom-out and keep it visible while zoomed
        magnifyIcon.innerHTML = '<i class="fas fa-search-minus text-2xl"></i>';
        magnifyIcon.style.opacity = '1';
    } else {
        // Zoom out - restore normal size (fit in viewport with padding)
        img.style.maxHeight = '80vh';
        img.style.maxWidth = '';
        img.style.minHeight = '';
        img.style.minWidth = '';
        img.style.width = '';
        img.style.height = '';
        img.style.objectFit = '';
        img.style.cursor = 'zoom-in';
        img.style.margin = '';
        img.style.display = '';
        
        // Restore container defaults
        imgContainer.style.display = '';
        imgContainer.style.justifyContent = '';
        imgContainer.style.alignItems = '';
        
        // Restore button positions (remove inline styles, let Tailwind classes take over)
        if (prevBtn.style.display !== 'none') {
            prevBtn.style.left = '';  // Clear inline style, use left-4 class
        }
        if (nextBtn.style.display !== 'none') {
            nextBtn.style.right = ''; // Clear inline style, use right-4 class
        }
        
        magnifyIcon.innerHTML = '<i class="fas fa-search-plus text-2xl"></i>';
        magnifyIcon.style.opacity = '0';
    }
}

