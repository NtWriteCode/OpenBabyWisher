// Tag Color System

        function hashTagName(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }
            return Math.abs(hash);
        }

        function hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }

        function getLuminance(r, g, b) {
            // Convert RGB to relative luminance using WCAG formula
            const [rs, gs, bs] = [r, g, b].map(c => {
                c = c / 255;
                return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        }

        function getContrastColor(backgroundColor) {
            const rgb = hexToRgb(backgroundColor);
            if (!rgb) return '#ffffff'; // fallback to white
            
            const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
            // Use dark text for light backgrounds (luminance > 0.5)
            return luminance > 0.5 ? '#2d3748' : '#ffffff';
        }

        function getTagColor(tagName) {
            const hash = hashTagName(tagName.toLowerCase());
            
            // Define a vibrant, colorful palette with reduced saturation for readability
            const colorfulPalette = [
                // Reds & Pinks
                '#e57373', // Soft Red
                '#f06292', // Soft Pink
                '#ad7a99', // Dusty Rose
                '#c48b9f', // Mauve
                
                // Oranges & Corals
                '#ffb74d', // Soft Orange
                '#ff8a65', // Soft Coral
                '#d4a574', // Peach
                '#e6a85c', // Apricot
                
                // Yellows & Golds
                '#fff176', // Soft Yellow
                '#dcc866', // Gold
                '#d4c441', // Mustard
                '#c9b037', // Brass
                
                // Greens
                '#81c784', // Soft Green
                '#a5d6a7', // Light Green
                '#66bb6a', // Forest Green
                '#7cb342', // Lime Green
                '#689f38', // Olive Green
                '#558b2f', // Dark Green
                
                // Teals & Cyans
                '#4db6ac', // Teal
                '#26a69a', // Dark Teal
                '#00acc1', // Cyan
                '#0097a7', // Dark Cyan
                
                // Blues
                '#64b5f6', // Soft Blue
                '#42a5f5', // Sky Blue
                '#2196f3', // Blue
                '#1976d2', // Dark Blue
                '#1565c0', // Navy Blue
                '#0d47a1', // Deep Blue
                
                // Purples & Violets
                '#ba68c8', // Soft Purple
                '#ab47bc', // Medium Purple
                '#9c27b0', // Purple
                '#7b1fa2', // Dark Purple
                '#673ab7', // Deep Purple
                '#5e35b1', // Indigo
                
                // Browns & Earth Tones
                '#a1887f', // Soft Brown
                '#8d6e63', // Medium Brown
                '#795548', // Brown
                '#6d4c41', // Dark Brown
                '#5d4037', // Deep Brown
                
                // Additional Unique Colors
                '#f8bbd9', // Light Pink
                '#e1bee7', // Light Purple
                '#c5cae9', // Light Indigo
                '#bbdefb', // Light Blue
                '#b2dfdb', // Light Teal
                '#c8e6c9', // Light Green
                '#dcedc8', // Pale Green
                '#f0f4c3', // Pale Lime
                '#fff9c4', // Pale Yellow
                '#ffecb3', // Pale Orange
                '#ffccbc', // Pale Peach
                '#d7ccc8', // Pale Brown
            ];
            
            const colorIndex = hash % colorfulPalette.length;
            return colorfulPalette[colorIndex];
        }

        function applyTagColors() {
            // Apply colors to all tag items
            document.querySelectorAll('.tag-item').forEach(tagElement => {
                const tagText = tagElement.textContent.trim();
                if (tagText) {
                    const backgroundColor = getTagColor(tagText);
                    const textColor = getContrastColor(backgroundColor);
                    
                    tagElement.style.backgroundColor = backgroundColor;
                    tagElement.style.color = textColor;
                    
                    // Adjust text shadow based on text color
                    if (textColor === '#2d3748') {
                        // Dark text on light background - use light shadow
                        tagElement.style.textShadow = '0 1px 2px rgba(255, 255, 255, 0.8)';
                    } else {
                        // White text on dark background - use dark shadow
                        tagElement.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.4)';
                    }
                }
            });
            
            // Apply colors to tag input pills
            document.querySelectorAll('.tag-input-pill').forEach(pillElement => {
                const tagText = pillElement.querySelector('span:first-child')?.textContent.trim();
                if (tagText) {
                    const backgroundColor = getTagColor(tagText);
                    const textColor = getContrastColor(backgroundColor);
                    
                    pillElement.style.backgroundColor = backgroundColor;
                    pillElement.style.color = textColor;
                    
                    // Adjust text shadow based on text color
                    if (textColor === '#2d3748') {
                        // Dark text on light background - use light shadow
                        pillElement.style.textShadow = '0 1px 2px rgba(255, 255, 255, 0.8)';
                    } else {
                        // White text on dark background - use dark shadow
                        pillElement.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.4)';
                    }
                }
            });
        }
