# Scope Media Platform - Deployment Guide

## 🚀 Deployment Overview

This guide covers deploying the Scope Media Platform to various hosting providers and environments. The platform is built with Next.js 15 and requires a Supabase backend.

---

## 📋 Prerequisites

### Required Accounts
- [Supabase Account](https://supabase.com) - Database and authentication
- Hosting provider account (Vercel, Netlify, VPS, etc.)
- Domain name (optional but recommended)

### Required Tools
- Node.js 18+ installed locally
- Git for version control
- Environment variables configured

---

## 🔧 Environment Setup

### 1. Supabase Setup

#### Create Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose organization and project name
4. Set database password
5. Select region closest to your users
6. Click "Create new project"

#### Get Supabase Credentials
1. Go to Project Settings → API
2. Copy the following values:
   - Project URL
   - Anon (public) key
   - Service role key (keep secret!)

#### Set Up Database Schema
1. Go to SQL Editor in Supabase Dashboard
2. Copy and paste the contents of `supabase-schema.sql`
3. Click "Run" to execute the schema
4. Verify tables are created in Table Editor

### 2. Environment Variables

Create `.env.local` file:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: Custom configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=Scope Media Platform
```

### 3. Test Local Setup
```bash
# Install dependencies
npm install

# Seed database
npm run seed

# Start development server
npm run dev

# Test database connection
npm run test:db
```

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the recommended hosting provider for Next.js applications.

#### Deploy to Vercel
1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy from project directory
   vercel
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all variables from `.env.local`
   - Set for Production, Preview, and Development

3. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Deploy**
   ```bash
   # Deploy to production
   vercel --prod
   ```

#### Vercel Configuration
Create `vercel.json`:
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

#### Custom Domain (Optional)
1. Go to Vercel Dashboard → Domains
2. Add your domain
3. Configure DNS records as instructed
4. Enable SSL certificate

---

### Option 2: Netlify

#### Deploy to Netlify
1. **Connect Repository**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Configure Build Settings**
   - Build Command: `npm run build`
   - Publish Directory: `.next`
   - Node Version: 18

3. **Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add all variables from `.env.local`

4. **Deploy**
   - Netlify will automatically deploy on git push
   - Check build logs for any issues

#### Netlify Configuration
Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Option 3: VPS/Dedicated Server

#### Server Requirements
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Storage**: 20GB+ SSD
- **CPU**: 2+ cores
- **Node.js**: 18+

#### Setup Process
1. **Prepare Server**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   sudo npm install -g pm2
   
   # Install Nginx (optional, for reverse proxy)
   sudo apt install nginx -y
   ```

2. **Deploy Application**
   ```bash
   # Clone repository
   git clone https://github.com/Nopeking/Scope-Media.git
   cd media-platform
   
   # Install dependencies
   npm install
   
   # Build application
   npm run build
   
   # Start with PM2
   pm2 start npm --name "media-platform" -- start
   
   # Save PM2 configuration
   pm2 save
   pm2 startup
   ```

3. **Configure Nginx (Optional)**
   ```nginx
   # /etc/nginx/sites-available/media-platform
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Enable SSL with Let's Encrypt**
   ```bash
   # Install Certbot
   sudo apt install certbot python3-certbot-nginx -y
   
   # Get SSL certificate
   sudo certbot --nginx -d your-domain.com
   ```

---

### Option 4: Docker Deployment

#### Create Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### Create docker-compose.yml
```yaml
version: '3.8'

services:
  media-platform:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    restart: unless-stopped
```

#### Deploy with Docker
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 🔒 Security Configuration

### 1. Environment Variables Security
- Never commit `.env.local` to version control
- Use different keys for development and production
- Rotate keys regularly
- Use secret management services in production

### 2. Supabase Security
- Enable Row Level Security (RLS) on all tables
- Configure proper RLS policies
- Use service role key only on server-side
- Set up proper CORS policies

### 3. Application Security
- Enable HTTPS in production
- Set up proper CORS headers
- Implement rate limiting
- Use security headers

### 4. Database Security
```sql
-- Example RLS policy for streams table
CREATE POLICY "Allow public read access to streams" 
ON streams FOR SELECT 
USING (true);

CREATE POLICY "Allow admin write access to streams" 
ON streams FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND subscription_plan = 'enterprise'
  )
);
```

---

## 📊 Monitoring and Logging

### 1. Application Monitoring
```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs media-platform

# Restart application
pm2 restart media-platform
```

### 2. Database Monitoring
- Use Supabase Dashboard for database metrics
- Monitor query performance
- Set up alerts for errors

### 3. Error Tracking
Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- New Relic for performance monitoring

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test
    
    - name: Build application
      run: npm run build
      env:
        NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
        SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

---

## 🧪 Testing Deployment

### 1. Pre-deployment Checklist
- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] Build passes locally
- [ ] All tests pass
- [ ] Security policies configured

### 2. Post-deployment Testing
```bash
# Test API endpoints
curl https://your-domain.com/api/streams
curl https://your-domain.com/api/videos

# Test authentication
curl -X POST https://your-domain.com/api/users \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Test database connection
npm run test:db
```

### 3. Performance Testing
```bash
# Install artillery for load testing
npm install -g artillery

# Create test script
cat > load-test.yml << EOF
config:
  target: 'https://your-domain.com'
  phases:
    - duration: 60
      arrivalRate: 5
scenarios:
  - name: "API Test"
    requests:
      - get:
          url: "/api/streams"
EOF

# Run load test
artillery run load-test.yml
```

---

## 🚨 Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 2. Environment Variable Issues
- Check variable names (case-sensitive)
- Ensure all required variables are set
- Verify Supabase credentials

#### 3. Database Connection Issues
```bash
# Test database connection
npm run test:db

# Check Supabase project status
# Verify RLS policies
```

#### 4. Performance Issues
- Enable Next.js production optimizations
- Use CDN for static assets
- Optimize images
- Implement caching

### Debug Commands
```bash
# Check application status
pm2 status

# View detailed logs
pm2 logs media-platform --lines 100

# Monitor resources
pm2 monit

# Restart application
pm2 restart media-platform
```

---

## 📈 Scaling Considerations

### 1. Horizontal Scaling
- Use load balancers
- Implement session storage
- Use Redis for caching
- Database read replicas

### 2. Vertical Scaling
- Increase server resources
- Optimize database queries
- Implement caching layers
- Use CDN for static assets

### 3. Database Scaling
- Supabase handles database scaling
- Consider read replicas for heavy read workloads
- Implement connection pooling

---

## 🔄 Backup and Recovery

### 1. Database Backups
- Supabase provides automatic backups
- Export data regularly
- Test restore procedures

### 2. Application Backups
- Use version control (Git)
- Backup environment variables
- Document configuration changes

### 3. Disaster Recovery
- Have rollback procedures ready
- Test recovery processes
- Maintain documentation

---

## 📚 Additional Resources

### Documentation
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

### Tools
- [PM2 Process Manager](https://pm2.keymetrics.io/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Docker Documentation](https://docs.docker.com/)

---

*This deployment guide is maintained alongside the codebase. Please update it when making changes to the deployment process.*
