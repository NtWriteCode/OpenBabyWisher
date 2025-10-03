// Admin Drag & Drop Reordering Functions

function toggleSortMode() {
    sortModeActive = !sortModeActive;
    const container = document.getElementById('admin-items-container');
    const sortBtn = document.getElementById('sort-mode-btn');
    
    if (sortModeActive) {
        container.classList.add('sort-mode-active');
        sortBtn.classList.add('active');
        showSortModeIndicator();
        enableDragAndDrop();
    } else {
        container.classList.remove('sort-mode-active');
        sortBtn.classList.remove('active');
        hideSortModeIndicator();
        disableDragAndDrop();
    }
}

function showSortModeIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'sort-mode-indicator';
    indicator.className = 'sort-mode-indicator';
    indicator.innerHTML = `<i class="fas fa-arrows-alt mr-2"></i>${t('dragToReorder')}`;
    document.body.appendChild(indicator);
    
    setTimeout(() => {
        if (indicator.parentNode) {
            indicator.remove();
        }
    }, 3000);
}

function hideSortModeIndicator() {
    const indicator = document.getElementById('sort-mode-indicator');
    if (indicator) {
        indicator.remove();
    }
}

function enableDragAndDrop() {
    const items = document.querySelectorAll('.wishlist-card, .wishlist-item-list');
    items.forEach((item, index) => {
        item.draggable = true;
        item.dataset.originalIndex = index;
        
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragend', handleDragEnd);
        item.addEventListener('dragenter', handleDragEnter);
        item.addEventListener('dragleave', handleDragLeave);
    });
}

function disableDragAndDrop() {
    const items = document.querySelectorAll('.wishlist-card, .wishlist-item-list');
    items.forEach(item => {
        item.draggable = false;
        item.removeEventListener('dragstart', handleDragStart);
        item.removeEventListener('dragover', handleDragOver);
        item.removeEventListener('drop', handleDrop);
        item.removeEventListener('dragend', handleDragEnd);
        item.removeEventListener('dragenter', handleDragEnter);
        item.removeEventListener('dragleave', handleDragLeave);
    });
}

function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    if (this !== draggedElement) {
        this.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    if (draggedElement !== this) {
        const draggedItemId = parseInt(draggedElement.dataset.itemId);
        const targetItemId = parseInt(this.dataset.itemId);
        
        // Get the container
        const container = this.parentNode;
        const allItems = Array.from(container.children);
        
        // Find positions
        const draggedIndex = allItems.indexOf(draggedElement);
        const targetIndex = allItems.indexOf(this);
        
        // Start animation
        animateReorderStart();
        
        // Add drop animation
        this.classList.add('item-swap-highlight');
        draggedElement.classList.add('item-swap-highlight');
        
        // Handle smooth position swap animation
        (async () => {
            try {
                // Animate the smooth position swap using current positions
                await animatePositionSwap(draggedItemId, targetItemId);
                
                // Find the items in our data array and swap them (like button approach)
                const draggedItemIndex = wishlistItems.findIndex(item => item.id === draggedItemId);
                const targetItemIndex = wishlistItems.findIndex(item => item.id === targetItemId);
                
                if (draggedItemIndex !== -1 && targetItemIndex !== -1) {
                    // Swap the items in the data array
                    const temp = wishlistItems[draggedItemIndex];
                    wishlistItems[draggedItemIndex] = wishlistItems[targetItemIndex];
                    wishlistItems[targetItemIndex] = temp;
                    
                    // Update their order values
                    wishlistItems[draggedItemIndex].order = draggedItemIndex;
                    wishlistItems[targetItemIndex].order = targetItemIndex;
                    
                    // Re-render with new order
                    renderItems();
                    
                    // Update backend with new order
                    await updateItemOrderFromArray();
                } else {
                    await updateItemOrder();
                }
                
                // End animation
                animateReorderEnd();
                
                // Clean up animation classes
                setTimeout(() => {
                    const cleanupTarget = document.querySelector(`[data-item-id="${targetItemId}"]`);
                    const cleanupDragged = document.querySelector(`[data-item-id="${draggedItemId}"]`);
                    
                    if (cleanupTarget) {
                        cleanupTarget.classList.remove('item-swap-highlight');
                    }
                    if (cleanupDragged) {
                        cleanupDragged.classList.remove('item-swap-highlight');
                    }
                }, 100);
                
            } catch (error) {
                console.error('Error in drop animation:', error);
                // Clean up on error
                animateReorderEnd();
                
                const errorCleanupTarget = document.querySelector(`[data-item-id="${targetItemId}"]`);
                const errorCleanupDragged = document.querySelector(`[data-item-id="${draggedItemId}"]`);
                
                if (errorCleanupTarget) {
                    errorCleanupTarget.classList.remove('item-swap-highlight');
                }
                if (errorCleanupDragged) {
                    errorCleanupDragged.classList.remove('item-swap-highlight');
                }
            }
        })();
    }
    
    this.classList.remove('drag-over');
    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    
    // Clean up
    const items = document.querySelectorAll('.wishlist-card, .wishlist-item-list');
    items.forEach(item => {
        item.classList.remove('drag-over');
    });
    
    draggedElement = null;
}

