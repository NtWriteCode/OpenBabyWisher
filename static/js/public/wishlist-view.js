// Wishlist View Management Functions

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
    // On mobile (< 768px), always use list view since grid is single column anyway
    if (window.innerWidth < 768) {
        currentPublicView = 'list';
        return;
    }
    
    const savedView = localStorage.getItem('publicViewPreference');
    if (savedView && (savedView === 'grid' || savedView === 'list')) {
        currentPublicView = savedView;
        
        // Update button states
        document.getElementById('grid-view-btn').classList.toggle('active', savedView === 'grid');
        document.getElementById('list-view-btn').classList.toggle('active', savedView === 'list');
    }
}
