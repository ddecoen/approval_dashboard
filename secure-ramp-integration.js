// Secure Ramp Integration - Client Side
// This calls your serverless API endpoint instead of directly calling Ramp

class SecureRampIntegration {
    constructor() {
        this.apiEndpoint = '/api/approvals'; // Vercel serverless function
        this.isConfigured = true; // Always try the API first
    }

    // Fetch approvals from secure serverless endpoint
    async getPendingApprovals() {
        try {
            console.log('Fetching approvals from secure API endpoint...');
            
            const response = await fetch(this.apiEndpoint, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.useSampleData) {
                console.log('API returned sample data flag - using fallback');
                return this.getSampleData();
            }
            
            if (result.success && result.data) {
                console.log(`✅ Loaded ${result.count} approvals from Ramp API (secure)`);
                return result.data;
            } else {
                throw new Error(result.error || 'Unknown API error');
            }
            
        } catch (error) {
            console.error('Secure API error:', error);
            console.log('Falling back to sample data');
            return this.getSampleData();
        }
    }

    // Fallback sample data
    getSampleData() {
        console.log('Using sample data - API not available');
        // Return empty array - the main script will use its sample data
        return [];
    }

    // Test the secure API connection
    async testConnection() {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.useSampleData) {
                    return { 
                        success: false, 
                        error: 'Ramp API credentials not configured on server' 
                    };
                }
                return { 
                    success: true, 
                    message: 'Secure API connection successful' 
                };
            } else {
                return { 
                    success: false, 
                    error: `API endpoint returned ${response.status}` 
                };
            }
        } catch (error) {
            return { 
                success: false, 
                error: `Connection failed: ${error.message}` 
            };
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SecureRampIntegration };
} else {
    // Browser environment
    window.SecureRampIntegration = SecureRampIntegration;
}