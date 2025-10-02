// Language Management

        function setLanguage(lang) {
            currentLang = lang;
            localStorage.setItem('language', lang);
            loadHeroMessage(); // Load new message for the new language
            loadPersonalizedTexts(); // Load new personalized texts for the new language
            updateLanguageToggle();
        }

        function updateUI() {
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (el.tagName === 'INPUT' && el.type !== 'button') {
                    el.placeholder = t(key);
                } else {
                    el.textContent = t(key);
                }
            });
        }

        function updateLanguageToggle() {
            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.lang === currentLang);
            });
        }
