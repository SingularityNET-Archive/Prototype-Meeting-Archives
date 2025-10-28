# Meeting Archive Submission System

A complete GitHub-native meeting submission system with GitHub OAuth authentication. Users can submit meeting records through a static web interface hosted on GitHub Pages, with all data stored in the repository via GitHub Actions.

## 🚀 Features

- **GitHub OAuth Authentication**: Users must authenticate with their GitHub account
- **Static Frontend**: No external servers required - runs entirely on GitHub Pages
- **Automated Workflows**: GitHub Actions handle OAuth exchange and data storage
- **Meeting Records**: Track title, date, participants, topics, decisions, actions, and notes
- **Dashboard**: View all submitted meetings in a clean interface
- **Audit Trail**: Each submission records who submitted it and when

## 📋 Setup Instructions

### 1. Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the application details:
   - **Application name**: `Meeting Archive Submission`
   - **Homepage URL**: `https://singularitynet-archive.github.io/Prototype-Meeting-Archives/`
   - **Authorization callback URL**: `https://singularitynet-archive.github.io/Prototype-Meeting-Archives/`
4. Click **"Register application"**
5. **Save the Client ID** (you'll need this for step 3)
6. Click **"Generate a new client secret"** and **save it securely** (you'll need this for step 2)

### 2. Configure Repository Secrets

Add the following secrets to your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"** and add:
   - **Name**: `OAUTH_CLIENT_ID`
   - **Value**: Your GitHub OAuth App Client ID
3. Click **"New repository secret"** again and add:
   - **Name**: `OAUTH_CLIENT_SECRET`
   - **Value**: Your GitHub OAuth App Client Secret

### 3. Generate a Personal Access Token (PAT)

The frontend needs a classic PAT to trigger workflows:

1. Go to [GitHub Token Settings (Classic)](https://github.com/settings/tokens)
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Configure the token:
   - **Note**: `Meeting Archive Workflow Trigger`
   - **Expiration**: Choose your preferred duration (90 days recommended)
   - **Select scopes**:
     - ✅ **`public_repo`** (if repository is public) - Access public repositories
     - ✅ **`repo`** (if repository is private) - Full control of private repositories
     - Note: Either scope includes the ability to trigger Actions workflows
4. Click **"Generate token"** and **save it securely**
5. The token will start with `ghp_`

**Note**: We use classic PATs instead of fine-grained PATs because organizations may restrict fine-grained token access. Classic tokens with `public_repo` scope are simpler and work reliably with organization repositories.

### 4. Create Your Local Configuration File

**Important**: Never commit credentials to the repository!

1. Copy the example config file:
   ```bash
   cp config.example.js config.js
   ```

2. Edit `config.js` and add your credentials:
   ```javascript
   const CONFIG = {
       // Replace with your GitHub OAuth App Client ID from step 1
       GITHUB_CLIENT_ID: 'Ov23abc123def456...',
       
       // Replace with your classic PAT from step 3 (starts with ghp_)
       GITHUB_PAT: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
       
       // These are already set correctly
       REPO_OWNER: 'SingularityNET-Archive',
       REPO_NAME: 'Prototype-Meeting-Archives',
       REDIRECT_URI: 'https://singularitynet-archive.github.io/Prototype-Meeting-Archives/'
   };
   ```

3. **Verify** that `config.js` is listed in `.gitignore` (it should be by default)

**Note**: `config.js` is gitignored and will NEVER be committed to the repository. This keeps your credentials secure.

### 5. Enable GitHub Pages

1. Go to **Settings** → **Pages**
2. Under **Source**, select:
   - **Branch**: `main` (or `master`)
   - **Folder**: `/ (root)`
3. Click **Save**
4. Wait a few minutes for GitHub Pages to deploy
5. Your site will be available at: `https://singularitynet-archive.github.io/Prototype-Meeting-Archives/`

### 6. Commit and Push (Safe - No Credentials Included)

Since `config.js` is gitignored, your credentials will NOT be committed:

```bash
git add .
git commit -m "Initial setup of meeting archive system"
git push origin main
```

**Verify**: Make sure `config.js` is NOT in your git status output before committing!

## 🎯 How It Works

### Authentication Flow

1. User clicks **"Login with GitHub"** on the frontend
2. User is redirected to GitHub OAuth authorization page
3. After authorization, GitHub redirects back with an OAuth code
4. User fills out the meeting form and clicks submit

### Submission Flow

1. Frontend triggers the `submit_meeting.yml` workflow via `workflow_dispatch`
2. Frontend sends: OAuth code + meeting data
3. GitHub Actions workflow:
   - Exchanges OAuth code for access token (using client secret)
   - Calls GitHub API to get the authenticated user's username
   - Appends meeting record to `data/meetings.json` with `submitted_by` and `timestamp`
   - Commits changes back to the repository
4. User sees success message and can view the dashboard

### Security Model

- **Client Secret**: Never exposed to frontend, stays in GitHub Actions secrets
- **Access Token**: Never sent to frontend, used only server-side in workflow
- **PAT**: Fine-grained with minimal permissions (Actions:write only)
- **Audit Trail**: Every submission records which GitHub user submitted it

## 📁 Project Structure

```
.
├── .github/
│   └── workflows/
│       └── submit_meeting.yml    # Workflow to process submissions
├── data/
│   └── meetings.json             # Meeting records storage
├── .gitignore                    # Keeps config.js private
├── config.example.js             # Template for configuration
├── config.js                     # Your credentials (gitignored, not in repo)
├── index.html                    # Main submission form
├── app.js                        # Frontend JavaScript
├── dashboard.html                # View all meetings
└── README.md                     # This file
```

## 🔧 Usage

### Submitting a Meeting

1. Visit `https://singularitynet-archive.github.io/Prototype-Meeting-Archives/`
2. Click **"Login with GitHub"** and authorize the app
3. Fill out the meeting form:
   - **Title**: Meeting name
   - **Date**: Meeting date
   - **Participants**: Who attended
   - **Topics**: What was discussed
   - **Decisions**: Key decisions made
   - **Actions**: Follow-up action items
   - **Notes**: Additional information
4. Click **"Submit Meeting Record"**
5. Wait for confirmation message

### Viewing Meetings

1. Visit `https://singularitynet-archive.github.io/Prototype-Meeting-Archives/dashboard.html`
2. Browse all submitted meetings
3. Use the search box to filter by keywords
4. Click **"Refresh"** to see new submissions

## 🛡️ Security Considerations

### ✅ Safe for Public Repositories

- ✅ **Credentials never committed**: `config.js` is gitignored and stays local
- ✅ **OAuth client secret** is stored in GitHub Actions secrets (never in code)
- ✅ **Access tokens** never reach the frontend
- ✅ **Classic PAT** has minimal scope (public_repo for public repos)
- ✅ **No secrets in repository**: Safe to share publicly

### ⚠️ Important Notes

1. **Local config.js**: Each user needs their own `config.js` file locally (never commit it!)
2. **GitHub Pages deployment**: For production, you'll need to handle config differently (see below)
3. **PAT Expiration**: Remember to renew your PAT before it expires
4. **OAuth Code**: Single-use only - frontend forces re-authentication after each submission
5. **Public Data**: Meeting records in `data/meetings.json` are public (visible to anyone)

### 🌐 Deploying to GitHub Pages

For GitHub Pages deployment, since `config.js` is gitignored, you have two options:

**Option 1: GitHub Actions Build Step** (Recommended for production)
- Create a GitHub Actions workflow that injects secrets during deployment
- Use `secrets.GITHUB_CLIENT_ID` and `secrets.GITHUB_PAT` to generate `config.js` at build time

**Option 2: Manual Configuration**
- After GitHub Pages deploys, manually upload `config.js` to the Pages branch
- Note: This is less secure and harder to maintain

## 🐛 Troubleshooting

### "Error: Authentication failed"

- Check that `OAUTH_CLIENT_ID` and `OAUTH_CLIENT_SECRET` are set correctly in repository secrets
- Verify that the Client ID in `app.js` matches your OAuth App

### "Error: Workflow file not found"

- Ensure `.github/workflows/submit_meeting.yml` exists in your repository
- Check that you've pushed the workflow file to the main branch

### "Error: Failed to submit meeting"

- Verify your GitHub PAT in `app.js` is valid and has the correct scope (public_repo or repo)
- Check GitHub Actions tab for workflow run errors
- Ensure the workflow has `contents: write` permission

### OAuth redirect doesn't work

- Verify the redirect URI in your OAuth App settings matches exactly:
  `https://singularitynet-archive.github.io/Prototype-Meeting-Archives/`
- Check that GitHub Pages is enabled and deployed

## 📝 Data Format

Each meeting record in `data/meetings.json`:

```json
{
  "title": "Weekly Team Sync",
  "date": "2025-10-28",
  "participants": "Alice, Bob, Carol",
  "topics": "Project updates and roadmap discussion",
  "decisions": "Approved new feature timeline",
  "actions": "Alice to draft requirements, Bob to set up dev environment",
  "notes": "Next meeting scheduled for next week",
  "submitted_by": "alice-github",
  "timestamp": "2025-10-28T14:30:00Z"
}
```

## 🤝 Contributing

This is a prototype system. Feel free to:

- Report issues
- Suggest improvements
- Submit pull requests

## 📄 License

MIT License - feel free to use and modify as needed.

---

**Built with ❤️ using GitHub Pages, GitHub Actions, and GitHub OAuth**

