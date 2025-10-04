// Admin Item Operations

function editItem(itemId) {
    currentEditingItem = wishlistItems.find(item => item.id === itemId);
    if (!currentEditingItem) return;
    
    document.getElementById('modal-title').innerHTML = `<i class="fas fa-edit mr-3"></i><span data-i18n="editItem">${t('editItem')}</span>`;
    document.getElementById('item-title').value = currentEditingItem.title;
    
    // Set content in WYSIWYG editor
    if (quillEditor) {
        quillEditor.root.innerHTML = currentEditingItem.description || '';
        document.getElementById('item-description').value = currentEditingItem.description || '';
    }
    
    // Set priority
    selectPriority(currentEditingItem.priority || 2);
    
    // Set tags in the modern tag input
    setTagsFromString(currentEditingItem.tags.join(', '));
    
    // Show current images
    const previewContainer = document.getElementById('image-preview');
    previewContainer.innerHTML = currentEditingItem.images.map(img => `
        <div class="relative group">
            <img src="${img.url}" alt="${escapeHtml(img.original_filename)}" class="w-full h-24 object-cover rounded-lg">
            <button type="button" onclick="deleteImage(${currentEditingItem.id}, ${img.id})" 
                    class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    
    updateTagSuggestions();
    
    // Initialize paste handler for Ctrl+V image paste
    setTimeout(() => {
        initializePasteHandler();
    }, 100);
    
    document.getElementById('item-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function deleteImageFromModal(itemId, imageId) {
    if (!confirm(t('confirmDelete') || 'Are you sure?')) return;
    deleteImage(itemId, imageId);
    closeAdminItemModal(); // Close modal and refresh
}

function toggleAdminDescription(itemId) {
    const descElement = document.getElementById(`admin-desc-${itemId}`);
    const toggleText = document.getElementById(`admin-toggle-text-${itemId}`);
    const toggleIcon = document.getElementById(`admin-toggle-icon-${itemId}`);
    
    if (descElement.classList.contains('expanded')) {
        // Collapse
        descElement.classList.remove('expanded');
        toggleText.textContent = t('readMore') || 'Read more';
        toggleIcon.className = 'fas fa-chevron-down';
    } else {
        // Expand
        descElement.classList.add('expanded');
        toggleText.textContent = t('readLess') || 'Read less';
        toggleIcon.className = 'fas fa-chevron-up';
    }
}

async function toggleItemStatus(itemId) {
    const item = wishlistItems.find(i => i.id === itemId);
    if (!item) return;
    
    try {
        const response = await fetch(`/api/items/${itemId}`, {
            method: 'PUT',
            headers: {
                'Authorization': apiToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...item,
                disabled: !item.disabled
            })
        });
        
        if (response.ok) {
            showToast(item.disabled ? t('markedAsAvailable') : t('markedAsDone'), 'success');
            loadAdminData();
        }
    } catch (error) {
        console.error('Error updating item status:', error);
        showToast(t('error'), 'error');
    }
}
