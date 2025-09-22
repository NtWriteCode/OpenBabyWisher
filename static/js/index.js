let wishlistItems = [];
let predefinedMessages = {};
let currentHintItemId = null;
let selectedQuickMessage = '';
let currentPublicView = 'grid'; // 'grid' or 'list'

// Enhanced translations
const wishlistTranslations = {
    en: {
        ...translations.en,
        items: "items",
        highPriority: "high priority", 
        hints: "hints received",
        noItems: "No items yet",
        noItemsDesc: "The wishlist is being prepared with love",
        quickMessages: "Choose your message",
        selectMessage: "Please select a message",
        hintDescription: "Let others know you're planning to get this gift",
        cancel: "Cancel",
        priority: "Priority",
        available: "Available",
        claimed: "Someone's got this!",
        completed: "Completed",
        viewImage: "View Image",
        sendingHint: "Sending hint...",
        hintSent: "Hint sent successfully! 🎉",
        errorSending: "Failed to send hint",
        selectOrType: "Select a quick message or type your own"
    },
    hu: {
        ...translations.hu,
        items: "elem",
        highPriority: "magas prioritás",
        hints: "jelzés érkezett", 
        noItems: "Még nincsenek elemek",
        noItemsDesc: "A kívánságlistát szeretettel készítjük",
        quickMessages: "Válassz üzenetet",
        selectMessage: "Kérlek válassz egy üzenetet",
        hintDescription: "Tudasd másokkal, hogy tervezed megvenni ezt az ajándékot",
        cancel: "Mégse",
        priority: "Prioritás",
        available: "Elérhető",
        claimed: "Valaki már gondoskodik róla!",
        completed: "Befejezve",
        viewImage: "Kép Megtekintése",
        sendingHint: "Jelzés küldése...",
        hintSent: "Jelzés sikeresen elküldve! 🎉",
        errorSending: "Jelzés küldése sikertelen",
        selectOrType: "Válassz egy gyors üzenetet vagy írj sajátot"
    }
};

// Merge translations
Object.assign(translations.en, wishlistTranslations.en);
Object.assign(translations.hu, wishlistTranslations.hu);

async function loadWishlist() {
    const container = document.getElementById('wishlist-grid');
    const loading = document.getElementById('loading-state');
    const empty = document.getElementById('empty-state');
    
    // Show loading skeleton
    loading.innerHTML = createLoadingSkeleton(6);
    loading.style.display = 'grid';
    
    try {
        const [itemsResponse, messagesResponse] = await Promise.all([
            fetch('/api/items'),
            fetch('/api/predefined-messages')
        ]);
        
        wishlistItems = await itemsResponse.json();
        predefinedMessages = await messagesResponse.json();
        
        updateStats();
        renderWishlist();
        
    } catch (error) {
        console.error('Error loading wishlist:', error);
        showToast(t('error'), 'error');
    } finally {
        loading.style.display = 'none';
    }
}

function updateStats() {
    const totalItems = wishlistItems.length;
    const completedItems = wishlistItems.filter(item => item.disabled).length;
    const totalHints = wishlistItems.reduce((sum, item) => sum + item.hints.length, 0);
    
    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('completed-items').textContent = completedItems;
    document.getElementById('hints-count').textContent = totalHints;
}

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