async function updateItemOrder() {
    if (!apiToken) {
        showToast(t('pleaseAuthenticate'), 'error');
        return;
    }
    
    const container = currentAdminView === 'grid' ? 
        document.getElementById('admin-items-grid') : 
        document.getElementById('admin-items-list');
    
    const items = Array.from(container.children);
    const itemOrders = items.map((element, index) => {
        const itemId = parseInt(element.dataset.itemId);
        return { id: itemId, order: index };
    });
    
    try {
        const response = await fetch('/api/items/reorder', {
            method: 'POST',
            headers: {
                'Authorization': apiToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ item_orders: itemOrders })
        });
        
        if (response.ok) {
            showToast(t('orderUpdated'), 'success');
            // Update local wishlistItems order
            wishlistItems.forEach(item => {
                const orderInfo = itemOrders.find(o => o.id === item.id);
                if (orderInfo) {
                    item.order = orderInfo.order;
                }
            });
            // Sort local array to match new order
            wishlistItems.sort((a, b) => a.order - b.order);
        } else {
            throw new Error('Failed to update order');
        }
    } catch (error) {
        console.error('Error updating order:', error);
        showToast(t('orderUpdateFailed'), 'error');
        // Reload to restore original order
        loadAdminData();
    }
}

function animateItemSwap(itemId1, itemId2, direction = 'swap') {
    const element1 = document.querySelector(`[data-item-id="${itemId1}"]`);
    const element2 = document.querySelector(`[data-item-id="${itemId2}"]`);
    
    if (!element1 || !element2) {
        return Promise.resolve();
    }
    
    return new Promise((resolve) => {
        // Add animation classes
        element1.classList.add('item-swapping', 'item-swap-highlight');
        element2.classList.add('item-swapping', 'item-swap-highlight');
        
        if (direction === 'up') {
            element1.classList.add('item-moving-up');
            element2.classList.add('item-moving-down');
        } else if (direction === 'down') {
            element1.classList.add('item-moving-down');
            element2.classList.add('item-moving-up');
        }
        
        // Add glow effect
        setTimeout(() => {
            if (element1 && element2) {
                element1.classList.add('item-swap-glow');
                element2.classList.add('item-swap-glow');
            }
        }, 100);
        
        // Remove classes after animation
        setTimeout(() => {
            if (element1 && element2) {
                element1.classList.remove('item-swapping', 'item-swap-highlight', 'item-moving-up', 'item-moving-down', 'item-swap-glow');
                element2.classList.remove('item-swapping', 'item-swap-highlight', 'item-moving-up', 'item-moving-down', 'item-swap-glow');
            }
            resolve();
        }, 1000); // Now consistent with 1 second
    });
}

function animatePositionSwap(itemId1, itemId2) {
    const element1 = document.querySelector(`[data-item-id="${itemId1}"]`);
    const element2 = document.querySelector(`[data-item-id="${itemId2}"]`);
    
    if (!element1 || !element2) {
        return Promise.resolve();
    }
    
    return new Promise((resolve) => {
        // Get the positions of both elements
        const rect1 = element1.getBoundingClientRect();
        const rect2 = element2.getBoundingClientRect();
        
        // Calculate the distance each element needs to move
        const deltaY1 = rect2.top - rect1.top;
        const deltaY2 = rect1.top - rect2.top;
        const deltaX1 = rect2.left - rect1.left;
        const deltaX2 = rect1.left - rect2.left;
        
        // Add animation classes and highlight
        element1.classList.add('item-position-swapping', 'item-swap-highlight-smooth');
        element2.classList.add('item-position-swapping', 'item-swap-highlight-smooth');
        
        // Apply the transforms to move elements to each other's positions
        element1.style.transform = `translate(${deltaX1}px, ${deltaY1}px)`;
        element2.style.transform = `translate(${deltaX2}px, ${deltaY2}px)`;
        
        // After animation completes, clean up
        setTimeout(() => {
            // Reset transforms and remove classes
            element1.style.transform = '';
            element2.style.transform = '';
            element1.classList.remove('item-position-swapping', 'item-swap-highlight-smooth');
            element2.classList.remove('item-position-swapping', 'item-swap-highlight-smooth');
            
            resolve();
        }, 1000); // 1 second animation
    });
}

