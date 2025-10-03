// Admin Data Management Functions

async function loadAdminData() {
    showLoading();
    
    try {
        
        const [itemsResponse, tagsResponse] = await Promise.all([
            fetch('/api/items'),
            fetch('/api/tags')
        ]);
        
        
        if (!itemsResponse.ok) {
            throw new Error(`Items API failed: ${itemsResponse.status}`);
        }
        
        if (!tagsResponse.ok) {
            throw new Error(`Tags API failed: ${tagsResponse.status}`);
        }
        
        wishlistItems = await itemsResponse.json();
        existingTags = await tagsResponse.json();
        
        
        updateStats();
        renderItems();
        renderHints();
        
        
    } catch (error) {
        console.error('❌ Error loading admin data:', error);
        showToast(t('error'), 'error');
    } finally {
        hideLoading();
    }
}

function updateStats() {
    const totalItems = wishlistItems.length;
    const availableItems = wishlistItems.filter(item => !item.disabled).length;
    const completedItems = wishlistItems.filter(item => item.disabled).length;
    const pendingHints = wishlistItems.reduce((sum, item) => sum + item.hints.length, 0);
    
    // Only show dashboard if we have actual data
    const dashboard = document.getElementById('stats-dashboard');
    if (totalItems > 0 || pendingHints > 0) {
        dashboard.classList.remove('hidden');
    } else {
        dashboard.classList.add('hidden');
    }
    
    document.getElementById('total-items-stat').textContent = totalItems;
    document.getElementById('available-items-stat').textContent = availableItems;
    document.getElementById('completed-items-stat').textContent = completedItems;
    document.getElementById('pending-hints-stat').textContent = pendingHints;
}

async function saveItem() {
    if (!apiToken) {
        showToast(t('tokenRequired'), 'warning');
        return;
    }
    
    
    const saveBtn = document.getElementById('save-item-btn');
    const originalText = saveBtn.innerHTML;
    
    saveBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i><span>${t('savingItem')}</span>`;
    saveBtn.disabled = true;
    
    try {
        const itemData = {
            title: document.getElementById('item-title').value,
            description: document.getElementById('item-description').value,
            tags: document.getElementById('item-tags').value
        };
        
        // Get priority from pill selector (always available in modal)
        const priorityValue = parseInt(document.getElementById('item-priority').value);
        itemData.priority = isNaN(priorityValue) ? 2 : priorityValue;
        
        // Only include disabled status when editing existing items
        if (currentEditingItem) {
            itemData.disabled = currentEditingItem.disabled;
        } else {
            // New items are always active
            itemData.disabled = false;
        }
        
        let response;
        if (currentEditingItem) {
            response = await fetch(`/api/items/${currentEditingItem.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': apiToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(itemData)
            });
        } else {
            response = await fetch('/api/items', {
                method: 'POST',
                headers: {
                    'Authorization': apiToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(itemData)
            });
        }
        
        if (response.ok) {
            const item = await response.json();
            
            // Upload new images (files)
            const fileInput = document.getElementById('item-images');
            if (fileInput.files.length > 0) {
                for (const file of fileInput.files) {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('token', apiToken);
                    
                    await fetch(`/api/items/${item.id}/images`, {
                        method: 'POST',
                        headers: {
                            'Authorization': apiToken
                        },
                        body: formData
                    });
                }
            }
            
            // Save URL-based images
            const urlImages = document.querySelectorAll('#image-preview [data-image-type="url"]');
            for (const urlImageDiv of urlImages) {
                const imageUrl = urlImageDiv.dataset.imageSrc;
                if (imageUrl) {
                    try {
                        await fetch(`/api/items/${item.id}/images/url`, {
                            method: 'POST',
                            headers: {
                                'Authorization': apiToken,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ url: imageUrl })
                        });
                    } catch (error) {
                        console.error('Error saving URL image:', error);
                    }
                }
            }
            
            showToast(t('itemSaved'), 'success');
            closeItemModal();
            loadAdminData();
        } else {
            throw new Error('Failed to save item');
        }
    } catch (error) {
        console.error('Error saving item:', error);
        showToast(t('error'), 'error');
    } finally {
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    }
}

async function deleteItem(itemId) {
    if (!confirm(t('confirmDelete'))) return;
    
    if (!apiToken) {
        showToast(t('tokenRequired'), 'warning');
        return;
    }
    
    try {
        const response = await fetch(`/api/items/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': apiToken
            }
        });
        
        if (response.ok) {
            showToast(t('itemDeleted'), 'success');
            loadAdminData();
        } else {
            throw new Error('Failed to delete item');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        showToast(t('error'), 'error');
    }
}

async function deleteImage(itemId, imageId) {
    if (!apiToken) {
        showToast(t('tokenRequired'), 'warning');
        return;
    }
    
    try {
        const response = await fetch(`/api/items/${itemId}/images/${imageId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': apiToken
            }
        });
        
        if (response.ok) {
            // Find and update the item in our local data
            const item = wishlistItems.find(i => i.id === itemId);
            if (item) {
                item.images = item.images.filter(img => img.id !== imageId);
            }
            renderItems();
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        showToast(t('error'), 'error');
    }
}

async function testNotification() {
    if (!apiToken) {
        showToast(t('tokenRequired'), 'warning');
        return;
    }
    
    const testBtn = document.getElementById('test-notification-btn');
    const originalText = testBtn.innerHTML;
    
    testBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i><span>Sending...</span>';
    testBtn.disabled = true;
    
    try {
        const response = await fetch('/api/test-notification', {
            method: 'POST',
            headers: {
                'Authorization': apiToken,
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showToast(result.message || 'Test notification sent!', 'success');
        } else {
            showToast(result.message || 'Failed to send notification', 'error');
        }
    } catch (error) {
        console.error('Error sending test notification:', error);
        showToast('Network error occurred', 'error');
    } finally {
        testBtn.innerHTML = originalText;
        testBtn.disabled = false;
    }
}