function openItemModal(itemId) {
    const item = wishlistItems.find(i => i.id === itemId);
    if (!item) return;
    
    // Create or update item detail modal
    let modal = document.getElementById('item-detail-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'item-detail-modal';
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
                    <button onclick="closeItemModal()" class="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
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
                                <img src="${img.url}" 
                                     alt="${escapeHtml(img.original_filename)}"
                                     onclick="openImageModal('${img.url}', '${escapeHtml(img.original_filename)}', ${item.id}, ${imgIndex})"
                                     class="w-full h-32 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform">
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Action Button -->
                ${!item.disabled ? `
                    <div class="text-center">
                        <button onclick="closeItemModal(); openHintModal(${item.id})" class="btn-modern">
                            <i class="fas fa-gift mr-2"></i>
                            ${t('iGotThis') || "I've got this!"}
                        </button>
                    </div>
                ` : ''}
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

function closeItemModal() {
    const modal = document.getElementById('item-detail-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    document.body.style.overflow = 'auto';
}

function toggleDescription(itemId) {
    const descElement = document.getElementById(`desc-${itemId}`);
    const toggleText = document.getElementById(`toggle-text-${itemId}`);
    const toggleIcon = document.getElementById(`toggle-icon-${itemId}`);
    
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

function openHintModal(itemId) {
    currentHintItemId = itemId;
    const modal = document.getElementById('hint-modal');
    const quickMessagesContainer = document.getElementById('quick-messages');
    
    // Clear previous selection
    selectedQuickMessage = '';
    
    // Populate quick messages
    const messages = predefinedMessages[currentLang] || predefinedMessages.en || [];
    quickMessagesContainer.innerHTML = messages.map(msg => `
        <button onclick="selectQuickMessage('${escapeHtml(msg)}')" 
                class="quick-message-btn p-3 text-left border-2 border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all">
            ${escapeHtml(msg)}
        </button>
    `).join('');
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeHintModal() {
    const modal = document.getElementById('hint-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    currentHintItemId = null;
    
    // Clear selected state
    document.querySelectorAll('.quick-message-btn').forEach(btn => {
        btn.classList.remove('border-purple-400', 'bg-purple-50');
    });
}

function selectQuickMessage(message) {
    // Update UI to show selection
    document.querySelectorAll('.quick-message-btn').forEach(btn => {
        btn.classList.remove('border-purple-400', 'bg-purple-50');
    });
    
    event.target.classList.add('border-purple-400', 'bg-purple-50');
    
    // Store selected message
    selectedQuickMessage = message;
}

// Image navigation variables
let currentImageItem = null;
let currentImageIndex = 0;

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

async function sendHint() {
    if (!selectedQuickMessage) {
        showToast(t('selectMessage') || 'Please select a message', 'warning');
        return;
    }
    
    const message = selectedQuickMessage;
    
    const sendBtn = document.getElementById('send-hint-btn');
    const originalText = sendBtn.innerHTML;
    
    // Show loading state
    sendBtn.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        <span>${t('sendingHint')}</span>
    `;
    sendBtn.disabled = true;
    
    try {
        const response = await fetch(`/api/items/${currentHintItemId}/hint`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });
        
        if (response.ok) {
            showToast(t('hintSent'), 'success');
            closeHintModal();
            loadWishlist(); // Reload to show the new hint
        } else {
            throw new Error('Failed to send hint');
        }
    } catch (error) {
        console.error('Error sending hint:', error);
        showToast(t('errorSending'), 'error');
    } finally {
        sendBtn.innerHTML = originalText;
        sendBtn.disabled = false;
    }
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Override updateUI to also update wishlist
const originalUpdateUI = window.updateUI;
window.updateUI = function() {
    originalUpdateUI();
    if (wishlistItems.length > 0) {
        renderWishlist();
    }
};

// Event listeners
document.getElementById('send-hint-btn').addEventListener('click', sendHint);

// Close modals on escape key and click outside
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeItemModal();
        closeHintModal();
        closeImageModal();
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
    // Close item detail modal when clicking outside
    const itemDetailModal = document.getElementById('item-detail-modal');
    if (itemDetailModal && itemDetailModal.style.display === 'flex' && e.target === itemDetailModal) {
        closeItemModal();
    }
    
    // Close hint modal when clicking outside
    const hintModal = document.getElementById('hint-modal');
    if (hintModal && hintModal.style.display === 'flex' && e.target === hintModal) {
        closeHintModal();
    }
    
    // Close image modal when clicking outside
    const imageModal = document.getElementById('image-modal');
    if (imageModal && imageModal.style.display === 'flex' && e.target === imageModal) {
        closeImageModal();
    }
});

// View Toggle Functions
function setPublicView(view) {
    currentPublicView = view;
    
    // Update button states
    document.getElementById('grid-view-btn').classList.toggle('active', view === 'grid');
    document.getElementById('list-view-btn').classList.toggle('active', view === 'list');
    
    // Save preference
    localStorage.setItem('publicViewPreference', view);
    
    // Re-render with new view
    renderWishlist();
}

function loadPublicViewPreference() {
    const savedView = localStorage.getItem('publicViewPreference');
    if (savedView && (savedView === 'grid' || savedView === 'list')) {
        currentPublicView = savedView;
        
        // Update button states
        document.getElementById('grid-view-btn').classList.toggle('active', savedView === 'grid');
        document.getElementById('list-view-btn').classList.toggle('active', savedView === 'list');
    }
}

// Load wishlist on page load
document.addEventListener('DOMContentLoaded', function() {
    loadPublicViewPreference(); // Load view preference first
    loadWishlist();
    loadHeroMessage(); // Load hero message on page load
    loadPersonalizedTexts(); // Load personalized texts on page load
    loadDynamicFavicon(); // Load dynamic favicon on page load
});