function animateReorderStart() {
    const container = document.getElementById('admin-items-container');
    if (container) {
        container.classList.add('reorder-in-progress');
    }
}

function animateReorderEnd() {
    const container = document.getElementById('admin-items-container');
    if (container) {
        setTimeout(() => {
            container.classList.remove('reorder-in-progress');
        }, 100);
    }
}

async function moveItemUp(itemId) {
    if (isReordering) {
        return;
    }
    isReordering = true;
    
    const currentIndex = wishlistItems.findIndex(item => item.id === itemId);
    if (currentIndex <= 0) {
        isReordering = false;
        return; // Already at top
    }
    
    const swapItemId = wishlistItems[currentIndex - 1].id;
    
    // Disable buttons during operation
    const buttons = document.querySelectorAll(`[onclick*="moveItemUp(${itemId})"], [onclick*="moveItemDown(${itemId})"]`);
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
    });
    
    try {
        // First, animate the position swap (items move to each other's positions)
        await animatePositionSwap(itemId, swapItemId);
        
        // After animation completes, update the data
        const temp = wishlistItems[currentIndex];
        wishlistItems[currentIndex] = wishlistItems[currentIndex - 1];
        wishlistItems[currentIndex - 1] = temp;
        
        // Update orders
        wishlistItems[currentIndex].order = currentIndex;
        wishlistItems[currentIndex - 1].order = currentIndex - 1;
        
        // Re-render to show new positions
        renderItems();
        
        // Update backend
        await updateItemOrderFromArray();
        
    } catch (error) {
        console.error('Error in moveItemUp:', error);
        showToast(t('moveItemFailed'), 'error');
    } finally {
        // Re-enable buttons after operation completes
        setTimeout(() => {
            const newButtons = document.querySelectorAll(`[onclick*="moveItemUp(${itemId})"], [onclick*="moveItemDown(${itemId})"]`);
            newButtons.forEach(btn => {
                btn.disabled = false;
                btn.style.opacity = '1';
            });
            isReordering = false; // Allow new reorder requests
        }, 100); // Short delay after re-render
    }
}

async function moveItemDown(itemId) {
    if (isReordering) {
        return;
    }
    isReordering = true;
    
    const currentIndex = wishlistItems.findIndex(item => item.id === itemId);
    if (currentIndex >= wishlistItems.length - 1) {
        isReordering = false;
        return; // Already at bottom
    }
    
    const swapItemId = wishlistItems[currentIndex + 1].id;
    
    // Disable buttons during operation
    const buttons = document.querySelectorAll(`[onclick*="moveItemUp(${itemId})"], [onclick*="moveItemDown(${itemId})"]`);
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
    });
    
    try {
        // First, animate the position swap (items move to each other's positions)
        await animatePositionSwap(itemId, swapItemId);
        
        // After animation completes, update the data
        const temp = wishlistItems[currentIndex];
        wishlistItems[currentIndex] = wishlistItems[currentIndex + 1];
        wishlistItems[currentIndex + 1] = temp;
        
        // Update orders
        wishlistItems[currentIndex].order = currentIndex;
        wishlistItems[currentIndex + 1].order = currentIndex + 1;
        
        // Re-render to show new positions
        renderItems();
        
        // Update backend
        await updateItemOrderFromArray();
        
    } catch (error) {
        console.error('Error in moveItemDown:', error);
        showToast(t('moveItemFailed'), 'error');
    } finally {
        // Re-enable buttons after operation completes
        setTimeout(() => {
            const newButtons = document.querySelectorAll(`[onclick*="moveItemUp(${itemId})"], [onclick*="moveItemDown(${itemId})"]`);
            newButtons.forEach(btn => {
                btn.disabled = false;
                btn.style.opacity = '1';
            });
            isReordering = false; // Allow new reorder requests
        }, 100); // Short delay after re-render
    }
}

async function updateItemOrderFromArray() {
    if (!apiToken) {
        showToast(t('pleaseAuthenticate'), 'error');
        return;
    }
    
    const itemOrders = wishlistItems.map((item, index) => ({
        id: item.id,
        order: index
    }));
    
    try {
        const response = await fetch('/api/items/reorder', {
            method: 'POST',
            headers: {
                'Authorization': apiToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ item_orders: itemOrders })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update order');
        }
    } catch (error) {
        console.error('Error updating order:', error);
        showToast(t('orderUpdateFailed'), 'error');
        // Reload to restore original order
        loadAdminData();
    }
}
