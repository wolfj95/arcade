# Deploying Virtual Arcade to Netlify

This guide will walk you through deploying your Virtual Arcade Workshop game to Netlify for free hosting.

## Prerequisites

- A [Netlify account](https://app.netlify.com/signup) (free)
- Your Supabase credentials (URL and anon key)
- Git installed on your computer (optional, for Git-based deployment)

## Method 1: Deploy via Netlify Drop (Drag & Drop)

This is the easiest method for quick deployments.

### Step 1: Prepare Your Project

1. Make sure your `config.js` file exists with your Supabase credentials:
   ```javascript
   const SUPABASE_CONFIG = {
     url: 'https://your-project.supabase.co',
     anonKey: 'your-anon-key'
   };
   ```

2. Verify all files are in place:
   - `index.html`
   - `css/` directory
   - `js/` directory
   - `assets/` directory
   - `config.js`

### Step 2: Deploy to Netlify

1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Drag and drop your entire project folder onto the upload area
3. Wait for the deployment to complete (usually takes 10-30 seconds)
4. Netlify will provide you with a URL like `https://random-name-12345.netlify.app`

### Step 3: Test Your Deployment

1. Visit the provided URL
2. Test the following:
   - Game loads correctly
   - Player can move around
   - NPCs are visible and moving
   - Arcade machines are interactive
   - Modal opens when clicking machines
   - Supabase connection works (check browser console for errors)

## Method 2: Deploy via Git (Recommended for Updates)

This method allows automatic redeployment when you push changes to your repository.

### Step 1: Initialize Git Repository

If you haven't already, initialize a Git repository:

```bash
cd /path/to/virtual_arcade
git init
git add .
git commit -m "Initial commit"
```

### Step 2: Push to GitHub/GitLab/Bitbucket

1. Create a new repository on [GitHub](https://github.com/new), GitLab, or Bitbucket
2. Follow the instructions to push your local repository:
   ```bash
   git remote add origin https://github.com/yourusername/virtual-arcade.git
   git branch -M main
   git push -u origin main
   ```

### Step 3: Connect Netlify to Your Repository

1. Log in to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose your Git provider (GitHub/GitLab/Bitbucket)
4. Authorize Netlify to access your repositories
5. Select your `virtual-arcade` repository

### Step 4: Configure Build Settings

Since this is a static site with no build process:

- **Build command**: Leave empty
- **Publish directory**: `.` (current directory)
- **Branch to deploy**: `main`

Click "Deploy site"

### Step 5: Configure Supabase Credentials

Your `config.js` file is already set up to work with both local development and Netlify deployment.

**Option 1: Simple Deployment (Recommended)**

Just deploy as-is. The config file uses the hardcoded Supabase credentials which will work fine for production.

**Option 2: Environment Variables (More Secure)**

If you want to keep credentials out of your code repository:

1. In Netlify, go to "Site settings" → "Environment variables"
2. Add the following variables:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon key

3. Enable snippet injection:
   - Go to "Site settings" → "Build & deploy" → "Post processing"
   - Scroll to "Snippet injection"
   - Click "Add snippet"
   - Insert before `</head>`
   - Add this code:
     ```html
     <script>
       window.ENV = {
         SUPABASE_URL: '%%SUPABASE_URL%%',
         SUPABASE_ANON_KEY: '%%SUPABASE_ANON_KEY%%'
       };
     </script>
     ```
   - Save

Your `config.js` will automatically detect and use these environment variables if available, otherwise it falls back to the hardcoded values.

## Configuring a Custom Domain

### Step 1: Add Custom Domain

1. In Netlify dashboard, go to "Domain settings"
2. Click "Add custom domain"
3. Enter your domain name (e.g., `arcade.example.com`)

### Step 2: Configure DNS

Add the following DNS records at your domain provider:

**For subdomain (e.g., arcade.example.com):**
- Type: `CNAME`
- Name: `arcade`
- Value: `your-site-name.netlify.app`

**For apex domain (e.g., example.com):**
- Type: `A`
- Name: `@`
- Value: `75.2.60.5` (Netlify's load balancer)

### Step 3: Enable HTTPS

1. Wait for DNS propagation (can take up to 48 hours, usually much faster)
2. In Netlify, go to "Domain settings" → "HTTPS"
3. Click "Verify DNS configuration"
4. Enable "Force HTTPS" to redirect all HTTP traffic to HTTPS

## Updating Your Deployment

### Via Netlify Drop
- Simply drag and drop your updated project folder again
- The new deployment will replace the old one

### Via Git
- Make your changes locally
- Commit and push to your repository:
  ```bash
  git add .
  git commit -m "Description of changes"
  git push
  ```
- Netlify will automatically rebuild and deploy your site

## Netlify Configuration File (Optional)

Create a `netlify.toml` file in your project root for advanced configuration:

```toml
[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

This configuration:
- Sets security headers
- Enables caching for assets
- Ensures proper routing for single-page apps

## Troubleshooting

### Issue: Game doesn't load

**Solution:**
- Check browser console for errors (F12)
- Verify all file paths are correct (case-sensitive on Netlify)
- Ensure `config.js` exists and has valid Supabase credentials

### Issue: Assets not loading (404 errors)

**Solution:**
- Check that all asset paths are relative (e.g., `assets/map/arcade.json` not `/assets/map/arcade.json`)
- Verify file names match exactly (Linux servers are case-sensitive)
- Check that all files were included in the deployment

### Issue: Supabase connection fails

**Solution:**
- Check browser console for CORS errors
- Verify Supabase URL and anon key are correct
- Ensure your Supabase project allows requests from your Netlify domain
- In Supabase dashboard, go to Authentication → URL Configuration → Add your Netlify URL to allowed URLs

### Issue: NPCs or sprites not showing

**Solution:**
- Verify all sprite images exist in `assets/npc_sprites/`
- Check browser console for image loading errors
- Ensure file names in `game.js` match actual file names exactly

### Issue: Modal/form submissions don't work

**Solution:**
- Check that form HTML elements have proper IDs
- Verify JavaScript event listeners are properly attached
- Check browser console for JavaScript errors

## Performance Optimization

### Enable Asset Optimization

1. In Netlify dashboard, go to "Site settings" → "Build & deploy" → "Post processing"
2. Enable:
   - Bundle CSS
   - Minify CSS
   - Minify JS
   - Compress images
   - Pretty URLs

### Optimize Images

Before deploying, compress your images:
- Use tools like [TinyPNG](https://tinypng.com/) or [Squoosh](https://squoosh.app/)
- Convert to WebP format for better compression
- Use appropriate dimensions (don't serve oversized images)

## Monitoring Your Site

### Netlify Analytics

1. In Netlify dashboard, go to "Analytics"
2. View pageviews, bandwidth usage, and performance metrics
3. Monitor deployment history and logs

### Uptime Monitoring

Consider using:
- [UptimeRobot](https://uptimerobot.com/) (free)
- [Pingdom](https://www.pingdom.com/)
- Netlify's built-in monitoring

## Cost Considerations

**Netlify Free Tier includes:**
- 100 GB bandwidth/month
- 300 build minutes/month
- Unlimited sites
- HTTPS
- Continuous deployment

For most games/projects, the free tier is sufficient. Upgrade to paid plans if you need:
- More bandwidth (>100 GB/month)
- Team collaboration features
- Advanced security features
- SLA guarantees

## Next Steps

1. Share your game URL with students/users
2. Monitor usage and performance
3. Set up a custom domain for a professional look
4. Consider adding analytics to track player engagement
5. Regularly update your game based on feedback

## Useful Links

- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Community Forum](https://answers.netlify.com/)
- [Netlify Status Page](https://www.netlifystatus.com/)
- [Supabase Documentation](https://supabase.com/docs)

## Support

If you encounter issues:
1. Check Netlify's [support guides](https://docs.netlify.com/)
2. Review deployment logs in Netlify dashboard
3. Ask in [Netlify Community Forums](https://answers.netlify.com/)
4. Contact Netlify Support (paid plans only)

---

**Congratulations!** Your Virtual Arcade Workshop is now live on the internet! 🎮
