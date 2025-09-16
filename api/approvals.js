// Serverless function to securely fetch Ramp approvals data
// This keeps your API credentials server-side and secure

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

    // Fetch transactions over $5,000 from last 30 days
    async getPendingTransactions() {
        const params = new URLSearchParams();
        
        // Set minimum amount to $5,000 (in cents)
        params.append('min_amount', '500000');
        
        // Set date range to last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        params.append('start', thirtyDaysAgo.toISOString());
        
        // Get all matching transactions (remove limit)
        
        const queryString = params.toString();
        const endpoint = `/transactions${queryString ? '?' + queryString : ''}`;
        
        return await this.makeRequest(endpoint);
    }

    // Fetch reimbursements over $5,000 from last 30 days
    async getPendingReimbursements() {
        const params = new URLSearchParams();
        
        // Set minimum amount to $5,000 (in cents)
        params.append('min_amount', '500000');
        
        // Set date range to last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        params.append('start', thirtyDaysAgo.toISOString());
        
        const queryString = params.toString();
        const endpoint = `/reimbursements${queryString ? '?' + queryString : ''}`;
        
        return await this.makeRequest(endpoint);
    }
}

// Data transformation functions
function transformTransaction(rampTransaction) {
    const amount = rampTransaction.amount / 100; // Convert from cents
    
    // Only include transactions over $5,000
    if (amount < 5000) {
        return null;
    }

    return {
        id: `TXN-${rampTransaction.id.slice(-8).toUpperCase()}`,
        department: rampTransaction.card_holder?.department_name?.toLowerCase() || 'unknown',
        description: rampTransaction.merchant_name || rampTransaction.merchant_descriptor || 'Card Transaction',
        amount: amount,
        requestor: `${rampTransaction.card_holder?.first_name || ''} ${rampTransaction.card_holder?.last_name || ''}`.trim(),
        dateSubmitted: rampTransaction.user_transaction_time || rampTransaction.accounting_date,
        priority: calculatePriority(amount),
        status: rampTransaction.state || 'completed', // Show actual status
        type: 'transaction'
    };
}

function transformReimbursement(rampReimbursement) {
    const amount = rampReimbursement.amount?.amount / 100 || 0;
    
    // Only include reimbursements over $5,000
    if (amount < 5000) {
        return null;
    }

    return {
        id: `REIMB-${rampReimbursement.id.slice(-8).toUpperCase()}`,
        department: rampReimbursement.user?.department_name?.toLowerCase() || 'unknown',
        description: rampReimbursement.memo || 'Employee Reimbursement',
        amount: amount,
        requestor: `${rampReimbursement.user?.first_name || ''} ${rampReimbursement.user?.last_name || ''}`.trim(),
        dateSubmitted: rampReimbursement.created_at,
        priority: calculatePriority(amount),
        status: rampReimbursement.status || 'pending', // Show actual status
        type: 'reimbursement'
    };
}

function calculatePriority(amount) {
    if (amount >= 100000) return 'high';
    if (amount >= 50000) return 'medium';
    return 'low';
}

// Main serverless function handler
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
            useSampleData: true
        });
    }

    try {
        const rampAPI = new RampAPI();
        
        // Fetch both transactions and reimbursements in parallel
        const [transactions, reimbursements] = await Promise.all([
            rampAPI.getPendingTransactions(),
            rampAPI.getPendingReimbursements()
        ]);

        // Transform and combine all transactions over $5,000
        const allApprovals = [];
        
        // Transform all matching transactions
        if (transactions?.data) {
            transactions.data.forEach(txn => {
                const transformed = transformTransaction(txn);
                if (transformed) {
                    allApprovals.push(transformed);
                }
            });
        }
        
        // Transform all matching reimbursements
        if (reimbursements?.data) {
            reimbursements.data.forEach(reimb => {
                const transformed = transformReimbursement(reimb);
                if (transformed) {
                    allApprovals.push(transformed);
                }
            });
        }
        
        // Sort by amount descending (highest first)
        allApprovals.sort((a, b) => b.amount - a.amount);
        
        return res.status(200).json({
            success: true,
            data: allApprovals,
            count: allApprovals.length,
            source: 'ramp-api'
        });
        
    } catch (error) {
        console.error('Ramp API error:', error);
        
        return res.status(500).json({
            error: 'Failed to fetch approvals data',
            message: error.message,
            useSampleData: true
        });
    }
}

// Export the handler function
module.exports = handler;