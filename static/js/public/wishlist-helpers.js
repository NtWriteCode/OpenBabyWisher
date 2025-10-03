// Wishlist Helper Functions

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getPriorityIcon(priority) {
    const priorityValue = priority || 2;
    
    switch(priorityValue) {
        case 1:
            return `<span class="priority-badge priority-1" title="${t('priority1Desc')}">!</span>`;
        case 2:
            return `<span class="priority-badge priority-2" title="${t('priority2Desc')}">!</span>`;
        case 3:
            return `<span class="priority-badge priority-3" title="${t('priority3Desc')}">!!</span>`;
        case 4:
            return `<span class="priority-badge priority-4" title="${t('priority4Desc')}">!</span>`;
        case 5:
            return `<span class="priority-badge priority-5" title="${t('priority5Desc')}">!!</span>`;
        default:
            return `<span class="priority-badge priority-2" title="${t('priority2Desc')}">!</span>`;
    }
}

function getPriorityBadge(priority) {
    const priorityValue = priority || 2;
    
    switch(priorityValue) {
        case 1:
            return `<span class="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full flex items-center gap-2" title="${t('priority1Desc')}">
                <span class="font-bold text-lg">!</span> ${t('priority1')}
            </span>`;
        case 2:
            return `<span class="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-semibold rounded-full flex items-center gap-2" title="${t('priority2Desc')}">
                <span class="font-bold text-lg">!</span> ${t('priority2')}
            </span>`;
        case 3:
            return `<span class="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-semibold rounded-full flex items-center gap-2" title="${t('priority3Desc')}">
                <span class="font-bold text-lg">!!</span> ${t('priority3')}
            </span>`;
        case 4:
            return `<span class="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full flex items-center gap-2" title="${t('priority4Desc')}">
                <span class="font-bold text-lg">!</span> ${t('priority4')}
            </span>`;
        case 5:
            return `<span class="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full flex items-center gap-2" title="${t('priority5Desc')}">
                <span class="font-bold text-lg">!!</span> ${t('priority5')}
            </span>`;
        default:
            return `<span class="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-semibold rounded-full flex items-center gap-2" title="${t('priority2Desc')}">
                <span class="font-bold text-lg">!</span> ${t('priority2')}
            </span>`;
    }
}
