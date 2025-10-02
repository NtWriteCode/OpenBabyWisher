// Wishlist Data Management Functions

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
