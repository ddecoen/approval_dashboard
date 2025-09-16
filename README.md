# Approval Dashboard

Build a weekly dashboard to review pending approvals over $10,000.

## Features

- **Real-time Dashboard**: View all pending approvals over $10,000
- **Department Filtering**: Filter by Finance, Operations, Marketing, IT, or view all
- **Sorting Options**: Sort by amount (high to low, low to high) or date (newest, oldest)
- **Summary Statistics**: See total pending amount, number of items, and average amount
- **Visual Indicators**: High amounts and overdue items are highlighted
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Priority Labels**: Color-coded priority levels (high, medium, low)

## Connect to Ramp Data

This dashboard can connect directly to your Ramp account to display real pending approvals instead of sample data. Here's how to set it up:

### Prerequisites

1. **Ramp Account**: You need an active Ramp business account
2. **API Access**: Contact your Ramp account manager to enable API access
3. **Developer App**: Create a developer app in your Ramp settings

### Step 1: Create a Ramp Developer App

1. **Login to Ramp**: Go to your Ramp account dashboard
2. **Developer Settings**: Navigate to **Settings > Developer API**
3. **Create App**: Click **Create New App**
4. **App Details**: 
   - Name: `Approval Dashboard`
   - Description: `Weekly dashboard for pending approvals over $10,000`
5. **Grant Types**: Add **Client Credentials** grant type
6. **Scopes**: Configure these required scopes:
   - `transactions:read` - To read card transactions
   - `reimbursements:read` - To read reimbursement requests
   - `users:read` - To read user information (optional)
   - `departments:read` - To read department data (optional)
7. **Save Credentials**: Copy your **Client ID** and **Client Secret**

### Step 2: Configure the Dashboard

1. **Copy Configuration File**:
   ```bash
   cp config.example.js config.js
   ```

2. **Update Configuration**: Edit `config.js` with your Ramp credentials:
   ```javascript
   const RAMP_CONFIG = {
       environment: 'sandbox', // Use 'production' for live data
       credentials: {
           clientId: 'your_ramp_client_id_here',
           clientSecret: 'your_ramp_client_secret_here'
       },
       // ... other settings
   };
   ```

3. **Test Configuration**: Open the dashboard in your browser and check the browser console for connection status

### Step 3: Environment Setup

**For Testing (Sandbox)**:
- Set `environment: 'sandbox'` in config.js
- Uses demo data from Ramp's sandbox environment
- Safe for development and testing

**For Production (Live Data)**:
- Set `environment: 'production'` in config.js
- Connects to your real Ramp account data
- Use only after thorough testing in sandbox

### Step 4: Security Best Practices

1. **Never commit credentials**: Add `config.js` to your `.gitignore`
2. **Environment Variables**: For production deployments, use environment variables:
   ```javascript
   clientId: process.env.RAMP_CLIENT_ID,
   clientSecret: process.env.RAMP_CLIENT_SECRET
   ```
3. **HTTPS Only**: Always use HTTPS in production
4. **Rotate Credentials**: Regularly rotate your API credentials

### Data Mapping

The dashboard automatically maps Ramp data to the approval format:

**From Ramp Transactions**:
- Card transactions over $10,000 awaiting approval
- Includes merchant name, amount, card holder, department
- Maps to dashboard format with calculated priority levels

**From Ramp Reimbursements**:
- Employee reimbursement requests over $10,000 in pending status
- Includes requester details, amount, submission date
- Automatically calculates days pending

### Customization Options

Edit `config.js` to customize:

```javascript
dashboard: {
    minApprovalAmount: 10000,        // Minimum amount threshold
    lookbackDays: 30,                // How far back to fetch data
    refreshInterval: 5 * 60 * 1000,  // Auto-refresh interval
    departmentMapping: {             // Map Ramp dept names to display names
        'Engineering': 'it',
        'Finance': 'finance'
        // ... add your mappings
    }
}
```

### Troubleshooting

**Dashboard shows "Using sample data"**:
- Check that `config.js` exists and has valid credentials
- Verify your Ramp app has the required scopes enabled
- Check browser console for detailed error messages

**API Connection Errors**:
- Verify credentials are correct
- Ensure your IP is not blocked by Ramp
- Check that your Ramp app is active
- Contact Ramp support if issues persist

**No Data Returned**:
- Confirm you have transactions/reimbursements over $10,000
- Check the date range (default is last 30 days)
- Verify the approval status filters in the API calls

### Support

- **Ramp API Documentation**: [docs.ramp.com](https://docs.ramp.com)
- **Ramp Developer Support**: [developer-support@ramp.com](mailto:developer-support@ramp.com)
- **Dashboard Issues**: Check browser console for error details

## Local Development

1. Clone this repository:
   ```bash
   git clone https://github.com/ddecoen/approval_dashboard.git
   cd approval_dashboard
   ```

2. Open `index.html` in your web browser to view the dashboard locally.

## Deploy to Vercel

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Fork or clone this repository** to your GitHub account

2. **Visit Vercel**: Go to [vercel.com](https://vercel.com) and sign up/login with your GitHub account

3. **Import Project**: 
   - Click "New Project"
   - Select "Import Git Repository"
   - Choose this repository from your GitHub account

4. **Configure Project**:
   - Project Name: `approval-dashboard` (or your preferred name)
   - Framework Preset: Leave as "Other" or select "Vanilla"
   - Root Directory: `./` (default)
   - Build and Output Settings: Leave default (no build command needed)

5. **Deploy**: Click "Deploy" and wait for deployment to complete

6. **Access Your Dashboard**: Vercel will provide a URL like `https://approval-dashboard-yourusername.vercel.app`

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from project directory**:
   ```bash
   cd approval_dashboard
   vercel
   ```

4. **Follow the prompts**:
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N` (unless you have an existing project)
   - What's your project's name? `approval-dashboard`
   - In which directory is your code located? `./`

5. **Production deployment**:
   ```bash
   vercel --prod
   ```

### Method 3: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ddecoen/approval_dashboard)

Click the button above to deploy directly to Vercel.

## Custom Domain (Optional)

To use a custom domain with your Vercel deployment:

1. Go to your project dashboard on Vercel
2. Navigate to "Settings" > "Domains"
3. Add your custom domain
4. Configure DNS settings as instructed by Vercel

## Environment Configuration

This dashboard currently uses sample data. To integrate with real data:

1. Replace the `pendingApprovals` array in `script.js` with your data source
2. Consider adding environment variables for API endpoints
3. Update the JavaScript to fetch data from your approval system API

## File Structure

```
approval_dashboard/
├── index.html          # Main dashboard interface
├── styles.css          # Responsive CSS styling
├── script.js           # Dashboard functionality and sample data
└── README.md           # This file
```

## Technology Stack

- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with flexbox and grid
- **Vanilla JavaScript**: Interactive functionality without frameworks
- **Responsive Design**: Mobile-first approach

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this dashboard for your organization's approval process.