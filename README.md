# Alibi Sanity Studio

A Sanity Studio for managing film content, awards, services, and addresses.

## 🚀 Deployment to GitHub Pages

This project is configured for automatic deployment to GitHub Pages.

### Prerequisites

1. **GitHub Repository**: Push your code to a GitHub repository
2. **GitHub Pages**: Enable GitHub Pages in your repository settings

### Setup Steps

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add GitHub Pages deployment"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Navigate to Settings → Pages
   - Under "Source", select "GitHub Actions"
   - Save the settings

3. **Automatic Deployment**:
   - The GitHub Action will automatically build and deploy your Sanity Studio
   - Your studio will be available at: `https://yourusername.github.io/your-repo-name`

### Manual Deployment

If you want to deploy manually:

```bash
# Build for GitHub Pages
npm run build:gh-pages

# The built files will be in the `dist/` directory
# You can then upload these to any static hosting service
```

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

- `schemaTypes/` - Sanity schema definitions
- `plugins/` - Custom Sanity plugins
- `.github/workflows/` - GitHub Actions for deployment
- `public/` - Static assets

## 🎬 Content Types

- **Films** - Movie documents with categories
- **Categories** - Film categories with colors
- **Awards** - Award documents with categories and years
- **Services** - Service offerings with features
- **Addresses** - Office locations with country codes

## 🔧 Configuration

The studio is configured in `sanity.config.ts` with:
- Custom structure with icons
- Vision tool for queries
- Organized content sections

## 📝 License

UNLICENSED