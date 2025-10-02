// Admin Tag Management Functions

function initializeTagInput() {
    const tagInputField = document.getElementById('tag-input-field');
    const tagContainer = document.getElementById('tag-input-container');
    
    tagInputField.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const tagText = this.value.trim();
            if (tagText && !currentTags.includes(tagText)) {
                addTagPill(tagText);
                this.value = '';
            }
        } else if (e.key === 'Backspace' && this.value === '' && currentTags.length > 0) {
            // Remove last tag when backspace is pressed on empty input
            removeTagPill(currentTags[currentTags.length - 1]);
        }
    });
    
    tagInputField.addEventListener('blur', function() {
        const tagText = this.value.trim();
        if (tagText && !currentTags.includes(tagText)) {
            addTagPill(tagText);
            this.value = '';
        }
    });
}

function addTagPill(tagText) {
    if (currentTags.includes(tagText)) return;
    
    currentTags.push(tagText);
    renderTagPills();
    updateHiddenTagInput();
}

function removeTagPill(tagText) {
    currentTags = currentTags.filter(tag => tag !== tagText);
    renderTagPills();
    updateHiddenTagInput();
}

function renderTagPills() {
    const container = document.getElementById('tag-input-container');
    const inputField = document.getElementById('tag-input-field');
    
    // Clear existing pills (but keep the input field)
    const existingPills = container.querySelectorAll('.tag-input-pill');
    existingPills.forEach(pill => pill.remove());
    
    // Add pills before the input field
    currentTags.forEach(tag => {
        const pill = document.createElement('div');
        pill.className = 'tag-input-pill';
        pill.style.backgroundColor = getTagColor(tag); // Apply color based on hash
        pill.innerHTML = `
            <span>${escapeHtml(tag)}</span>
            <span class="remove-tag" onclick="removeTagPill('${escapeHtml(tag)}')">
                <i class="fas fa-times"></i>
            </span>
        `;
        container.insertBefore(pill, inputField);
    });
}

function updateHiddenTagInput() {
    document.getElementById('item-tags').value = currentTags.join(', ');
}

function clearTagInput() {
    currentTags = [];
    renderTagPills();
    updateHiddenTagInput();
    document.getElementById('tag-input-field').value = '';
}

function setTagsFromString(tagsString) {
    currentTags = tagsString.split(',').map(t => t.trim()).filter(t => t);
    renderTagPills();
    updateHiddenTagInput();
}

function updateTagSuggestions() {
    const container = document.getElementById('tag-suggestions');
    container.innerHTML = existingTags.map(tag => `
        <button type="button" onclick="addTagPill('${escapeHtml(tag)}')" 
                class="tag-suggestion">
            ${escapeHtml(tag)}
        </button>
    `).join('');
}

function addTagToInput(tag) {
    addTagPill(tag);
}
