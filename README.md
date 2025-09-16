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

This dashboard can connect securely to your Ramp account using serverless functions that keep your API credentials safe on the server-side.

### Secure Architecture

🔒 **Server-side API calls**: Your Ramp credentials stay secure on Vercel's servers  
🌐 **Client-side dashboard**: Frontend fetches data from your secure API endpoint  
🔄 **Automatic fallback**: Uses sample data if API is unavailable  

### Step 1: Get Ramp API Credentials

1. **Contact Ramp**: Ask your account manager to enable API access
2. **Developer Settings**: Go to **Settings > Developer API** in your Ramp account
3. **Create App**: Click **Create New App**
   - Name: `Approval Dashboard`
   - Description: `Secure serverless integration for approval dashboard`
4. **Grant Types**: Add **Client Credentials** grant type
5. **Scopes**: Enable these required scopes:
   - `transactions:read` - Read card transactions
   - `reimbursements:read` - Read reimbursement requests
6. **Save Credentials**: Copy your **Client ID** and **Client Secret**

### Step 2: Configure Vercel Environment Variables

1. **Go to Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. **Add these variables**:
   ```
   RAMP_CLIENT_ID = your_ramp_client_id
   RAMP_CLIENT_SECRET = your_ramp_client_secret
   RAMP_ENVIRONMENT = sandbox  (or 'production' for live data)
   ```

3. **Deploy**: Your dashboard will automatically redeploy with secure API access

### Step 3: Verify Connection

1. **Open your deployed dashboard** in browser
2. **Open browser console** (F12)
3. **Look for these messages**:
   - ✅ `"Secure Ramp API integration enabled"`
   - ✅ `"✅ Secure Ramp API connection successful"`
   - ✅ `"✅ Loaded X approvals from Ramp API (secure)"`

### Security Features

✅ **Credentials never exposed** - API keys stay server-side  
✅ **CORS protection** - API endpoint only serves your dashboard  
✅ **Error handling** - Graceful fallback to sample data  
✅ **No client-side secrets** - Browser never sees sensitive data  

### API Endpoint

The secure integration creates an API endpoint at `/api/approvals` that:
- Authenticates with Ramp using OAuth 2.0
- Fetches transactions and reimbursements over $10,000
- Transforms data to dashboard format
- Returns JSON response to your frontend

### Environment Setup

**Sandbox (Recommended for testing)**:
- Set `RAMP_ENVIRONMENT=sandbox`
- Uses Ramp's demo data for safe testing
- No risk to production data

**Production (Live data)**:
- Set `RAMP_ENVIRONMENT=production`  
- Connects to real Ramp account data
- Use only after thorough sandbox testing

### Data Mapping

**Ramp Transactions** → Dashboard Format:
- Card transactions over $10,000 awaiting approval
- Maps merchant name, amount, card holder, department
- Calculates priority based on amount and age

**Ramp Reimbursements** → Dashboard Format:
- Employee reimbursements over $10,000 in pending status
- Maps requester details, amounts, submission dates
- Automatically calculates days pending

### Troubleshooting

**"Using sample data" in console**:
- Check Vercel environment variables are set correctly
- Verify Ramp app has required scopes enabled
- Ensure RAMP_ENVIRONMENT is set to 'sandbox' or 'production'

**"Secure Ramp API connection failed"**:
- Verify credentials in Vercel environment variables
- Check that your Ramp app is active and approved
- Try sandbox environment first before production

**API endpoint errors**:
- Check `/api/approvals` endpoint is accessible
- Verify serverless function deployed correctly
- Look at Vercel function logs for detailed errors

### Manual Testing

You can test your secure API directly:
```bash
curl https://your-dashboard.vercel.app/api/approvals
```

Should return:
```json
{
  "success": true,
  "data": [...],
  "count": 5,
  "source": "ramp-api"
}
```

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