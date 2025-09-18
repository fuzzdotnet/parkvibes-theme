# Ghost Theme Development Guide

## 🚨 Critical Rules for Theme Packaging

### ⛔ ALWAYS Exclude These Files from Theme Zip:

```bash
# NEVER include these in your Ghost theme zip:
node_modules/          # Contains symlinks that break Ghost upload
.git/                  # Version control files
.github/               # GitHub Actions workflows
*.log                  # Log files
.DS_Store              # macOS system files
.vscode/               # IDE configuration
.idea/                 # JetBrains IDE files
package-lock.json      # Lock files (not needed in production)
yarn.lock              # Yarn lock file
*.zip                  # Previous theme packages
tmp/                   # Temporary files
.env*                  # Environment variables
```

### ✅ Correct Theme Zip Command:

```bash
zip -r theme-name.zip . -x \
  "node_modules/*" \
  ".git/*" \
  ".github/*" \
  "*.log" \
  ".DS_Store" \
  "*.zip" \
  "package-lock.json" \
  "yarn.lock" \
  ".env*" \
  ".vscode/*" \
  ".idea/*" \
  "tmp/*"
```

## 📁 Required Ghost Theme Structure

```
theme-name/
├── package.json              # Theme metadata and configuration
├── index.hbs                 # Post listing template
├── post.hbs                  # Individual post template
├── default.hbs               # Base template
├── assets/
│   ├── build/                # Compiled CSS/JS (REQUIRED)
│   │   ├── theme-name.min.css
│   │   └── theme-name.min.js
│   ├── fonts/                # Custom fonts (if any)
│   └── js/                   # Source JavaScript files
├── partials/                 # Template partials
└── locales/                  # Translation files
```

## 🛠️ Development Workflow

### 1. Setting Up Development Environment

```bash
# Install dependencies
npm install

# Install required packages for SCSS compilation
npm install sass-mq modern-normalize --save
```

### 2. CSS Compilation

**⚠️ CRITICAL**: Always recompile CSS after making changes to SCSS files.

```bash
# Compile SCSS to CSS
npx sass --load-path=node_modules assets/sass/style.scss assets/build/theme-name.min.css --style=compressed

# Generate source maps for development
npx sass --load-path=node_modules assets/sass/style.scss assets/build/theme-name.min.css --source-map
```

### 3. Font Integration Best Practices

#### Custom Font Implementation:
1. **Place fonts in**: `assets/fonts/`
2. **Create font declarations**: `assets/sass/tokens/_custom-fonts.scss`
3. **Use @font-face with**:
   ```scss
   @font-face {
     font-family: 'Your Font';
     src: url('../fonts/your-font.woff2') format('woff2');
     font-display: swap; // Critical for performance
   }
   ```
4. **Update font stacks**: `assets/sass/tokens/_typography.scss`

## 📦 Theme Packaging Checklist

### Before Creating Zip:

- [ ] ✅ CSS is compiled and up to date
- [ ] ✅ All required Ghost CSS classes are present
- [ ] ✅ Custom fonts are in `assets/fonts/`
- [ ] ✅ No symlinks in project directory
- [ ] ✅ No `node_modules` directory
- [ ] ✅ No development files (.env, .git, etc.)
- [ ] ✅ `package.json` has correct theme metadata

### Required Ghost CSS Classes:

Your compiled CSS MUST include these classes:
```css
.kg-width-wide
.kg-width-full
.kg-gallery-container
.kg-gallery-row
.kg-gallery-image
.kg-bookmark-card
.kg-bookmark-container
.kg-bookmark-content
.kg-bookmark-title
.kg-bookmark-description
.kg-bookmark-metadata
.kg-bookmark-icon
.kg-bookmark-author
.kg-bookmark-publisher
.kg-bookmark-thumbnail
```

## 🚀 Deployment Options

### Option 1: Manual Upload
1. Create clean zip file (see command above)
2. Upload via Ghost Admin → Design → Upload Theme

### Option 2: GitHub Actions (Automatic)
```yaml
# .github/workflows/deploy-theme.yml
name: Deploy Theme
on:
  push:
    branches: [main, master]
jobs:
  deploy:
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v3
      - name: Deploy Ghost Theme
        uses: TryGhost/action-deploy-theme@v1
        with:
          api-url: ${{ secrets.GHOST_ADMIN_API_URL }}
          api-key: ${{ secrets.GHOST_ADMIN_API_KEY }}
```

## 🔧 Troubleshooting Common Issues

### "Symlinks are not allowed in the zip folder"
**Cause**: `node_modules` directory contains symlinks
**Fix**: Exclude `node_modules` from zip (see packaging command above)

### "Required CSS classes are missing"
**Cause**: CSS not compiled after SCSS changes
**Fix**: Recompile CSS using the sass command above

### "Font not loading"
**Causes**:
- Font files not included in zip
- Incorrect file paths in CSS
- Missing @font-face declarations

**Fix**:
- Ensure fonts are in `assets/fonts/`
- Use relative paths: `url('../fonts/font-name.woff2')`
- Include `font-display: swap`

### "Theme validation errors"
**Common Issues**:
- Missing required template files
- Invalid handlebars syntax
- Incorrect package.json structure

**Fix**: Validate against [Ghost theme requirements](https://ghost.org/docs/themes/structure/)

## 📋 Package.json Requirements

```json
{
  "name": "theme-name",
  "description": "Theme description",
  "version": "1.0.0",
  "engines": {
    "ghost": ">=5.0.0"
  },
  "keywords": ["ghost-theme"],
  "config": {
    "posts_per_page": 15,
    "image_sizes": {
      // Define responsive image sizes
    }
  }
}
```

## 🎯 Performance Best Practices

1. **Optimize fonts**: Use WOFF2 format when possible
2. **Compress CSS**: Always use `--style=compressed`
3. **Font loading**: Use `font-display: swap`
4. **Image optimization**: Define appropriate image sizes in package.json
5. **Minimize dependencies**: Only include necessary files in zip

## 📚 Additional Resources

- [Ghost Theme Documentation](https://ghost.org/docs/themes/)
- [Handlebars Documentation](https://handlebarsjs.com/)
- [Ghost API Documentation](https://ghost.org/docs/content-api/)

---

**Remember**: Ghost themes should be lightweight, fast, and contain only production-ready files. Never include development dependencies or temporary files in your theme package.