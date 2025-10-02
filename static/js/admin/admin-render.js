// Admin Rendering Functions

function renderItems() {
    const gridContainer = document.getElementById('admin-items-grid');
    const listContainer = document.getElementById('admin-items-list');
    const welcomeMessage = document.getElementById('welcome-message');
    const actionButtons = document.getElementById('action-buttons');
    
    // Show welcome message if no items, otherwise show normal interface
    if (wishlistItems.length === 0) {
        welcomeMessage.classList.remove('hidden');
        actionButtons.classList.add('hidden');
        gridContainer.innerHTML = '';
        listContainer.innerHTML = '';
        return;
    } else {
        welcomeMessage.classList.add('hidden');
        actionButtons.classList.remove('hidden');
    }
    
    // Show appropriate container based on current view
    if (currentAdminView === 'grid') {
        gridContainer.style.display = 'grid';
        listContainer.style.display = 'none';
        renderAdminGridView();
    } else {
        gridContainer.style.display = 'none';
        listContainer.style.display = 'block';
        renderAdminListView();
    }
    
    // Apply tag colors after rendering
    setTimeout(() => {
        applyTagColors();
        // Re-enable drag and drop if sort mode is active
        if (sortModeActive) {
            enableDragAndDrop();
        }
    }, 10);
}

function renderAdminGridView() {
    const container = document.getElementById('admin-items-grid');
    
    container.innerHTML = wishlistItems.map((item, index) => {
        const priorityClass = item.priority > 7 ? 'priority-high' : 
                            item.priority > 4 ? 'priority-medium' : 'priority-low';
        
        const priorityLabel = item.priority > 7 ? t('high') : 
                            item.priority > 4 ? t('medium') : t('low');
                            
        return `
            <div class="wishlist-card admin-card ${item.disabled ? 'card-disabled' : ''} item-card" 
                 data-item-id="${item.id}"
                 onclick="openAdminItemModal(${item.id})"
                 style="animation: slide-up 0.3s ease-out ${index * 0.05}s both">
                <div class="card-content">
                
                <!-- Header -->
                <div class="card-header">
                    <h3 class="card-title">${escapeHtml(item.title)}</h3>
                    <div class="flex items-center gap-2">
                        <div class="card-status ${item.disabled ? 'status-completed' : 'status-available'}">
                            ${item.disabled ? t('completed') : t('available')}
                        </div>
                        ${item.hints.length > 0 ? `
                            <div class="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-semibold">
                                ${item.hints.length} ${t('hints')}
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Description -->
                ${item.description ? `
                    <div class="card-description" id="admin-desc-${item.id}">
                        ${item.description}
                        <div class="card-description-fade"></div>
                    </div>
                    <div class="description-toggle" onclick="event.stopPropagation(); toggleAdminDescription(${item.id})">
                        <span id="admin-toggle-text-${item.id}">${t('readMore') || 'Read more'}</span>
                        <i class="fas fa-chevron-down" id="admin-toggle-icon-${item.id}"></i>
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
                
                </div>
                
                <!-- Admin Actions - Always visible at bottom -->
                <div class="flex justify-center gap-2 mt-4 pt-4 border-t border-gray-200">
                    <button onclick="event.stopPropagation(); moveItemUp(${item.id})" 
                            class="px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded-full transition-colors" 
                            title="${t('moveUp')}">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button onclick="event.stopPropagation(); moveItemDown(${item.id})" 
                            class="px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded-full transition-colors" 
                            title="${t('moveDown')}">
                        <i class="fas fa-arrow-down"></i>
                    </button>
                    <button onclick="event.stopPropagation(); editItem(${item.id})" 
                            class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-full transition-colors">
                        <i class="fas fa-edit mr-1"></i>
                        ${t('edit')}
                    </button>
                    <button onclick="event.stopPropagation(); toggleItemStatus(${item.id})" 
                            class="px-3 py-1 ${item.disabled ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'} text-white text-xs rounded-full transition-colors">
                        <i class="fas fa-${item.disabled ? 'undo' : 'check'} mr-1"></i>
                        ${item.disabled ? t('markAsAvailable') : t('markAsDone')}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function renderAdminListView() {
    const container = document.getElementById('admin-items-list');
    
    container.innerHTML = wishlistItems.map((item, index) => {
        const firstImage = item.images.length > 0 ? item.images[0] : null;
        
        return `
            <div class="wishlist-item-list admin-list-item ${item.disabled ? 'disabled' : ''}" 
                 data-item-id="${item.id}"
                 onclick="openAdminItemModal(${item.id})"
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
                            <div class="card-status ${item.disabled ? 'status-completed' : 'status-available'}">
                                ${item.disabled ? t('completed') : t('available')}
                            </div>
                            ${item.hints.length > 0 ? `
                                <div class="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-semibold ml-2">
                                    ${item.hints.length} ${t('hints')}
                                </div>
                            ` : ''}
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
                            ${item.images.length > 0 ? `
                                <i class="fas fa-images text-gray-500"></i>
                                <span>${item.images.length} image${item.images.length !== 1 ? 's' : ''}</span>
                            ` : ''}
                        </div>
                        
                        <!-- Admin Actions -->
                        <div class="list-item-actions">
                            <button onclick="event.stopPropagation(); moveItemUp(${item.id})" 
                                    class="list-item-action-btn secondary" title="${t('moveUp')}">
                                <i class="fas fa-arrow-up"></i>
                            </button>
                            <button onclick="event.stopPropagation(); moveItemDown(${item.id})" 
                                    class="list-item-action-btn secondary" title="${t('moveDown')}">
                                <i class="fas fa-arrow-down"></i>
                            </button>
                            <button onclick="event.stopPropagation(); editItem(${item.id})" class="list-item-action-btn secondary">
                                <i class="fas fa-edit"></i>
                                ${t('edit')}
                            </button>
                            <button onclick="event.stopPropagation(); toggleItemStatus(${item.id})" 
                                    class="list-item-action-btn ${item.disabled ? 'primary' : 'secondary'}">
                                <i class="fas fa-${item.disabled ? 'undo' : 'check'}"></i>
                                ${item.disabled ? t('markAsAvailable') : t('markAsDone')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderHints() {
    const allHints = wishlistItems.flatMap(item => 
        item.hints.map(hint => ({...hint, itemTitle: item.title, itemId: item.id}))
    );
    
    const hintsSection = document.getElementById('hints-section');
    const hintsContainer = document.getElementById('hints-container');
    
    if (allHints.length === 0) {
        hintsSection.style.display = 'none';
        return;
    }
    
    hintsSection.style.display = 'block';
    hintsContainer.innerHTML = allHints.map(hint => `
        <div class="glass-card p-4 flex items-center justify-between animate-slide-in">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <i class="fas fa-gift text-yellow-600"></i>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-800">${escapeHtml(hint.itemTitle)}</h4>
                    <p class="text-gray-600 text-sm">"${escapeHtml(hint.message)}"</p>
                    <p class="text-gray-400 text-xs">${formatDate(hint.created_at)}</p>
                </div>
            </div>
            <button onclick="dismissHint(${hint.id})" class="btn-outline-modern btn-sm">
                <i class="fas fa-check mr-1"></i>
                <span data-i18n="dismiss">Dismiss</span>
            </button>
        </div>
    `).join('');
}
