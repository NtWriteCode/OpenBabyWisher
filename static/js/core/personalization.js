// Personalization Features

        let currentHeroMessage = 'Help friends and family choose the perfect gifts'; // Default fallback

        let personalizedTexts = {}; // Store personalized texts

        async function loadHeroMessage() {
            try {
                const response = await fetch(`/api/hero-message?lang=${currentLang}`);
                const data = await response.json();
                currentHeroMessage = data.message;
                updateUI(); // Refresh UI with new message
            } catch (error) {
                console.error('Error loading hero message:', error);
                // Keep the default message if loading fails
            }
        }

        async function loadPersonalizedTexts() {
            try {
                const response = await fetch(`/api/personalized-texts?lang=${currentLang}`);
                personalizedTexts = await response.json();
                updatePersonalizedUI();
            } catch (error) {
                console.error('Error loading personalized texts:', error);
            }
        }

        async function loadDynamicFavicon() {
            try {
                const response = await fetch('/api/baby-initial');
                const data = await response.json();
                const initial = data.initial;
                
                const faviconUrl = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90' fill='%23667eea'>${initial}</text></svg>`;
                document.getElementById('dynamic-favicon').href = faviconUrl;
            } catch (error) {
                console.error('Error loading favicon:', error);
            }
        }

        function updatePersonalizedUI() {
            if (personalizedTexts.page_title) {
                document.getElementById('page-title').textContent = personalizedTexts.page_title;
            }
            if (personalizedTexts.admin_title) {
                const adminTitleEl = document.getElementById('admin-title');
                if (adminTitleEl) {
                    adminTitleEl.textContent = personalizedTexts.admin_title;
                }
            }
        }
