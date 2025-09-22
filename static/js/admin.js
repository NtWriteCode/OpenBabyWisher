let wishlistItems = [];
let existingTags = [];
let currentEditingItem = null;
let apiToken = '';
let isAuthenticated = false;
let quillEditor = null;
let currentAdminView = 'grid'; // 'grid' or 'list'
let sortModeActive = false;
let draggedElement = null;

// Enhanced admin translations
const adminTranslations = {
    en: {
        ...translations.en,
        totalItems: "Total Items",
        pendingHints: "Pending Hints", 
        completedItems: "Completed",
        dismissAll: "Dismiss All",
        enableSort: "Enable Sort",
        disableSort: "Disable Sort",
        uploadImages: "Upload Images",
        dragToReorder: "Drag to reorder items",
        tokenRequired: "Please enter your admin token",
        tokenInvalid: "Invalid admin token",
        tokenValid: "Token validated successfully",
        itemSaved: "Item saved successfully",
        itemDeleted: "Item deleted successfully",
        hintDismissed: "Hint dismissed",
        confirmDelete: "Are you sure you want to delete this item?",
        confirmDismiss: "Are you sure you want to dismiss this hint?",
        dismissHintTitle: "Dismiss Notification",
        dismissHintDescription: "What would you like to do with this item?",
        dismissAndComplete: "Mark as Completed",
        dismissOnly: "Just Dismiss",
        itemCompleted: "Item marked as completed",
        savingItem: "Saving item...",
        deletingItem: "Deleting item...",
        loadingItems: "Loading items...",
        noHints: "No pending hints",
        editItem: "Edit Item",
        deleteItem: "Delete Item",
        moveUp: "Move Up",
        moveDown: "Move Down",
        tokenPlaceholder: "Enter your admin token...",
        titlePlaceholder: "Enter item title...",
        descriptionPlaceholder: "Add a detailed description...",
        tagsPlaceholder: "Enter tags separated by commas...",
        title: "Title",
        status: "Status",
        adminToken: "Admin Token",
        wishlistItems: "Wishlist Items",
        completed: "Completed",
        confirmDismissAll: "Dismiss all hints?",
        available: "Available",
        markAsDone: "Mark as Done",
        markAsAvailable: "Mark as Available",
        markedAsDone: "Marked as done",
        markedAsAvailable: "Marked as available",
        adminAuthentication: "Admin Authentication",
        authenticate: "Authenticate",
        authenticated: "Authenticated Successfully",
        logout: "Logout",
        tokenRequired: "This token is required for all admin operations",
        authenticationFailed: "Invalid token. Please try again.",
        pleaseAuthenticate: "Please authenticate to access admin features",
        uploadFiles: "Upload Files",
        takePhoto: "Take Photo",
        addUrl: "Add URL",
        imageUrlPlaceholder: "Or paste image URL...",
        welcomeTitle: "Welcome to Your Wishlist!",
        welcomeMessage: "Start by adding your first wishlist item. Create something special that your family and friends can help you with!",
        addFirstItem: "Add Your First Item",
        moveUp: "Move Up",
        moveDown: "Move Down",
        dragToReorder: "Drag to Reorder"
    },
    hu: {
        ...translations.hu,
        totalItems: "Összes Elem",
        pendingHints: "Függő Jelzések",
        completedItems: "Befejezett",
        dismissAll: "Összes Elvetése",
        enableSort: "Rendezés Engedélyezése", 
        disableSort: "Rendezés Letiltása",
        uploadImages: "Képek Feltöltése",
        dragToReorder: "Húzd az elemek átrendezéséhez",
        tokenRequired: "Kérjük, adja meg az admin tokent",
        tokenInvalid: "Érvénytelen admin token",
        tokenValid: "Token sikeresen validálva",
        itemSaved: "Elem sikeresen mentve",
        itemDeleted: "Elem sikeresen törölve",
        hintDismissed: "Jelzés elvetve",
        confirmDelete: "Biztosan törölni szeretnéd ezt az elemet?",
        confirmDismiss: "Biztosan el szeretnéd vetni ezt a jelzést?",
        dismissHintTitle: "Értesítés Elvetése",
        dismissHintDescription: "Mit szeretnél tenni ezzel az elemmel?",
        dismissAndComplete: "Befejezettként Jelölés",
        dismissOnly: "Csak Elvetés",
        itemCompleted: "Elem befejezettként jelölve",
        savingItem: "Elem mentése...",
        deletingItem: "Elem törlése...",
        loadingItems: "Elemek betöltése...",
        noHints: "Nincsenek függő jelzések",
        editItem: "Elem Szerkesztése",
        deleteItem: "Elem Törlése", 
        moveUp: "Fel",
        moveDown: "Le",
        tokenPlaceholder: "Add meg az admin tokent...",
        titlePlaceholder: "Add meg az elem címét...",
        descriptionPlaceholder: "Adj hozzá részletes leírást...",
        tagsPlaceholder: "Add meg a címkéket vesszővel elválasztva...",
        title: "Cím",
        status: "Állapot",
        adminToken: "Admin Token",
        wishlistItems: "Kívánságlista Elemek",
        completed: "Befejezve",
        confirmDismissAll: "Minden jelzést elvetsz?",
        available: "Elérhető",
        markAsDone: "Befejezettnek Jelölés",
        markAsAvailable: "Elérhetőnek Jelölés",
        markedAsDone: "Befejezettnek jelölve",
        markedAsAvailable: "Elérhetőnek jelölve",
        adminAuthentication: "Admin Hitelesítés",
        authenticate: "Hitelesítés",
        authenticated: "Sikeresen Hitelesítve",
        logout: "Kijelentkezés",
        tokenRequired: "Ez a token szükséges minden admin művelethez",
        authenticationFailed: "Érvénytelen token. Kérjük próbálja újra.",
        pleaseAuthenticate: "Kérjük hitelesítse magát az admin funkciók eléréséhez",
        uploadFiles: "Fájlok Feltöltése",
        takePhoto: "Fénykép Készítése",
        addUrl: "URL Hozzáadása",
        imageUrlPlaceholder: "Vagy illesszen be kép URL-t...",
        welcomeTitle: "Üdvözöljük a Kívánságlistájában!",
        welcomeMessage: "Kezdje el az első kívánságlista elem hozzáadásával. Hozzon létre valami különlegeset, amiben a családja és barátai segíthetnek!",
        addFirstItem: "Első Elem Hozzáadása",
        moveUp: "Fel",
        moveDown: "Le",
        dragToReorder: "Húzd az átrendezéshez"
    }
};

