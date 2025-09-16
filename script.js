// Sample data for pending approvals over $10,000
// This will be used as fallback when Ramp API is not configured
const pendingApprovals = [
    {
        id: 'REQ-2024-001',
        department: 'finance',
        description: 'New accounting software licenses',
        amount: 25000,
        requestor: 'Sarah Johnson',
        dateSubmitted: '2024-01-08',
        priority: 'high'
    },
    {
        id: 'REQ-2024-002',
        department: 'operations',
        description: 'Manufacturing equipment upgrade',
        amount: 150000,
        requestor: 'Mike Chen',
        dateSubmitted: '2024-01-05',
        priority: 'high'
    },
    {
        id: 'REQ-2024-003',
        department: 'marketing',
        description: 'Annual trade show booth rental',
        amount: 35000,
        requestor: 'Emily Rodriguez',
        dateSubmitted: '2024-01-10',
        priority: 'medium'
    },
    {
        id: 'REQ-2024-004',
        department: 'it',
        description: 'Cloud infrastructure scaling',
        amount: 75000,
        requestor: 'David Kim',
        dateSubmitted: '2024-01-07',
        priority: 'high'
    },
    {
        id: 'REQ-2024-005',
        department: 'operations',
        description: 'Warehouse expansion project',
        amount: 220000,
        requestor: 'Lisa Thompson',
        dateSubmitted: '2024-01-03',
        priority: 'high'
    },
    {
        id: 'REQ-2024-006',
        department: 'finance',
        description: 'Risk management software',
        amount: 18000,
        requestor: 'Robert Wilson',
        dateSubmitted: '2024-01-09',
        priority: 'medium'
    },
    {
        id: 'REQ-2024-007',
        department: 'marketing',
        description: 'Digital advertising campaign',
        amount: 45000,
        requestor: 'Jennifer Davis',
        dateSubmitted: '2024-01-06',
        priority: 'medium'
    },
    {
        id: 'REQ-2024-008',
        department: 'it',
        description: 'Cybersecurity upgrade package',
        amount: 60000,
        requestor: 'Alex Martinez',
        dateSubmitted: '2024-01-04',
        priority: 'high'
    },
    {
        id: 'REQ-2024-009',
        department: 'operations',
        description: 'Fleet vehicle replacement',
        amount: 95000,
        requestor: 'Maria Garcia',
        dateSubmitted: '2024-01-11',
        priority: 'low'
    },
    {
        id: 'REQ-2024-010',
        department: 'finance',
        description: 'Audit and compliance tools',
        amount: 32000,
        requestor: 'James Brown',
        dateSubmitted: '2024-01-02',
        priority: 'medium'
    }
];

// Ramp Integration Instance
let rampIntegration = null;
let useRampAPI = false;

// Initialize Ramp integration if available
function initializeRampIntegration() {
    if (typeof SecureRampIntegration !== 'undefined') {
        rampIntegration = new SecureRampIntegration();
        useRampAPI = rampIntegration.isConfigured;
        
        if (useRampAPI) {
            console.log('Secure Ramp API integration enabled');
            // Test the connection
            rampIntegration.testConnection().then(result => {
                if (result.success) {
                    console.log('✅ Secure Ramp API connection successful');
                } else {
                    console.warn('⚠️ Secure Ramp API connection failed:', result.error);
                    // Don't disable useRampAPI - let it try and fallback gracefully
                }
            });
        } else {
            console.log('Using sample data - Secure Ramp API not configured');
        }
    } else {
        console.log('Secure Ramp integration not loaded - using sample data');
    }
}

