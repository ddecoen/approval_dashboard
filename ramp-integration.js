// Ramp API Integration for Approval Dashboard
// This file provides functions to connect to Ramp's API and fetch approval data

// Configuration
const RAMP_CONFIG = {
    // Use sandbox for testing, production for live data
    baseURL: process.env.RAMP_ENVIRONMENT === 'production' 
        ? 'https://api.ramp.com/developer/v1' 
        : 'https://demo-api.ramp.com/developer/v1',
    
    // Your API credentials (set these as environment variables)
    clientId: process.env.RAMP_CLIENT_ID,
    clientSecret: process.env.RAMP_CLIENT_SECRET,
    
    // Required scopes for approval data
    scopes: 'transactions:read reimbursements:read'
};

// Authentication
class RampAuth {
    constructor() {
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    // Get OAuth 2.0 access token using client credentials flow
    async getAccessToken() {
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        try {
            const credentials = btoa(`${RAMP_CONFIG.clientId}:${RAMP_CONFIG.clientSecret}`);
            
            const response = await fetch(`${RAMP_CONFIG.baseURL}/token`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    'grant_type': 'client_credentials',
                    'scope': RAMP_CONFIG.scopes
                })
            });

            if (!response.ok) {
                throw new Error(`Authentication failed: ${response.status}`);
            }

            const data = await response.json();
            this.accessToken = data.access_token;
            // Set expiry 5 minutes before actual expiry for safety
            this.tokenExpiry = Date.now() + ((data.expires_in - 300) * 1000);
            
            return this.accessToken;
        } catch (error) {
            console.error('Ramp authentication error:', error);
            throw new Error('Failed to authenticate with Ramp API');
        }
    }
}

// API Client
class RampAPI {
    constructor() {
        this.auth = new RampAuth();
    }

