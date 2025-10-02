// Admin Authentication Functions

function showAuthMessage(message, type) {
    const messageEl = document.getElementById('auth-message');
    messageEl.textContent = message;
    messageEl.className = `text-sm mt-3 mb-1 min-h-[1.25rem] ${
        type === 'error' ? 'text-red-600' : 
        type === 'success' ? 'text-green-600' : 
        'text-blue-600'
    }`;
    
    // Clear message after 4 seconds
    setTimeout(() => {
        messageEl.textContent = '';
    }, 4000);
}

async function authenticateAdmin() {
    const tokenInput = document.getElementById('api-token');
    const authBtn = document.getElementById('auth-btn');
    
    const token = tokenInput.value.trim();
    if (!token) {
        showAuthMessage(t('pleaseAuthenticate'), 'error');
        return;
    }
    
    authBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i><span>${t('authenticating') || 'Authenticating...'}</span>`;
    authBtn.disabled = true;
    
    // Clear any previous messages
    document.getElementById('auth-message').textContent = '';
    
    try {
        // Test the token by making a proper auth test call
        const response = await fetch('/api/auth/test', {
            method: 'GET',
            headers: {
                'Authorization': token
            }
        });
        
        if (response.ok) {
            // Authentication successful
            apiToken = token;
            isAuthenticated = true;
            
            
            // Show success state
            document.getElementById('auth-form').classList.add('hidden');
            document.getElementById('auth-success').classList.remove('hidden');
            document.getElementById('admin-content').classList.remove('hidden');
            
            showToast(t('authenticated'), 'success');
            loadAdminData();
        } else {
            // Authentication failed
            showAuthMessage(t('authenticationFailed'), 'error');
            tokenInput.value = '';
            tokenInput.focus();
        }
    } catch (error) {
        console.error('Authentication error:', error);
        showAuthMessage(t('authenticationFailed'), 'error');
        tokenInput.value = '';
        tokenInput.focus();
    } finally {
        authBtn.innerHTML = `<i class="fas fa-sign-in-alt mr-2"></i><span>${t('authenticate')}</span>`;
        authBtn.disabled = false;
    }
}

function logoutAdmin() {
    apiToken = '';
    isAuthenticated = false;
    
    // Reset UI to login state
    document.getElementById('auth-form').classList.remove('hidden');
    document.getElementById('auth-success').classList.add('hidden');
    document.getElementById('admin-content').classList.add('hidden');
    
    // Clear token input
    document.getElementById('api-token').value = '';
    document.getElementById('api-token').focus();

    
    showToast(t('loggedOut') || 'Logged out successfully', 'info');
}