// Merge translations
Object.assign(translations.en, adminTranslations.en);
Object.assign(translations.hu, adminTranslations.hu);

function showLoading() {
    document.getElementById('loading-overlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}

function showAuthMessage(message, type) {
    const messageEl = document.getElementById('auth-message');
    messageEl.textContent = message;
    messageEl.className = `text-sm mt-3 mb-1 min-h-[1.25rem] ${
        type === 'error' ? 'text-red-600' : 
        type === 'success' ? 'text-green-600' : 
        'text-blue-600'
    }`;
    
    // Clear message after 4 seconds
    setTimeout(() => {
        messageEl.textContent = '';
    }, 4000);
}

async function authenticateAdmin() {
    const tokenInput = document.getElementById('api-token');
    const authBtn = document.getElementById('auth-btn');
    
    const token = tokenInput.value.trim();
    if (!token) {
        showAuthMessage(t('pleaseAuthenticate'), 'error');
        return;
    }
    
    authBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i><span>${t('authenticating') || 'Authenticating...'}</span>`;
    authBtn.disabled = true;
    
    // Clear any previous messages
    document.getElementById('auth-message').textContent = '';
    
    try {
        // Test the token by making a proper auth test call
        const response = await fetch('/api/auth/test', {
            method: 'GET',
            headers: {
                'Authorization': token
            }
        });
        
        if (response.ok) {
            // Authentication successful
            apiToken = token;
            isAuthenticated = true;
            
            
            // Show success state
            document.getElementById('auth-form').classList.add('hidden');
            document.getElementById('auth-success').classList.remove('hidden');
            document.getElementById('admin-content').classList.remove('hidden');
            
            showToast(t('authenticated'), 'success');
            loadAdminData();
        } else {
            // Authentication failed
            showAuthMessage(t('authenticationFailed'), 'error');
            tokenInput.value = '';
            tokenInput.focus();
        }
    } catch (error) {
        console.error('Authentication error:', error);
        showAuthMessage(t('authenticationFailed'), 'error');
        tokenInput.value = '';
        tokenInput.focus();
    } finally {
        authBtn.innerHTML = `<i class="fas fa-sign-in-alt mr-2"></i><span>${t('authenticate')}</span>`;
        authBtn.disabled = false;
    }
}

function logoutAdmin() {
    apiToken = '';
    isAuthenticated = false;
    
    // Reset UI
    document.getElementById('auth-form').classList.remove('hidden');
    document.getElementById('auth-success').classList.add('hidden');
    document.getElementById('admin-content').classList.add('hidden');
    document.getElementById('api-token').value = '';
    
    // Clear data
    wishlistItems = [];
    existingTags = [];
    updateStats();
    renderItems();
    
    showToast(t('loggedOut') || 'Logged out successfully', 'info');
}

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
    }, 100);
    
    document.getElementById('item-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeItemModal() {
    document.getElementById('item-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
    currentEditingItem = null;
}

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
    document.getElementById('item-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

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
        
        // Only include priority and disabled status when editing existing items
        if (currentEditingItem) {
            itemData.priority = currentEditingItem.priority;
            itemData.disabled = currentEditingItem.disabled;
        } else {
            // New items get default priority and are always active
            itemData.priority = 5;
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
    
    showLoading();
    
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
    } finally {
        hideLoading();
    }
}

async function deleteImage(itemId, imageId) {
    try {
        const response = await fetch(`/api/items/${itemId}/images/${imageId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': apiToken
            }
        });
        
        if (response.ok) {
            loadAdminData();
        } else {
            throw new Error('Failed to delete image');
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        showToast(t('error'), 'error');
    }
}

