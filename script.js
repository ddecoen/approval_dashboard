// Sample data for pending approvals over $10,000
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
function initDashboard() {
    // Set current week
    document.getElementById('current-week').textContent = `Week of ${getCurrentWeekRange()}`;
    
    // Setup event listeners
    setupEventListeners();
    
    // Initial render
    filteredApprovals = [...pendingApprovals];
    applySorting();
    renderApprovalsTable();
    updateSummaryStats();
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);