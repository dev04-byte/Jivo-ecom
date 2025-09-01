# Complete Guide to Deploy Jivo Ecom App on Render

## Prerequisites
- GitHub account with your code pushed to repository
- Render account (sign up at https://render.com)
- Your application code ready in GitHub repository

## Step 1: Prepare Your Application for Deployment

### 1.1 Update package.json Scripts
Ensure your `package.json` has the following scripts:

```json
{
  "scripts": {
    "dev": "tsx server/index.ts",
    "build": "vite build",
    "start": "NODE_ENV=production tsx server/index.ts",
    "preview": "vite preview"
  }
}
```

### 1.2 Create render.yaml Configuration File
Create a `render.yaml` file in your root directory:

```yaml
services:
  - type: web
    name: jivo-ecom-app
    runtime: node
    region: oregon
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm run start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: DATABASE_URL
        fromDatabase:
          name: jivo-ecom-db
          property: connectionString

databases:
  - name: jivo-ecom-db
    region: oregon
    plan: free
    databaseName: ecom
    user: postgres
```

### 1.3 Update Your Database Configuration
Modify `server/db.ts` to use DATABASE_URL in production:

```typescript
const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;
```

## Step 2: Push Code to GitHub

```bash
# If not already done
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

## Step 3: Create Render Account and Connect GitHub

1. **Sign up for Render**
   - Go to https://render.com
   - Sign up using GitHub (recommended) or email
   - Verify your email if needed

2. **Connect GitHub Repository**
   - Click "New +" button in Render Dashboard
   - Select "Web Service"
   - Connect your GitHub account if not already connected
   - Authorize Render to access your repositories
   - Select your `Jivo-ecom` repository

## Step 4: Configure Web Service on Render

1. **Basic Settings**
   - **Name**: `jivo-ecom-app` (or your preferred name)
   - **Region**: Oregon (US West) or Singapore (for Asia)
   - **Branch**: `main`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`

2. **Instance Type**
   - Select "Free" tier to start (512 MB RAM, 0.1 CPU)
   - You can upgrade later if needed

## Step 5: Set Up PostgreSQL Database on Render

1. **Create Database**
   - Go to Render Dashboard
   - Click "New +" → "PostgreSQL"
   - Configure:
     - **Name**: `jivo-ecom-db`
     - **Database**: `ecom`
     - **User**: `postgres`
     - **Region**: Same as your web service (Oregon)
     - **PostgreSQL Version**: 15
     - **Plan**: Free tier

2. **Wait for Database Creation**
   - This takes 1-2 minutes
   - Note down the connection details provided

## Step 6: Configure Environment Variables

In your Web Service settings on Render, go to "Environment" tab and add:

### Required Environment Variables:

```bash
# Database (auto-connected if using Render PostgreSQL)
DATABASE_URL=(automatically set by Render)

# SQL Server Configuration (your existing SQL Server)
SQLSERVER_HOST=103.89.44.240
SQLSERVER_PORT=1433
SQLSERVER_USER=webm2
SQLSERVER_PASSWORD=foxpro@7
SQLSERVER_DATABASE=jsap
SQLSERVER_ENCRYPT=false
SQLSERVER_TRUST_SERVER_CERT=true

# Application Settings
NODE_ENV=production
PORT=10000
SESSION_SECRET=your-super-secure-session-secret-min-32-chars-change-this
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
LOG_LEVEL=info

# CORS (update after deployment with your Render URL)
CORS_ORIGIN=https://your-app-name.onrender.com
```

### How to Add Environment Variables:
1. Go to your Web Service dashboard on Render
2. Click on "Environment" in the left sidebar
3. Add each variable one by one or use "Add from .env file"
4. Click "Save Changes"

## Step 7: Run Database Migrations

After deployment, you need to set up your database schema:

1. **Access Render Shell**
   - Go to your Web Service dashboard
   - Click "Shell" tab
   - Run migrations:
   ```bash
   npx drizzle-kit push:pg
   ```

2. **Alternative: Use PostgreSQL Client**
   - Connect to your Render PostgreSQL using the connection string
   - Run your SQL schema files manually

## Step 8: Deploy the Application

1. **Automatic Deployment**
   - Render automatically starts deployment after setup
   - Watch the deployment logs in "Logs" tab
   - Deployment typically takes 3-5 minutes

2. **Manual Deployment**
   - Click "Manual Deploy" → "Deploy latest commit"

## Step 9: Verify Deployment

1. **Check Deployment Status**
   - Look for "Live" status in Render dashboard
   - Check logs for any errors

2. **Access Your Application**
   - Your app will be available at: `https://[your-app-name].onrender.com`
   - Test all major features:
     - Login functionality
     - PO creation
     - File uploads
     - Database operations

## Step 10: Post-Deployment Configuration

1. **Update CORS Settings**
   - Update `CORS_ORIGIN` environment variable with your actual Render URL
   - Redeploy if needed

2. **Set Up Custom Domain (Optional)**
   - Go to Settings → Custom Domains
   - Add your domain and follow DNS configuration

3. **Configure Auto-Deploy**
   - Go to Settings → Build & Deploy
   - Enable "Auto-Deploy" for automatic deployment on git push

## Troubleshooting Common Issues

### Issue 1: Build Fails
**Solution**: Check build logs and ensure all dependencies are in package.json

### Issue 2: Database Connection Error
**Solution**: 
- Verify DATABASE_URL is set correctly
- Check if migrations have run
- Ensure PostgreSQL service is running

### Issue 3: Port Binding Error
**Solution**: Use `process.env.PORT` instead of hardcoded port

### Issue 4: File Upload Issues
**Solution**: 
- Free tier has limited disk space
- Consider using cloud storage (AWS S3, Cloudinary)

### Issue 5: Application Crashes
**Solution**:
- Check logs in Render dashboard
- Ensure all environment variables are set
- Verify Node version compatibility

## Performance Optimization

1. **Scaling Options**
   - Upgrade to Starter ($7/month) for:
     - 512 MB RAM → 512 MB RAM (dedicated)
     - No sleep after 15 minutes of inactivity
     - Better performance

2. **Database Optimization**
   - Upgrade PostgreSQL to Starter for better performance
   - Add indexes to frequently queried columns

3. **Static Asset Optimization**
   - Serve static files through CDN
   - Enable gzip compression

## Monitoring and Maintenance

1. **Set Up Monitoring**
   - Use Render's built-in metrics
   - Set up alerts for downtime

2. **Regular Maintenance**
   - Monitor logs regularly
   - Keep dependencies updated
   - Regular database backups

## Important Notes

### Free Tier Limitations:
- Web services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month of running time
- PostgreSQL free tier: 1 GB storage, 97 days retention

### Security Considerations:
- Never commit `.env` file to GitHub
- Use strong SESSION_SECRET
- Enable HTTPS (automatic on Render)
- Regularly update dependencies

## Quick Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] GitHub connected to Render
- [ ] Web Service created
- [ ] PostgreSQL database created
- [ ] Environment variables configured
- [ ] Build successful
- [ ] Database migrations run
- [ ] Application accessible via URL
- [ ] All features tested

## Support and Resources

- **Render Documentation**: https://render.com/docs
- **Render Status Page**: https://status.render.com
- **Community Forum**: https://community.render.com
- **Support**: support@render.com

## Next Steps After Deployment

1. Set up monitoring and alerts
2. Configure custom domain
3. Implement CI/CD pipeline
4. Set up staging environment
5. Plan for scaling based on usage

---

**Deployment Time Estimate**: 30-45 minutes for first-time setup

**Note**: Keep this guide updated as your application evolves!