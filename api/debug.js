// Debug endpoint to show raw Ramp API data
// This helps troubleshoot data filtering issues

// Ramp API client for serverless environment
class RampAPI {
    constructor() {
        this.baseURL = process.env.RAMP_ENVIRONMENT === 'production' 
            ? 'https://api.ramp.com/developer/v1'
            : 'https://demo-api.ramp.com/developer/v1';
        
        this.clientId = process.env.RAMP_CLIENT_ID;
        this.clientSecret = process.env.RAMP_CLIENT_SECRET;
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    // Get OAuth 2.0 access token
    async getAccessToken() {
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        try {
            const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
            
            const response = await fetch(`${this.baseURL}/token`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    'grant_type': 'client_credentials',
                    'scope': 'transactions:read reimbursements:read'
                })
            });

            if (!response.ok) {
                throw new Error(`Authentication failed: ${response.status}`);
            }

            const data = await response.json();
            this.accessToken = data.access_token;
            this.tokenExpiry = Date.now() + ((data.expires_in - 300) * 1000);
            
            return this.accessToken;
        } catch (error) {
            console.error('Ramp authentication error:', error);
            throw new Error('Failed to authenticate with Ramp API');
        }
    }

    // Make authenticated API request
    async makeRequest(endpoint) {
        const token = await this.getAccessToken();
        
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        return await response.json();
    }

    // Fetch ALL transactions (no amount filter)
    async getAllTransactions() {
        return await this.makeRequest('/transactions?limit=50');
    }

    // Fetch ALL reimbursements (no amount filter)
    async getAllReimbursements() {
        return await this.makeRequest('/reimbursements?limit=50');
    }
}

// Main debug endpoint
async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check if API credentials are configured
    if (!process.env.RAMP_CLIENT_ID || !process.env.RAMP_CLIENT_SECRET) {
        return res.status(500).json({ 
            error: 'Ramp API credentials not configured',
            environment: {
                RAMP_ENVIRONMENT: process.env.RAMP_ENVIRONMENT || 'not set',
                RAMP_CLIENT_ID: process.env.RAMP_CLIENT_ID ? 'set' : 'not set',
                RAMP_CLIENT_SECRET: process.env.RAMP_CLIENT_SECRET ? 'set' : 'not set'
            }
        });
    }

    try {
        const rampAPI = new RampAPI();
        
        // Fetch both transactions and reimbursements in parallel
        const [transactions, reimbursements] = await Promise.all([
            rampAPI.getAllTransactions(),
            rampAPI.getAllReimbursements()
        ]);

        // Debug information
        const debug = {
            environment: process.env.RAMP_ENVIRONMENT || 'sandbox',
            baseURL: rampAPI.baseURL,
            transactionCount: transactions?.data?.length || 0,
            reimbursementCount: reimbursements?.data?.length || 0,
            
            // Show first few transactions with amounts
            sampleTransactions: transactions?.data?.slice(0, 5).map(txn => ({
                id: txn.id,
                amount: txn.amount / 100, // Convert from cents
                merchant: txn.merchant_name || txn.merchant_descriptor,
                date: txn.user_transaction_time || txn.accounting_date,
                cardHolder: `${txn.card_holder?.first_name || ''} ${txn.card_holder?.last_name || ''}`.trim(),
                department: txn.card_holder?.department_name
            })) || [],
            
            // Show first few reimbursements with amounts
            sampleReimbursements: reimbursements?.data?.slice(0, 5).map(reimb => ({
                id: reimb.id,
                amount: reimb.amount?.amount / 100 || 0,
                memo: reimb.memo,
                status: reimb.status,
                date: reimb.created_at,
                user: `${reimb.user?.first_name || ''} ${reimb.user?.last_name || ''}`.trim(),
                department: reimb.user?.department_name
            })) || [],
            
            // Filtering analysis
            filtering: {
                transactionsOver10K: transactions?.data?.filter(txn => (txn.amount / 100) >= 10000).length || 0,
                reimbursementsOver10K: reimbursements?.data?.filter(reimb => (reimb.amount?.amount / 100 || 0) >= 10000).length || 0,
                transactionsOver1K: transactions?.data?.filter(txn => (txn.amount / 100) >= 1000).length || 0,
                reimbursementsOver1K: reimbursements?.data?.filter(reimb => (reimb.amount?.amount / 100 || 0) >= 1000).length || 0
            }
        };
        
        return res.status(200).json({
            success: true,
            debug: debug,
            rawData: {
                transactions: transactions,
                reimbursements: reimbursements
            }
        });
        
    } catch (error) {
        console.error('Ramp API debug error:', error);
        
        return res.status(500).json({
            error: 'Failed to fetch debug data',
            message: error.message,
            stack: error.stack
        });
    }
}

module.exports = handler;