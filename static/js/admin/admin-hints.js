// Admin Hint/Notification Functions

function dismissHint(hintId) {
    // Find the hint to get the item information
    const hint = wishlistItems.flatMap(item => item.hints).find(h => h.id === hintId);
    if (!hint) return;
    
    currentDismissHintId = hintId;
    showDismissModal();
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
