# Environment Variables Troubleshooting

If you're seeing "Missing Supabase environment variables" error:

## Quick Fix Steps:

1. **Stop the dev server** (Ctrl+C in terminal)

2. **Clear the cache:**
   ```bash
   rm -rf dist node_modules/.vite
   ```

3. **Restart the dev server:**
   ```bash
   npm run dev
   ```

4. **Hard refresh your browser:**
   - Chrome/Edge: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Firefox: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
   - Or open DevTools → Right-click refresh button → "Empty Cache and Hard Reload"

5. **Verify .env file exists:**
   ```bash
   cat .env
   ```
   Should show:
   ```
   VITE_SUPABASE_URL=https://cxtrveivzruypednddes.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Common Issues:

### Issue: .env file not in root directory
- Make sure `.env` is in the project root (same level as `package.json`)

### Issue: Environment variables not prefixed with VITE_
- Vite only exposes variables prefixed with `VITE_`
- Make sure your variables are: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Issue: Dev server was running before .env was created
- Always restart the dev server after creating/updating `.env` file

### Issue: Browser cache
- Clear browser cache or use incognito/private window
- Hard refresh the page

## Verify Environment Variables are Loading:

Open browser console and run:
```javascript
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
```

If both show values, the environment variables are loading correctly.

