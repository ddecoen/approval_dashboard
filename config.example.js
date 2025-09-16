// Ramp API Configuration
// Copy this file to config.js and fill in your actual values
// DO NOT commit config.js with real credentials to version control

const RAMP_CONFIG = {
    // Environment: 'sandbox' for testing, 'production' for live data
    environment: 'sandbox', // Change to 'production' when ready
    
    // API Endpoints
    baseURL: {
        sandbox: 'https://demo-api.ramp.com/developer/v1',
        production: 'https://api.ramp.com/developer/v1'
    },
    
    // OAuth 2.0 Credentials (get these from Ramp Developer Settings)
    credentials: {
        clientId: 'your_ramp_client_id_here',
        clientSecret: 'your_ramp_client_secret_here'
    },
    
    // API Scopes needed for approval dashboard
    scopes: [
        'transactions:read',      // Read card transactions
        'reimbursements:read',    // Read reimbursement requests
        'users:read',             // Read user information
        'departments:read'        // Read department information
    ].join(' '),
    
    // Dashboard Settings
    dashboard: {
        // Minimum amount threshold (in dollars)
        minApprovalAmount: 10000,
        
        // How many days back to fetch data
        lookbackDays: 30,
        
        // Refresh interval (in milliseconds)
        refreshInterval: 5 * 60 * 1000, // 5 minutes
        
        // Department mapping (map Ramp department names to display names)
        departmentMapping: {
            'Engineering': 'it',
            'Information Technology': 'it',
            'IT': 'it',
            'Finance': 'finance',
            'Accounting': 'finance',
            'Marketing': 'marketing',
            'Sales': 'marketing',
            'Operations': 'operations',
            'Admin': 'operations'
        }
    },
    
    // Error handling
    retryConfig: {
        maxRetries: 3,
        retryDelay: 1000, // 1 second
        backoffMultiplier: 2
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RAMP_CONFIG;
} else {
    window.RAMP_CONFIG = RAMP_CONFIG;
}