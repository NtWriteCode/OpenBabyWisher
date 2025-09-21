let wishlistItems = [];
let existingTags = [];
let currentEditingItem = null;
let apiToken = '';
let isAuthenticated = false;
let quillEditor = null;

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
        addFirstItem: "Add Your First Item"
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
        addFirstItem: "Első Elem Hozzáadása"
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
            
            console.log('✅ Authentication successful, token stored:', apiToken.substring(0, 10) + '...');
            
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
        console.log('🔄 Loading admin data...');
        
        const [itemsResponse, tagsResponse] = await Promise.all([
            fetch('/api/items'),
            fetch('/api/tags')
        ]);
        
        console.log('📊 Items response status:', itemsResponse.status);
        console.log('🏷️ Tags response status:', tagsResponse.status);
        
        if (!itemsResponse.ok) {
            throw new Error(`Items API failed: ${itemsResponse.status}`);
        }
        
        if (!tagsResponse.ok) {
            throw new Error(`Tags API failed: ${tagsResponse.status}`);
        }
        
        wishlistItems = await itemsResponse.json();
        existingTags = await tagsResponse.json();
        
        console.log('✅ Loaded', wishlistItems.length, 'items and', existingTags.length, 'tags');
        
        updateStats();
        renderItems();
        renderHints();
        
        console.log('✅ Admin data loaded successfully');
        
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
    const container = document.getElementById('items-container');
    const welcomeMessage = document.getElementById('welcome-message');
    const actionButtons = document.getElementById('action-buttons');
    
    // Show welcome message if no items, otherwise show normal interface
    if (wishlistItems.length === 0) {
        welcomeMessage.classList.remove('hidden');
        actionButtons.classList.add('hidden');
        container.innerHTML = '';
        return;
    } else {
        welcomeMessage.classList.add('hidden');
        actionButtons.classList.remove('hidden');
    }
    
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
                                <div class="card-image" onclick="event.stopPropagation(); openImageModal('${img.url}', '${escapeHtml(img.original_filename)}')">
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
    
    // Apply tag colors after rendering
    setTimeout(() => {
        applyTagColors();
    }, 10);
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
                            ${item.images.map(img => `
                                <div class="relative group">
                                    <img src="${img.url}" 
                                         alt="${escapeHtml(img.original_filename)}"
                                         onclick="openImageModal('${img.url}', '${escapeHtml(img.original_filename)}')"
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
    
    console.log('🔧 saveItem called with token:', apiToken.substring(0, 10) + '...');
    
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

async function dismissHint(hintId) {
    try {
        const response = await fetch(`/api/hints/${hintId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': apiToken
            }
        });
        
        if (response.ok) {
            showToast(t('hintDismissed'), 'success');
            loadAdminData();
        } else {
            throw new Error('Failed to dismiss hint');
        }
    } catch (error) {
        console.error('Error dismissing hint:', error);
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

// Remove auto-validation - only authenticate on button click or Enter key

// Close modal on escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeItemModal();
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
            console.log('⏳ Editor element not found, will initialize when modal opens');
            return;
        }
        
        if (quillEditor) {
            console.log('✅ Editor already initialized');
            return;
        }
        
        console.log('🎨 Initializing Quill editor...');
        
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
        
        // Sync editor content with hidden textarea
        quillEditor.on('text-change', function() {
            const html = quillEditor.root.innerHTML;
            document.getElementById('item-description').value = html;
        });
        
        console.log('✅ Quill editor initialized successfully');
        
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

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    updateUI();
    loadHeroMessage(); // Load hero message on page load
    loadPersonalizedTexts(); // Load personalized texts on page load
    loadDynamicFavicon(); // Load dynamic favicon on page load
    initializeEditor();
    initializeTagInput();
});
