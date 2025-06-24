# Publishing Guide for Rakit UI AI

## Prerequisites

1. **npm Account**: Create an account at [npmjs.com](https://www.npmjs.com) if you don't have one
2. **GitHub Repository**: Upload your code to GitHub and update the repository URL in `package.json`

## Step-by-Step Publishing Process

### 1. Update Repository Information

Edit `package.json` and replace the placeholder URLs with your actual GitHub repository:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/rakitui-ai.git"
  },
  "homepage": "https://github.com/YOUR_USERNAME/rakitui-ai#readme",
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/rakitui-ai/issues"
  }
}
```

### 2. Login to npm

```bash
npm login
```

Enter your npm username, password, and email when prompted.

### 3. Verify Package Contents

```bash
# See what will be published
npm pack --dry-run
```

### 4. Test Locally (Optional)

```bash
# Test the built package locally
npm pack
npm install -g rakitui-ai-1.0.0.tgz
rakitui-ai
```

### 5. Publish to npm

```bash
# Build and publish
npm publish
```

### 6. Verify Publication

```bash
# Test the published package
npx rakitui-ai@latest
```

## Post-Publication

Once published, users can use your tool with:

```bash
# Direct usage
npx rakitui-ai

# Or global install
npm install -g rakitui-ai
rakitui-ai
```

## Version Updates

For future updates:

1. Update the version in `package.json`:
   ```bash
   npm version patch  # For bug fixes
   npm version minor  # For new features
   npm version major  # For breaking changes
   ```

2. Rebuild and publish:
   ```bash
   npm run build
   npm publish
   ```

## Troubleshooting

- **Package name taken**: Change the `name` field in `package.json` to something unique
- **Login issues**: Make sure you're using the correct npm registry: `npm config set registry https://registry.npmjs.org/`
- **Permission denied**: Make sure you own the package name or use a scoped package: `@yourusername/rakitui-ai`

## Package Statistics

After publishing, you can track your package at:
- Package page: `https://www.npmjs.com/package/rakitui-ai`
- Download stats: `https://npm-stat.com/charts.html?package=rakitui-ai` 