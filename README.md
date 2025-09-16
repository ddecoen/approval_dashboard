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