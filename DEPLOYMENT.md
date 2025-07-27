# HouseHand Production Deployment Guide

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env.production` file in your root directory:

```bash
# Production Environment Variables
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
VITE_APP_NAME=HouseHand
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production
```

### 2. Supabase Production Setup

1. **Create Production Project**:
   ```bash
   # Go to https://supabase.com and create a new project
   # Or use CLI if you have it configured
   ```

2. **Deploy Database Schema**:
   ```bash
   # Link to your production project
   supabase link --project-ref your-project-ref
   
   # Push all migrations
   supabase db push
   ```

3. **Update Supabase Configuration**:
   - Go to your Supabase dashboard
   - Update `site_url` in Authentication settings to your production domain
   - Add your production domain to `additional_redirect_urls`

### 3. Build for Production

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Preview the build (optional)
npm run preview
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Environment Variables**:
   - Add your environment variables in Vercel dashboard
   - Or use `vercel env add` command

### Option 2: Netlify

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**:
   ```bash
   netlify deploy --prod --dir=dist
   ```

3. **Environment Variables**:
   - Add in Netlify dashboard under Site settings > Environment variables

### Option 3: GitHub Pages

1. **Add GitHub Actions workflow** (create `.github/workflows/deploy.yml`):
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [ main ]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         - run: npm ci
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

### Option 4: AWS S3 + CloudFront

1. **Build and upload to S3**:
   ```bash
   npm run build
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

2. **Configure CloudFront** for CDN and HTTPS

## 🔧 Production Optimizations

### 1. Update Vite Config for Production

Add to your `vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps in production
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
  server: {
    host: "::",
    port: 8080,
    strictPort: false,
  },
});
```

### 2. Add Security Headers

Create a `_headers` file in your `public` directory:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 3. Update Supabase Auth Settings

In your Supabase dashboard:

1. **Authentication > URL Configuration**:
   - Site URL: `https://your-domain.com`
   - Redirect URLs: `https://your-domain.com/**`

2. **Authentication > Settings**:
   - Enable email confirmations (recommended for production)
   - Set appropriate password requirements

## 🔍 Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] Supabase production project created and linked
- [ ] Database migrations applied
- [ ] Auth settings updated for production domain
- [ ] Application builds successfully
- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Security headers configured
- [ ] SSL certificate configured (if self-hosting)

## 🚨 Post-Deployment

1. **Test Authentication Flow**:
   - Sign up new user
   - Sign in existing user
   - Password reset functionality

2. **Test Core Features**:
   - Task creation
   - Bidding system
   - Payment flow
   - Notifications

3. **Monitor Performance**:
   - Check bundle size
   - Monitor API response times
   - Set up error tracking (Sentry, LogRocket, etc.)

## 🔧 Troubleshooting

### Common Issues:

1. **CORS Errors**: Check Supabase RLS policies and CORS settings
2. **Auth Redirect Issues**: Verify redirect URLs in Supabase dashboard
3. **Build Failures**: Check for missing environment variables
4. **Performance Issues**: Optimize bundle size and enable compression

### Useful Commands:

```bash
# Check bundle size
npm run build && npx vite-bundle-analyzer

# Test production build locally
npm run build && npm run preview

# Check for unused dependencies
npx depcheck
```

## 📞 Support

If you encounter issues during deployment, check:
1. Supabase documentation: https://supabase.com/docs
2. Vite deployment guide: https://vitejs.dev/guide/static-deploy.html
3. Your hosting provider's documentation 