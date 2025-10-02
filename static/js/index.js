// Public Wishlist Viewer - Main Entry Point
// This file has been refactored into multiple modules for better maintainability

// Global variables (shared across all wishlist modules)
let wishlistItems = [];
let predefinedMessages = {};
let currentHintItemId = null;
let selectedQuickMessage = '';
let currentPublicView = 'grid'; // 'grid' or 'list'

// Additional global variables for specific features
let currentImageItem = null;
let currentImageIndex = 0;

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

// Load wishlist on page load
document.addEventListener('DOMContentLoaded', function() {
    loadPublicViewPreference(); // Load view preference first
    loadWishlist();
    loadHeroMessage(); // Load hero message on page load
    loadPersonalizedTexts(); // Load personalized texts on page load
    loadDynamicFavicon(); // Load dynamic favicon on page load
});