let filteredApprovals = [...pendingApprovals];

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function calculateDaysPending(dateSubmitted) {
    const today = new Date();
    const submitDate = new Date(dateSubmitted);
    const diffTime = Math.abs(today - submitDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function getCurrentWeekRange() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    const options = { month: 'short', day: 'numeric' };
    return `${monday.toLocaleDateString('en-US', options)} - ${sunday.toLocaleDateString('en-US', options)}, ${today.getFullYear()}`;
}

// Load approvals data from Ramp API or sample data
async function loadApprovalsData() {
    try {
        if (useRampAPI && rampIntegration) {
            console.log('Fetching data from Ramp API...');
            showLoadingState(true);
            
            const rampData = await rampIntegration.getPendingApprovals();
            filteredApprovals = [...rampData];
            
            console.log(`Loaded ${filteredApprovals.length} approvals from Ramp API`);
            showLoadingState(false);
        } else {
            // Use sample data
            filteredApprovals = [...pendingApprovals];
            console.log(`Using ${filteredApprovals.length} sample approvals`);
        }
    } catch (error) {
        console.error('Error loading approvals data:', error);
        showErrorState(error.message);
        // Fallback to sample data on error
        filteredApprovals = [...pendingApprovals];
        showLoadingState(false);
    }
}

// Show/hide loading state
function showLoadingState(isLoading) {
    const tbody = document.getElementById('approvals-body');
    if (isLoading) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 1rem;">
                        <div style="width: 20px; height: 20px; border: 2px solid #667eea; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                        Loading approvals data...
                    </div>
                </td>
            </tr>
        `;
        // Add CSS for loading spinner
        if (!document.getElementById('loading-styles')) {
            const style = document.createElement('style');
            style.id = 'loading-styles';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Show error state
function showErrorState(errorMessage) {
    const tbody = document.getElementById('approvals-body');
    tbody.innerHTML = `
        <tr>
            <td colspan="8" style="text-align: center; padding: 2rem; color: #dc3545;">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                    <div style="font-size: 1.2rem; font-weight: 600;">⚠️ Error Loading Data</div>
                    <div style="color: #6c757d;">${errorMessage}</div>
                    <button onclick="refreshData()" style="padding: 0.5rem 1rem; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">Retry</button>
                </div>
            </td>
        </tr>
    `;
}

// Refresh data function
async function refreshData() {
    console.log('Refreshing approvals data...');
    await loadApprovalsData();
    applySorting();
    renderApprovalsTable();
    updateSummaryStats();
}

// Update summary statistics
function updateSummaryStats() {
    const totalAmount = filteredApprovals.reduce((sum, approval) => sum + approval.amount, 0);
    const approvalCount = filteredApprovals.length;
    const avgAmount = approvalCount > 0 ? totalAmount / approvalCount : 0;
    
    document.getElementById('total-amount').textContent = formatCurrency(totalAmount);
    document.getElementById('approval-count').textContent = approvalCount;
    document.getElementById('avg-amount').textContent = formatCurrency(avgAmount);
    document.getElementById('total-pending').textContent = `${approvalCount} items pending approval`;
}

// Render the approvals table
function renderApprovalsTable() {
    const tbody = document.getElementById('approvals-body');
    tbody.innerHTML = '';
    
    filteredApprovals.forEach(approval => {
        const daysPending = calculateDaysPending(approval.dateSubmitted);
        const isOverdue = daysPending > 7;
        const isHighAmount = approval.amount > 100000;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="request-id">${approval.id}</span></td>
            <td style="text-transform: capitalize;">${approval.department}</td>
            <td>${approval.description}</td>
            <td><span class="amount ${isHighAmount ? 'high' : ''}">${formatCurrency(approval.amount)}</span></td>
            <td>${approval.requestor}</td>
            <td>${formatDate(approval.dateSubmitted)}</td>
            <td><span class="days-pending ${isOverdue ? 'overdue' : ''}">${daysPending} days</span></td>
            <td><span class="priority ${approval.priority}">${approval.priority}</span></td>
        `;
        tbody.appendChild(row);
    });
}

// Filter and sort functions
function filterByDepartment(department) {
    if (department === 'all') {
        filteredApprovals = [...pendingApprovals];
    } else {
        filteredApprovals = pendingApprovals.filter(approval => approval.department === department);
    }
    applySorting();
    renderApprovalsTable();
    updateSummaryStats();
}

function applySorting() {
    const sortBy = document.getElementById('sort-by').value;
    
    filteredApprovals.sort((a, b) => {
        switch (sortBy) {
            case 'amount-desc':
                return b.amount - a.amount;
            case 'amount-asc':
                return a.amount - b.amount;
            case 'date-desc':
                return new Date(b.dateSubmitted) - new Date(a.dateSubmitted);
            case 'date-asc':
                return new Date(a.dateSubmitted) - new Date(b.dateSubmitted);
            default:
                return 0;
        }
    });
}

// Event listeners
function setupEventListeners() {
    document.getElementById('department-filter').addEventListener('change', (e) => {
        filterByDepartment(e.target.value);
    });
    
    document.getElementById('sort-by').addEventListener('change', () => {
        applySorting();
        renderApprovalsTable();
    });
}

// Initialize the dashboard
async function initDashboard() {
    // Set current week
    document.getElementById('current-week').textContent = `Week of ${getCurrentWeekRange()}`;
    
    // Initialize Ramp integration
    initializeRampIntegration();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load approvals data (async)
    await loadApprovalsData();
    
    // Initial render
    applySorting();
    renderApprovalsTable();
    updateSummaryStats();
    
    // Set up auto-refresh if using Ramp API
    if (useRampAPI) {
        setInterval(refreshData, 5 * 60 * 1000); // Refresh every 5 minutes
        console.log('Auto-refresh enabled (5 minute interval)');
    }
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);