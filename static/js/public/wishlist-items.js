// Wishlist Item Operations

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