// Global variable to store current hint being dismissed
let currentDismissHintId = null;

function dismissHint(hintId) {
    // Find the hint to get the item information
    const hint = wishlistItems.flatMap(item => item.hints).find(h => h.id === hintId);
    if (!hint) return;
    
    currentDismissHintId = hintId;
    showDismissModal();
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

async function dismissOnly() {
    if (!currentDismissHintId) return;
    
    try {
        const response = await fetch(`/api/hints/${currentDismissHintId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': apiToken
            }
        });
        
        if (response.ok) {
            showToast(t('hintDismissed'), 'success');
            closeDismissModal();
            loadAdminData();
        } else {
            throw new Error('Failed to dismiss hint');
        }
    } catch (error) {
        console.error('Error dismissing hint:', error);
        showToast(t('error'), 'error');
    }
}

async function dismissAndComplete() {
    if (!currentDismissHintId) return;
    
    try {
        // First find the item that this hint belongs to
        const hint = wishlistItems.flatMap(item => 
            item.hints.map(h => ({...h, itemId: item.id}))
        ).find(h => h.id === currentDismissHintId);
        
        if (!hint) {
            throw new Error('Hint not found');
        }
        
        // Dismiss the hint
        const dismissResponse = await fetch(`/api/hints/${currentDismissHintId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': apiToken
            }
        });
        
        if (!dismissResponse.ok) {
            throw new Error('Failed to dismiss hint');
        }
        
        // Mark the item as completed (disabled = true)
        const completeResponse = await fetch(`/api/items/${hint.itemId}`, {
            method: 'PUT',
            headers: {
                'Authorization': apiToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                disabled: true
            })
        });
        
        if (!completeResponse.ok) {
            throw new Error('Failed to mark item as completed');
        }
        
        showToast(t('itemCompleted'), 'success');
        closeDismissModal();
        loadAdminData();
        
    } catch (error) {
        console.error('Error dismissing and completing:', error);
        showToast(t('error'), 'error');
    }
}

