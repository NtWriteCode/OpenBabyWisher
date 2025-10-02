// Utility Functions

        function createLoadingSkeleton(count = 3) {
            let skeleton = '';
            for (let i = 0; i < count; i++) {
                skeleton += `
                    <div class="glass-card p-6 animate-pulse">
                        <div class="loading-skeleton h-6 w-3/4 mb-4 rounded-lg"></div>
                        <div class="loading-skeleton h-4 w-1/2 mb-2 rounded"></div>
                        <div class="loading-skeleton h-20 w-full rounded-lg"></div>
                    </div>
                `;
            }
            return skeleton;
        }

        function formatDate(dateString) {
            return new Date(dateString).toLocaleDateString(currentLang === 'hu' ? 'hu-HU' : 'en-US');
        }

        function linkifyUrls(text) {
            if (!text) return text;
            
            // Skip if text already contains HTML (likely from rich editor)
            if (text.includes('<a') || text.includes('</a>')) {
                return text;
            }
            
            // URL regex pattern that matches http/https URLs
            const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/gi;
            
            return text.replace(urlRegex, function(url) {
                // Clean up common punctuation at the end of URLs
                let cleanUrl = url;
                let trailingPunctuation = '';
                
                // Check for trailing punctuation and remove it from the URL
                const trailingPunctuationRegex = /([.!?;,]+)$/;
                const match = cleanUrl.match(trailingPunctuationRegex);
                if (match) {
                    trailingPunctuation = match[1];
                    cleanUrl = cleanUrl.slice(0, -trailingPunctuation.length);
                }
                
                // Create a display text (truncate very long URLs)
                let displayText = cleanUrl;
                if (cleanUrl.length > 50) {
                    displayText = cleanUrl.substring(0, 47) + '...';
                }
                
                return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" title="${cleanUrl}">${displayText}</a>${trailingPunctuation}`;
            });
        }
