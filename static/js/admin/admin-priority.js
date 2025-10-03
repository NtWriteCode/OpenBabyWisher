// Priority Selector Functions

function selectPriority(priority) {
    // Update hidden input
    document.getElementById('item-priority').value = priority;
    
    // Update pill visual states
    document.querySelectorAll('.priority-pill').forEach(pill => {
        if (parseInt(pill.dataset.priority) === priority) {
            pill.classList.add('active');
        } else {
            pill.classList.remove('active');
        }
    });
}

// Update pill tooltips with translations on page load
document.addEventListener('DOMContentLoaded', function() {
    updatePriorityTooltips();
});

function updatePriorityTooltips() {
    for (let i = 1; i <= 5; i++) {
        const pill = document.querySelector(`[data-priority="${i}"]`);
        if (pill) {
            pill.title = t(`priority${i}Desc`);
        }
    }
}