async function dismissAllHints() {
    if (!confirm(t('confirmDismissAll'))) return;
    
    const allHints = wishlistItems.flatMap(item => item.hints);
    for (const hint of allHints) {
        await dismissHint(hint.id);
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

// Modern Tag Input System
let currentTags = [];

function initializeTagInput() {
    const tagInputField = document.getElementById('tag-input-field');
    const tagContainer = document.getElementById('tag-input-container');
    
    tagInputField.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const tagText = this.value.trim();
            if (tagText && !currentTags.includes(tagText)) {
                addTagPill(tagText);
                this.value = '';
            }
        } else if (e.key === 'Backspace' && this.value === '' && currentTags.length > 0) {
            // Remove last tag when backspace is pressed on empty input
            removeTagPill(currentTags[currentTags.length - 1]);
        }
    });
    
    tagInputField.addEventListener('blur', function() {
        const tagText = this.value.trim();
        if (tagText && !currentTags.includes(tagText)) {
            addTagPill(tagText);
            this.value = '';
        }
    });
}

function addTagPill(tagText) {
    if (currentTags.includes(tagText)) return;
    
    currentTags.push(tagText);
    renderTagPills();
    updateHiddenTagInput();
}

function removeTagPill(tagText) {
    currentTags = currentTags.filter(tag => tag !== tagText);
    renderTagPills();
    updateHiddenTagInput();
}

function renderTagPills() {
    const container = document.getElementById('tag-input-container');
    const inputField = document.getElementById('tag-input-field');
    
    // Clear existing pills (but keep the input field)
    const existingPills = container.querySelectorAll('.tag-input-pill');
    existingPills.forEach(pill => pill.remove());
    
    // Add pills before the input field
    currentTags.forEach(tag => {
        const pill = document.createElement('div');
        pill.className = 'tag-input-pill';
        pill.style.backgroundColor = getTagColor(tag); // Apply color based on hash
        pill.innerHTML = `
            <span>${escapeHtml(tag)}</span>
            <span class="remove-tag" onclick="removeTagPill('${escapeHtml(tag)}')">
                <i class="fas fa-times"></i>
            </span>
        `;
        container.insertBefore(pill, inputField);
    });
}

function updateHiddenTagInput() {
    document.getElementById('item-tags').value = currentTags.join(', ');
}

function clearTagInput() {
    currentTags = [];
    renderTagPills();
    updateHiddenTagInput();
    document.getElementById('tag-input-field').value = '';
}

function setTagsFromString(tagsString) {
    currentTags = tagsString.split(',').map(t => t.trim()).filter(t => t);
    renderTagPills();
    updateHiddenTagInput();
}

function updateTagSuggestions() {
    const container = document.getElementById('tag-suggestions');
    container.innerHTML = existingTags.map(tag => `
        <button type="button" onclick="addTagPill('${escapeHtml(tag)}')" 
                class="tag-suggestion">
            ${escapeHtml(tag)}
        </button>
    `).join('');
}

function addTagToInput(tag) {
    addTagPill(tag);
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Image navigation variables
let currentImageItem = null;
let currentImageIndex = 0;

// Image modal functions
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

function closeImageModal() {
    const modal = document.getElementById('image-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset navigation variables
    currentImageItem = null;
    currentImageIndex = 0;
}

// Remove auto-validation - only authenticate on button click or Enter key

// Close modals on escape key and click outside
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeItemModal();
        closeAdminItemModal();
        closeImageModal();
        closeDismissModal();
    }
    
    // Image navigation with arrow keys
    if (document.getElementById('image-modal').style.display === 'flex') {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            navigateImage(-1);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            navigateImage(1);
        }
    }
});

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    // Close add/edit item modal when clicking outside
    const itemModal = document.getElementById('item-modal');
    if (itemModal && itemModal.style.display === 'flex' && e.target === itemModal) {
        closeItemModal();
    }
    
    // Close admin item detail modal when clicking outside
    const adminItemDetailModal = document.getElementById('admin-item-detail-modal');
    if (adminItemDetailModal && adminItemDetailModal.style.display === 'flex' && e.target === adminItemDetailModal) {
        closeAdminItemModal();
    }
    
    // Close image modal when clicking outside
    const imageModal = document.getElementById('image-modal');
    if (imageModal && imageModal.style.display === 'flex' && e.target === imageModal) {
        closeImageModal();
    }
    
    // Close dismiss modal when clicking outside
    const dismissModal = document.getElementById('dismiss-modal');
    if (dismissModal && dismissModal.style.display === 'flex' && e.target === dismissModal) {
        closeDismissModal();
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Just initialize the UI, don't auto-authenticate
    updateUI();
});