    // Make authenticated API request
    async makeRequest(endpoint, options = {}) {
        try {
            const token = await this.auth.getAccessToken();
            
            const response = await fetch(`${RAMP_CONFIG.baseURL}${endpoint}`, {
                ...options,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Ramp API error:', error);
            throw error;
        }
    }

    // Fetch pending transactions (card spend awaiting approval)
    async getPendingTransactions(filters = {}) {
        const params = new URLSearchParams();
        
        // Filter for transactions that need approval and are over $10,000
        if (filters.minAmount) {
            params.append('min_amount', filters.minAmount * 100); // Convert to cents
        }
        
        if (filters.departmentId) {
            params.append('department_id', filters.departmentId);
        }
        
        if (filters.startDate) {
            params.append('start', filters.startDate);
        }
        
        if (filters.endDate) {
            params.append('end', filters.endDate);
        }

        const queryString = params.toString();
        const endpoint = `/transactions${queryString ? '?' + queryString : ''}`;
        
        return await this.makeRequest(endpoint);
    }

    // Fetch pending reimbursements
    async getPendingReimbursements(filters = {}) {
        const params = new URLSearchParams();
        
        if (filters.minAmount) {
            params.append('min_amount', filters.minAmount * 100);
        }
        
        // Filter by status - pending approval
        params.append('status', 'PENDING_APPROVAL');

        const queryString = params.toString();
        const endpoint = `/reimbursements${queryString ? '?' + queryString : ''}`;
        
        return await this.makeRequest(endpoint);
    }

    // Get user/department information
    async getUsers() {
        return await this.makeRequest('/users');
    }

    // Get departments
    async getDepartments() {
        return await this.makeRequest('/departments');
    }
}

// Data transformation functions
class RampDataTransformer {
    // Transform Ramp transaction to dashboard format
    static transformTransaction(rampTransaction) {
        const amount = rampTransaction.amount / 100; // Convert from cents
        
        // Only include transactions over $10,000
        if (amount < 10000) {
            return null;
        }

        return {
            id: `TXN-${rampTransaction.id.slice(-8).toUpperCase()}`,
            department: rampTransaction.card_holder?.department_name?.toLowerCase() || 'unknown',
            description: rampTransaction.merchant_name || rampTransaction.merchant_descriptor || 'Card Transaction',
            amount: amount,
            requestor: `${rampTransaction.card_holder?.first_name || ''} ${rampTransaction.card_holder?.last_name || ''}`.trim(),
            dateSubmitted: rampTransaction.user_transaction_time || rampTransaction.accounting_date,
            priority: this.calculatePriority(amount, rampTransaction),
            status: 'pending',
            type: 'transaction',
            rampData: rampTransaction // Keep original data for reference
        };
    }

    // Transform Ramp reimbursement to dashboard format
    static transformReimbursement(rampReimbursement) {
        const amount = rampReimbursement.amount?.amount / 100 || 0;
        
        if (amount < 10000) {
            return null;
        }

        return {
            id: `REIMB-${rampReimbursement.id.slice(-8).toUpperCase()}`,
            department: rampReimbursement.user?.department_name?.toLowerCase() || 'unknown',
            description: rampReimbursement.memo || 'Employee Reimbursement',
            amount: amount,
            requestor: `${rampReimbursement.user?.first_name || ''} ${rampReimbursement.user?.last_name || ''}`.trim(),
            dateSubmitted: rampReimbursement.created_at,
            priority: this.calculatePriority(amount, rampReimbursement),
            status: 'pending',
            type: 'reimbursement',
            rampData: rampReimbursement
        };
    }

    // Calculate priority based on amount and other factors
    static calculatePriority(amount, data) {
        if (amount >= 100000) return 'high';
        if (amount >= 50000) return 'medium';
        return 'low';
    }

    // Combine and sort all approvals
    static combineApprovals(transactions, reimbursements) {
        const allApprovals = [];
        
        // Transform transactions
        if (transactions?.data) {
            transactions.data.forEach(txn => {
                const transformed = this.transformTransaction(txn);
                if (transformed) {
                    allApprovals.push(transformed);
                }
            });
        }
        
        // Transform reimbursements
        if (reimbursements?.data) {
            reimbursements.data.forEach(reimb => {
                const transformed = this.transformReimbursement(reimb);
                if (transformed) {
                    allApprovals.push(transformed);
                }
            });
        }
        
        // Sort by amount descending
        return allApprovals.sort((a, b) => b.amount - a.amount);
    }
}

// Main integration class
class RampIntegration {
    constructor() {
        this.api = new RampAPI();
        this.isConfigured = this.checkConfiguration();
    }

    // Check if API is properly configured
    checkConfiguration() {
        if (!RAMP_CONFIG.clientId || !RAMP_CONFIG.clientSecret) {
            console.warn('Ramp API credentials not configured. Using sample data.');
            return false;
        }
        return true;
    }

    // Fetch all pending approvals over $10,000
    async getPendingApprovals() {
        if (!this.isConfigured) {
            console.log('Using sample data - Ramp API not configured');
            return this.getSampleData();
        }

        try {
            // Set date range for current week
            const now = new Date();
            const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
            
            const filters = {
                minAmount: 10000,
                startDate: weekAgo.toISOString(),
                endDate: now.toISOString()
            };

            // Fetch both transactions and reimbursements in parallel
            const [transactions, reimbursements] = await Promise.all([
                this.api.getPendingTransactions(filters),
                this.api.getPendingReimbursements(filters)
            ]);

            // Transform and combine data
            return RampDataTransformer.combineApprovals(transactions, reimbursements);
        } catch (error) {
            console.error('Failed to fetch Ramp data:', error);
            throw new Error('Unable to fetch approval data from Ramp');
        }
    }

    // Fallback sample data when API is not configured
    getSampleData() {
        // Return the existing sample data from script.js
        // This method would be removed in production once API is configured
        return [];
    }

    // Test the API connection
    async testConnection() {
        if (!this.isConfigured) {
            return { success: false, error: 'API not configured' };
        }

        try {
            await this.api.auth.getAccessToken();
            return { success: true, message: 'Successfully connected to Ramp API' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RampIntegration, RampAPI, RampDataTransformer };
} else {
    // Browser environment
    window.RampIntegration = RampIntegration;
    window.RampAPI = RampAPI;
    window.RampDataTransformer = RampDataTransformer;
}