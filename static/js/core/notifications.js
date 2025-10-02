// Toast Notifications

        function showToast(message, type = 'success') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            
            const icons = {
                success: '<i class="fas fa-check-circle text-green-500"></i>',
                error: '<i class="fas fa-exclamation-circle text-red-500"></i>',
                warning: '<i class="fas fa-exclamation-triangle text-yellow-500"></i>',
                info: '<i class="fas fa-info-circle text-blue-500"></i>'
            };
            
            toast.className = 'toast-modern flex items-center gap-3 animate-slide-in';
            toast.innerHTML = `
                ${icons[type] || icons.info}
                <span class="font-medium">${message}</span>
                <button onclick="this.parentElement.remove()" class="ml-2 text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            container.appendChild(toast);
            
            setTimeout(() => {
                toast.style.animation = 'fadeOut 0.3s ease-out forwards';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
