# DigitalOcean Deployment Configuration for Expo Static Web

## Important: This project requires specific configuration for DigitalOcean App Platform

### Deployment Settings

When deploying to DigitalOcean App Platform, ensure these settings:

#### Build Settings:

- **Build Command**: `npm run vercel-build` or `expo export`
- **Output Directory**: `dist`

#### App Settings (IMPORTANT):

- **Routes**: Add a catch-all route to handle client-side routing
  - In your DigitalOcean App Platform settings, you need to configure the app to serve `index.html` for all routes

### Files Included for Routing:

1. **public/\_redirects** - This file tells static hosts to redirect all routes to index.html
2. **public/.staticwebapp.config.json** - Alternative configuration for some platforms

### After Deployment:

The `_redirects` file should be present in your `dist` folder after building. This tells DigitalOcean:

```
/* /index.html 200
```

This means: "For any path (/\*), serve index.html with a 200 status code" - allowing client-side routing to work.

### Troubleshooting:

If you still get 404 errors after deployment:

1. **Check Build Output**: Verify that `dist/_redirects` exists after build
2. **DigitalOcean Settings**: In the DigitalOcean dashboard:
   - Go to your app settings
   - Under "Routes", make sure there's a catch-all route configured
   - Or enable "SPA" (Single Page Application) mode if available

3. **Alternative: Use DigitalOcean's App Spec**
   You can add this to your app spec YAML configuration:
   ```yaml
   static_sites:
     - name: swimrnmobile
       output_dir: dist
       catchall_document: index.html
       routes:
         - path: /
   ```

### Environment Variables:

Make sure these are set in DigitalOcean:

- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY
- EXPO_PUBLIC_APP_URL
- EXPO_PUBLIC_WEB_SECRET_KEY

### Redeployment Steps:

1. Commit and push your changes (including the new public/\_redirects file)
2. Rebuild on DigitalOcean (it should automatically trigger)
3. Test your shared dashboard URL again

The route should now work: https://swim-web-view-kajhj.ondigitalocean.app/shared-dashboard/[token]
