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

The frontend needs a fine-grained PAT to trigger workflows:

1. Go to [GitHub Token Settings](https://github.com/settings/tokens?type=beta)
2. Click **"Generate new token"** → **"Fine-grained token"**
3. Configure the token:
   - **Token name**: `Meeting Archive Workflow Trigger`
   - **Expiration**: Choose your preferred duration
   - **Repository access**: Select **"Only select repositories"** → Choose `Prototype-Meeting-Archives`
   - **Permissions** → **Repository permissions**:
     - **Actions**: Read and write access
4. Click **"Generate token"** and **save it securely**

### 4. Update Frontend Configuration

Edit `app.js` and update the `CONFIG` object:

```javascript
const CONFIG = {
    // Replace with your GitHub OAuth App Client ID from step 1
    GITHUB_CLIENT_ID: 'Ov23abc123def456...',
    
    // Replace with your fine-grained PAT from step 3
    GITHUB_PAT: 'github_pat_11ABC...',
    
    // These are already set correctly
    REPO_OWNER: 'SingularityNET-Archive',
    REPO_NAME: 'Prototype-Meeting-Archives',
    REDIRECT_URI: 'https://singularitynet-archive.github.io/Prototype-Meeting-Archives/'
};
```

### 5. Enable GitHub Pages

1. Go to **Settings** → **Pages**
2. Under **Source**, select:
   - **Branch**: `main` (or `master`)
   - **Folder**: `/ (root)`
3. Click **Save**
4. Wait a few minutes for GitHub Pages to deploy
5. Your site will be available at: `https://singularitynet-archive.github.io/Prototype-Meeting-Archives/`

### 6. Commit and Push

```bash
git add .
git commit -m "Initial setup of meeting archive system"
git push origin main
```

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

- OAuth client secret is stored in GitHub Actions secrets (never in code)
- Access tokens never reach the frontend
- Fine-grained PAT has minimal permissions (Actions:write only)

### ⚠️ Important Notes

1. **PAT Expiration**: Remember to renew your PAT before it expires
2. **OAuth Code**: Single-use only - frontend forces re-authentication after each submission
3. **Public Data**: Meeting records in `data/meetings.json` are public (visible to anyone)

## 🐛 Troubleshooting

### "Error: Authentication failed"

- Check that `OAUTH_CLIENT_ID` and `OAUTH_CLIENT_SECRET` are set correctly in repository secrets
- Verify that the Client ID in `app.js` matches your OAuth App

### "Error: Workflow file not found"

- Ensure `.github/workflows/submit_meeting.yml` exists in your repository
- Check that you've pushed the workflow file to the main branch

### "Error: Failed to submit meeting"

- Verify your GitHub PAT in `app.js` is valid and has Actions:write permission
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

