// Admin Panel - Main Entry Point
// This file has been refactored into multiple modules for better maintainability

// Global variables (shared across all admin modules)
let wishlistItems = [];
let existingTags = [];
let currentEditingItem = null;
let apiToken = '';
let isAuthenticated = false;
let quillEditor = null;
let currentAdminView = 'grid'; // 'grid' or 'list'
let sortModeActive = false;
let draggedElement = null;

// Additional global variables for specific features
let currentImageItem = null;
let currentImageIndex = 0;
let currentDismissHintId = null;

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