// Initialize WYSIWYG Editor
function initializeEditor() {
    try {
        const editorElement = document.getElementById('item-description-editor');
        if (!editorElement) {
            return;
        }
        
        if (quillEditor) {
            return;
        }
        
        
        // Initialize Quill editor with minimal toolbar
        quillEditor = new Quill('#item-description-editor', {
            theme: 'snow',
            placeholder: t('descriptionPlaceholder') || 'Add a detailed description...',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link'],
                    ['clean']
                ]
            }
        });
        
        // Configure link handling to add proper attributes
        const tooltip = quillEditor.theme.tooltip;
        const originalSave = tooltip.save.bind(tooltip);
        tooltip.save = function() {
            originalSave();
            // Add target and rel attributes to all links after creation
            setTimeout(() => {
                const links = quillEditor.root.querySelectorAll('a');
                links.forEach(link => {
                    if (!link.hasAttribute('target')) {
                        link.setAttribute('target', '_blank');
                        link.setAttribute('rel', 'noopener noreferrer');
                    }
                });
            }, 10);
        };
        
        // Sync editor content with hidden textarea
        quillEditor.on('text-change', function() {
            const html = quillEditor.root.innerHTML;
            document.getElementById('item-description').value = html;
        });
        
        
    } catch (error) {
        console.error('❌ Error initializing editor:', error);
        // Fallback: show the textarea if editor fails
        const textarea = document.getElementById('item-description');
        if (textarea) {
            textarea.classList.remove('hidden');
            textarea.style.height = '200px';
        }
    }
}

// Admin View Toggle Functions
function setAdminView(view) {
    currentAdminView = view;
    
    // Update button states
    document.getElementById('admin-grid-view-btn').classList.toggle('active', view === 'grid');
    document.getElementById('admin-list-view-btn').classList.toggle('active', view === 'list');
    
    // Save preference
    localStorage.setItem('adminViewPreference', view);
    
    // Re-render with new view
    renderItems();
}

function loadAdminViewPreference() {
    const savedView = localStorage.getItem('adminViewPreference');
    if (savedView && (savedView === 'grid' || savedView === 'list')) {
        currentAdminView = savedView;
        
        // Update button states if elements exist
        const gridBtn = document.getElementById('admin-grid-view-btn');
        const listBtn = document.getElementById('admin-list-view-btn');
        if (gridBtn && listBtn) {
            gridBtn.classList.toggle('active', savedView === 'grid');
            listBtn.classList.toggle('active', savedView === 'list');
        }
    }
}

// Drag and Drop Functions
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
    indicator.innerHTML = '<i class="fas fa-arrows-alt mr-2"></i>Drag items to reorder';
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
            showToast('Order updated successfully', 'success');
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
        showToast('Failed to update order', 'error');
        // Reload to restore original order
        loadAdminData();
    }
}

// Animation helper functions
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

// Smooth position swap animation
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

// Request debouncing to prevent server overload
let isReordering = false;

// Move item up/down functions
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
        showToast('Failed to move item', 'error');
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
        showToast('Failed to move item', 'error');
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

// Test notification function
async function testNotification() {
    if (!apiToken) {
        showToast(t('pleaseAuthenticate'), 'error');
        return;
    }
    
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
            showToast('Test notification sent! Check your notification service.', 'success');
        } else {
            // Handle different types of errors with appropriate toast styles
            if (response.status === 400 && result.message && result.message.includes('not configured')) {
                // Configuration issue - show as warning, not error
                showToast(result.message, 'warning');
            } else {
                // Actual error - show as error
                showToast(result.message || 'Failed to send test notification', 'error');
            }
        }
    } catch (error) {
        console.error('Error sending test notification:', error);
        showToast('Error sending test notification', 'error');
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
        showToast('Failed to update order', 'error');
        // Reload to restore original order
        loadAdminData();
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    updateUI();
    loadHeroMessage(); // Load hero message on page load
    loadPersonalizedTexts(); // Load personalized texts on page load
    loadDynamicFavicon(); // Load dynamic favicon on page load
    loadAdminViewPreference(); // Load view preference
    initializeEditor();
    initializeTagInput();
});
