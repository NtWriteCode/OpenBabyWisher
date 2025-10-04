// Admin View Management Functions

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
    // On mobile (< 768px), always use list view since grid is single column anyway
    if (window.innerWidth < 768) {
        currentAdminView = 'list';
        return;
    }
    
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
