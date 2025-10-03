// Wishlist Modal Functions

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
                            ${getPriorityBadge(item.priority)}
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

function openHintModal(itemId) {
    currentHintItemId = itemId;
    const modal = document.getElementById('hint-modal');
    const quickMessagesContainer = document.getElementById('quick-messages');
    const customContainer = document.getElementById('custom-message-container');
    const customInput = document.getElementById('custom-message-input');
    
    // Clear previous selection and custom input
    selectedQuickMessage = '';
    customInput.value = '';
    customContainer.style.display = 'none';
    updateCharCount();
    
    // Populate quick messages
    const messages = predefinedMessages[currentLang] || predefinedMessages.en || [];
    quickMessagesContainer.innerHTML = messages.map((msg, index) => `
        <button onclick="selectQuickMessage('${escapeHtml(msg)}', ${index === messages.length - 1})" 
                class="quick-message-btn p-3 text-left border-2 border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all">
            ${escapeHtml(msg)}
        </button>
    `).join('');
    
    // Add character counter event listener
    customInput.addEventListener('input', updateCharCount);
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function updateCharCount() {
    const customInput = document.getElementById('custom-message-input');
    const charCount = document.getElementById('char-count');
    if (customInput && charCount) {
        charCount.textContent = customInput.value.length;
    }
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

function selectQuickMessage(message, isCustom = false) {
    const customContainer = document.getElementById('custom-message-container');
    const customInput = document.getElementById('custom-message-input');
    
    // Update UI to show selection
    document.querySelectorAll('.quick-message-btn').forEach(btn => {
        btn.classList.remove('border-purple-400', 'bg-purple-50');
    });
    
    if (event && event.target) {
        event.target.classList.add('border-purple-400', 'bg-purple-50');
    }
    
    if (isCustom) {
        // Show custom input and clear predefined selection
        customContainer.style.display = 'block';
        customInput.focus();
        selectedQuickMessage = ''; // Will use custom input instead
    } else {
        // Hide custom input and use predefined message
        customContainer.style.display = 'none';
        selectedQuickMessage = message;
    }
}
