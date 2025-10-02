// Wishlist Rendering Functions

function renderWishlist() {
    const gridContainer = document.getElementById('wishlist-grid');
    const listContainer = document.getElementById('wishlist-list');
    const empty = document.getElementById('empty-state');
    const viewControls = document.getElementById('view-controls');
    
    if (wishlistItems.length === 0) {
        empty.style.display = 'block';
        gridContainer.style.display = 'none';
        listContainer.style.display = 'none';
        viewControls.style.display = 'none';
        return;
    }
    
    empty.style.display = 'none';
    viewControls.style.display = 'flex';
    
    // Show appropriate container based on current view
    if (currentPublicView === 'grid') {
        gridContainer.style.display = 'grid';
        listContainer.style.display = 'none';
        renderGridView();
    } else {
        gridContainer.style.display = 'none';
        listContainer.style.display = 'block';
        renderListView();
    }
    
    // Apply tag colors after rendering
    setTimeout(() => {
        applyTagColors();
    }, 10);
}

function renderGridView() {
    const container = document.getElementById('wishlist-grid');
    
    container.innerHTML = wishlistItems.map((item, index) => {
        const hasHints = item.hints.length > 0;
        
        return `
            <div class="wishlist-card ${item.disabled ? 'card-disabled' : ''}" 
                 onclick="openItemModal(${item.id})"
                 style="animation: slide-up 0.5s ease-out ${index * 0.1}s both">
                
                <!-- Header -->
                <div class="card-header">
                    <h3 class="card-title">${escapeHtml(item.title)}</h3>
                    <div class="card-status ${item.disabled ? 'status-completed' : hasHints ? 'status-claimed' : 'status-available'}">
                        ${item.disabled ? t('completed') : hasHints ? t('claimed') : t('available')}
                    </div>
                </div>
                
                <!-- Description -->
                ${item.description ? `
                    <div class="card-description" id="desc-${item.id}">
                        ${item.description}
                        <div class="card-description-fade"></div>
                    </div>
                    <div class="description-toggle" onclick="event.stopPropagation(); toggleDescription(${item.id})">
                        <span id="toggle-text-${item.id}">${t('readMore') || 'Read more'}</span>
                        <i class="fas fa-chevron-down" id="toggle-icon-${item.id}"></i>
                    </div>
                ` : ''}
                
                <!-- Tags -->
                ${item.tags.length > 0 ? `
                    <div class="card-tags">
                        ${item.tags.map(tag => `
                            <span class="tag-item">${escapeHtml(tag)}</span>
                        `).join('')}
                    </div>
                ` : ''}
                
                <!-- Images -->
                ${item.images.length > 0 ? `
                    <div class="card-images">
                        <div class="card-images-preview">
                            ${item.images.slice(0, 6).map((img, imgIndex) => `
                                <div class="card-image" onclick="event.stopPropagation(); openImageModal('${img.url}', '${escapeHtml(img.original_filename)}', ${item.id}, ${imgIndex})">
                                    <img src="${img.url}" alt="${escapeHtml(img.original_filename)}">
                                    ${imgIndex === 5 && item.images.length > 6 ? `
                                        <div class="card-image-count">+${item.images.length - 6}</div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Hints Display -->
                ${hasHints ? `
                    <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                        <div class="flex items-center gap-2 text-amber-700">
                            <i class="fas fa-gift"></i>
                            <span class="font-medium text-sm">${personalizedTexts.hint_message || t('someoneGotThis')}</span>
                            <span class="text-xs bg-amber-200 px-2 py-1 rounded-full">${item.hints.length}</span>
                        </div>
                    </div>
                ` : ''}
                
                <!-- Action Button -->
                ${!item.disabled ? `
                    <div class="card-actions">
                        <button onclick="event.stopPropagation(); openHintModal(${item.id})" class="card-action-btn">
                            <i class="fas fa-gift"></i>
                            ${t('iGotThis')}
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function renderListView() {
    const container = document.getElementById('wishlist-list');
    
    container.innerHTML = wishlistItems.map((item, index) => {
        const hasHints = item.hints.length > 0;
        const firstImage = item.images.length > 0 ? item.images[0] : null;
        
        return `
            <div class="wishlist-item-list ${item.disabled ? 'disabled' : ''}" 
                 onclick="openItemModal(${item.id})"
                 style="animation: slide-up 0.3s ease-out ${index * 0.05}s both">
                
                <!-- Image Section -->
                <div class="list-item-image">
                    ${firstImage ? `
                        <img src="${firstImage.url}" alt="${escapeHtml(firstImage.original_filename)}">
                        ${item.images.length > 1 ? `
                            <div class="list-item-image-count">+${item.images.length - 1}</div>
                        ` : ''}
                    ` : `
                        <div class="list-item-image-placeholder">
                            <i class="fas fa-gift"></i>
                        </div>
                    `}
                </div>
                
                <!-- Content Section -->
                <div class="list-item-content">
                    <!-- Header -->
                    <div class="list-item-header">
                        <h3 class="list-item-title">${escapeHtml(item.title)}</h3>
                        <div class="list-item-status">
                            <div class="card-status ${item.disabled ? 'status-completed' : hasHints ? 'status-claimed' : 'status-available'}">
                                ${item.disabled ? t('completed') : hasHints ? t('claimed') : t('available')}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Description -->
                    ${item.description ? `
                        <div class="list-item-description">${item.description}</div>
                    ` : ''}
                    
                    <!-- Tags -->
                    ${item.tags.length > 0 ? `
                        <div class="list-item-tags">
                            ${item.tags.map(tag => `
                                <span class="tag-item">${escapeHtml(tag)}</span>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <!-- Meta Information -->
                    <div class="list-item-meta">
                        <div class="list-item-hints">
                            ${hasHints ? `
                                <i class="fas fa-gift text-amber-500"></i>
                                <span>${item.hints.length} ${t('hints')}</span>
                            ` : ''}
                        </div>
                        
                        <!-- Action Button -->
                        ${!item.disabled ? `
                            <div class="list-item-actions">
                                <button onclick="event.stopPropagation(); openHintModal(${item.id})" class="list-item-action-btn primary">
                                    <i class="fas fa-gift"></i>
                                    ${t('iGotThis')}
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}
