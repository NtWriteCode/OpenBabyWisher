// Base JavaScript - Main Entry Point
// This file has been refactored into multiple core modules for better maintainability

// Initialize language on page load
document.addEventListener('DOMContentLoaded', function() {
    updateLanguageToggle();
    loadHeroMessage(); // Load hero message first, which will call updateUI()
    loadPersonalizedTexts(); // Load personalized texts
});