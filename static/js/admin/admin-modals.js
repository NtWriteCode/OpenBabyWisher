// Admin Modal Functions

function openAdminItemModal(itemId) {
    const item = wishlistItems.find(i => i.id === itemId);
    if (!item) return;
    
    // Create or update admin item detail modal
    let modal = document.getElementById('admin-item-detail-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'admin-item-detail-modal';
        modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4';
        modal.style.display = 'none';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
                <!-- Header -->
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <h2 class="text-3xl font-bold text-gray-800 mb-2">${escapeHtml(item.title)}</h2>
                        <div class="flex items-center gap-3">
                            ${item.disabled ? 
                                `<span class="px-3 py-1 bg-gray-500 text-white text-sm font-semibold rounded-full">${t('completed')}</span>` :
                                `<span class="px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full">${t('available')}</span>`
                            }
                        </div>
                    </div>
                    <button onclick="closeAdminItemModal()" class="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                        <i class="fas fa-times text-gray-600"></i>
                    </button>
                </div>
                
                <!-- Description -->
                ${item.description ? `
                <div class="mb-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-3">${t('description') || 'Description'}</h3>
                    <div class="prose prose-lg max-w-none text-gray-600">${item.description}</div>
                </div>
                ` : ''}
                
                <!-- Tags -->
                ${item.tags.length > 0 ? `
                    <div class="mb-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-3">${t('tags') || 'Tags'}</h3>
                        <div class="tag-cloud">
                            ${item.tags.map(tag => `<span class="tag-item">${escapeHtml(tag)}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Images -->
                ${item.images.length > 0 ? `
                    <div class="mb-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-3">${t('images') || 'Images'} (${item.images.length})</h3>
                        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            ${item.images.map((img, imgIndex) => `
                                <div class="relative group">
                                    <img src="${img.url}" 
                                         alt="${escapeHtml(img.original_filename)}"
                                         onclick="openImageModal('${img.url}', '${escapeHtml(img.original_filename)}', ${item.id}, ${imgIndex})"
                                         class="w-full h-32 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform">
                                    <button onclick="event.stopPropagation(); deleteImageFromModal(${item.id}, ${img.id})" 
                                            class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <i class="fas fa-times text-xs"></i>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Action Buttons -->
                <div class="flex gap-3">
                    <button onclick="closeAdminItemModal(); editItem(${item.id})" class="btn-modern">
                        <i class="fas fa-edit mr-2"></i>
                        ${t('edit') || 'Edit'}
                    </button>
                    <button onclick="toggleItemStatus(${item.id}); closeAdminItemModal()" class="btn-outline-modern">
                        <i class="fas fa-${item.disabled ? 'undo' : 'check'} mr-2"></i>
                        ${item.disabled ? (t('markAsAvailable') || 'Mark as Available') : (t('markAsDone') || 'Mark as Done')}
                    </button>
                    <button onclick="deleteItem(${item.id}); closeAdminItemModal()" class="btn-outline-modern text-red-600 border-red-300 hover:bg-red-50">
                        <i class="fas fa-trash mr-2"></i>
                        ${t('delete') || 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Apply tag colors after modal content is rendered
    setTimeout(() => {
        applyTagColors();
    }, 10);
}

function closeAdminItemModal() {
    const modal = document.getElementById('admin-item-detail-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    document.body.style.overflow = 'auto';
}

function showAddItemModal() {
    currentEditingItem = null;
    document.getElementById('modal-title').innerHTML = `<i class="fas fa-plus mr-3"></i><span data-i18n="addNewItem">${t('addNewItem')}</span>`;
    document.getElementById('item-form').reset();
    
    // Clear WYSIWYG editor
    if (quillEditor) {
        quillEditor.root.innerHTML = '';
        document.getElementById('item-description').value = '';
    }
    
    // Clear tag input
    clearTagInput();
    
    document.getElementById('image-preview').innerHTML = '';
    updateTagSuggestions();
    
    // Initialize editor when modal opens (in case it wasn't initialized on page load)
    setTimeout(() => {
        if (!quillEditor) {
            initializeEditor();
        }
        // Initialize paste handler for Ctrl+V image paste
        initializePasteHandler();
    }, 100);
    
    document.getElementById('item-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeItemModal() {
    document.getElementById('item-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
    currentEditingItem = null;
    
    // Reset priority to default
    selectPriority(2);
}

function showDismissModal() {
    const modal = document.getElementById('dismiss-modal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Set up event listeners for the buttons
    document.getElementById('dismiss-and-complete-btn').onclick = () => dismissAndComplete();
    document.getElementById('dismiss-only-btn').onclick = () => dismissOnly();
}

function closeDismissModal() {
    const modal = document.getElementById('dismiss-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    currentDismissHintId = null;
}

// Image Modal Functions
// Note: isImageZoomed, setupMagnifyingGlass, and toggleImageZoom are in core/image-zoom.js

function openImageModal(url, filename, itemId = null, imageIndex = 0) {
    const modal = document.getElementById('image-modal');
    const img = document.getElementById('modal-image');
    const name = document.getElementById('modal-image-name');
    const counter = document.getElementById('modal-image-counter');
    const prevBtn = document.getElementById('prev-image-btn');
    const nextBtn = document.getElementById('next-image-btn');
    
    // Reset zoom state (using global from image-zoom.js)
    isImageZoomed = false;
    img.style.maxHeight = '80vh';
    img.style.maxWidth = '';
    img.style.cursor = 'zoom-in';
    
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
    img.alt = filename;
    if (name) name.textContent = filename;
    
    // Update counter and navigation buttons
    if (currentImageItem && currentImageItem.images.length > 1) {
        if (counter) counter.textContent = `${currentImageIndex + 1} of ${currentImageItem.images.length}`;
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
        
        // With circular navigation, buttons are always fully visible
        prevBtn.style.opacity = '1';
        nextBtn.style.opacity = '1';
    } else {
        if (counter) counter.textContent = '';
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    }
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Set up magnifying glass functionality
    setupMagnifyingGlass();
}

function closeImageModal() {
    const modal = document.getElementById('image-modal');
    const img = document.getElementById('modal-image');
    
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset zoom state (using global from image-zoom.js)
    isImageZoomed = false;
    img.style.maxHeight = '80vh';
    img.style.maxWidth = '';
    img.style.cursor = 'zoom-in';
    
    // Reset navigation variables
    currentImageItem = null;
    currentImageIndex = 0;
}
