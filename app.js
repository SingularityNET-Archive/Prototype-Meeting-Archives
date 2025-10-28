// Configuration - UPDATE THESE VALUES
const CONFIG = {
    // GitHub OAuth App Client ID (get from GitHub OAuth App settings)
    GITHUB_CLIENT_ID: 'YOUR_GITHUB_OAUTH_CLIENT_ID',
    
    // Classic Personal Access Token with public_repo or repo scope
    // Generate at: https://github.com/settings/tokens
    GITHUB_PAT: 'YOUR_GITHUB_CLASSIC_PAT',
    
    // Repository details
    REPO_OWNER: 'SingularityNET-Archive',
    REPO_NAME: 'Prototype-Meeting-Archives',
    
    // OAuth redirect URI (must match GitHub OAuth App settings)
    REDIRECT_URI: 'https://singularitynet-archive.github.io/Prototype-Meeting-Archives/'
};

// DOM elements
const loginSection = document.getElementById('loginSection');
const formSection = document.getElementById('formSection');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const meetingForm = document.getElementById('meetingForm');
const submitBtn = document.getElementById('submitBtn');
const alertBox = document.getElementById('alertBox');
const usernameDisplay = document.getElementById('username');

// Initialize app on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're returning from OAuth redirect
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
        // OAuth code received - store it and clean URL
        sessionStorage.setItem('oauth_code', code);
        window.history.replaceState({}, document.title, window.location.pathname);
        showFormSection();
    } else {
        // Check if user was previously logged in
        const savedCode = sessionStorage.getItem('oauth_code');
        if (savedCode) {
            showFormSection();
        } else {
            showLoginSection();
        }
    }
    
    // Set default date to today
    document.getElementById('date').valueAsDate = new Date();
});

// Show alert message
function showAlert(message, type = 'info') {
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type} show`;
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            alertBox.classList.remove('show');
        }, 5000);
    }
}

// Hide alert message
function hideAlert() {
    alertBox.classList.remove('show');
}

// Show login section
function showLoginSection() {
    loginSection.style.display = 'block';
    formSection.style.display = 'none';
    hideAlert();
}

// Show form section
function showFormSection() {
    loginSection.style.display = 'none';
    formSection.style.display = 'block';
    
    // Display a placeholder username (we don't know it yet)
    usernameDisplay.textContent = 'GitHub User';
    hideAlert();
}

// Handle login button click
loginBtn.addEventListener('click', () => {
    // Validate configuration
    if (CONFIG.GITHUB_CLIENT_ID === 'YOUR_GITHUB_OAUTH_CLIENT_ID') {
        showAlert('⚠️ Please configure GITHUB_CLIENT_ID in app.js', 'error');
        return;
    }
    
    // Redirect to GitHub OAuth authorization page
    const authUrl = `https://github.com/login/oauth/authorize?` +
        `client_id=${CONFIG.GITHUB_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(CONFIG.REDIRECT_URI)}&` +
        `scope=user:email`;
    
    window.location.href = authUrl;
});

// Handle logout button click
logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('oauth_code');
    showLoginSection();
    showAlert('Logged out successfully', 'info');
});

// Handle form submission
meetingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate configuration
    if (CONFIG.GITHUB_PAT === 'YOUR_GITHUB_CLASSIC_PAT') {
        showAlert('⚠️ Please configure GITHUB_PAT in app.js', 'error');
        return;
    }
    
    // Get OAuth code from session
    const oauthCode = sessionStorage.getItem('oauth_code');
    if (!oauthCode) {
        showAlert('Authentication expired. Please login again.', 'error');
        showLoginSection();
        return;
    }
    
    // Disable submit button and show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Submitting... <div class="spinner"></div>';
    hideAlert();
    
    try {
        // Collect form data
        const formData = {
            title: document.getElementById('title').value.trim(),
            date: document.getElementById('date').value,
            participants: document.getElementById('participants').value.trim(),
            topics: document.getElementById('topics').value.trim(),
            decisions: document.getElementById('decisions').value.trim(),
            actions: document.getElementById('actions').value.trim(),
            notes: document.getElementById('notes').value.trim()
        };
        
        // Prepare workflow dispatch payload
        const workflowPayload = {
            ref: 'main', // or 'master' depending on your default branch
            inputs: {
                oauth_code: oauthCode,
                meeting_payload: JSON.stringify(formData)
            }
        };
        
        // Trigger GitHub Actions workflow via API
        const response = await fetch(
            `https://api.github.com/repos/${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}/actions/workflows/submit_meeting.yml/dispatches`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/vnd.github+json',
                    'Authorization': `Bearer ${CONFIG.GITHUB_PAT}`,
                    'Content-Type': 'application/json',
                    'X-GitHub-Api-Version': '2022-11-28'
                },
                body: JSON.stringify(workflowPayload)
            }
        );
        
        if (response.ok || response.status === 204) {
            // Success - workflow triggered
            showAlert('✓ Meeting record submitted successfully! Processing in background...', 'success');
            
            // Reset form
            meetingForm.reset();
            document.getElementById('date').valueAsDate = new Date();
            
            // Clear OAuth code to force re-authentication for next submission
            sessionStorage.removeItem('oauth_code');
            
            // Show login section after a delay
            setTimeout(() => {
                showAlert('Please re-authenticate for your next submission.', 'info');
                showLoginSection();
            }, 3000);
            
        } else {
            // Error response
            const errorData = await response.json().catch(() => ({}));
            console.error('Workflow dispatch failed:', errorData);
            
            if (response.status === 404) {
                showAlert('Error: Workflow file not found. Please ensure submit_meeting.yml exists.', 'error');
            } else if (response.status === 401) {
                showAlert('Error: Authentication failed. Please check your GitHub PAT configuration.', 'error');
            } else {
                showAlert(`Error: Failed to submit meeting (${response.status}). Check console for details.`, 'error');
            }
        }
        
    } catch (error) {
        console.error('Submission error:', error);
        showAlert('Error: Network error. Please check your connection and try again.', 'error');
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Meeting Record';
    }
});

