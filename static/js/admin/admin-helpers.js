// Admin Helper Functions

function showLoading() {
    document.getElementById('loading-overlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}

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

function initializeEditor() {
    const textarea = document.getElementById('item-description');
    if (textarea) {
        // Create a simple rich text setup
        const container = textarea.parentElement;
        
        // Check if Quill is available
        if (typeof Quill !== 'undefined') {
            // Hide the original textarea
            textarea.style.display = 'none';
            
            // Create Quill editor container
            const editorDiv = document.createElement('div');
            editorDiv.id = 'quill-editor';
            editorDiv.style.minHeight = '200px';
            editorDiv.style.backgroundColor = 'white';
            container.appendChild(editorDiv);
            
            // Initialize Quill
            quillEditor = new Quill('#quill-editor', {
                theme: 'snow',
                modules: {
                    toolbar: [
                        ['bold', 'italic', 'underline'],
                        ['link'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['clean']
                    ]
                },
                placeholder: t('descriptionPlaceholder') || 'Add a detailed description...'
            });
            
            // Sync Quill content with textarea
            quillEditor.on('text-change', function() {
                const html = quillEditor.root.innerHTML;
                textarea.value = html === '<p><br></p>' ? '' : html;
            });
            
            // Set initial content if textarea has content
            if (textarea.value) {
                quillEditor.root.innerHTML = textarea.value;
            }
        } else {
            // Fallback to regular textarea with some enhancements
            textarea.style.minHeight = '200px';
            textarea.style.resize = 'vertical';
            textarea.placeholder = t('descriptionPlaceholder') || 'Add a detailed description...';
            
            // Auto-resize functionality
            textarea.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = this.scrollHeight + 'px';
            });
            
            // Set initial height
            textarea.style.height = '200px';
        }
    }
}
