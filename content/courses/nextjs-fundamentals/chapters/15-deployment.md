# Chapter 15: Deployment

## Overview

Next.js applications can be deployed to various platforms. This chapter covers deploying to Vercel (the creators of Next.js), self-hosting with Node.js, Docker containers, and static exports.

## Deployment Options

| Option | Best For | Features |
|--------|----------|----------|
| **Vercel** | Most projects | Zero config, edge functions, analytics |
| **Node.js Server** | Custom infrastructure | Full control, any hosting |
| **Docker** | Container orchestration | Kubernetes, consistency |
| **Static Export** | Static sites | Any static host, CDN |

## Deploying to Vercel

### From GitHub

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Configure environment variables
5. Deploy

That's it. Vercel auto-detects Next.js and configures everything.

### Vercel CLI

```bash
# Install CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Environment Variables

Set in Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret
NEXT_PUBLIC_API_URL=https://api.example.com
```

### vercel.json Configuration

```json
{
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

## Self-Hosting with Node.js

### Build and Start

```bash
# Build
npm run build

# Start production server
npm start
```

### PM2 Process Manager

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start npm --name "nextjs" -- start

# Auto-restart on reboot
pm2 startup
pm2 save
```

### ecosystem.config.cjs

```js
// ecosystem.config.cjs (CommonJS for PM2)
module.exports = {
  apps: [{
    name: 'nextjs',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
  }],
};
```

```bash
pm2 start ecosystem.config.cjs
```

### Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/nextjs
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d example.com

# Auto-renewal is configured automatically
```

## Docker Deployment

### Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### next.config.ts for Standalone

```ts
// next.config.ts
import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'standalone',
};

export default config;
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  nextjs:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/mydb
      - NEXTAUTH_SECRET=your-secret
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f nextjs
```

## Static Export

For fully static sites without server-side features:

```ts
// next.config.ts
import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'export',
};

export default config;
```

```bash
npm run build
# Outputs to /out directory
```

### Limitations

Static export doesn't support:
- Server Components with dynamic data
- API Routes
- Middleware
- Image Optimization (use external loader)
- ISR/Revalidation

### Deploy to Static Hosts

```bash
# Netlify
netlify deploy --prod --dir=out

# GitHub Pages
# Add to .github/workflows/deploy.yml

# AWS S3
aws s3 sync out/ s3://your-bucket --delete
```

## Environment Variables

### Build-time vs Runtime

```bash
# Build-time only (baked into bundle)
NEXT_PUBLIC_API_URL=https://api.example.com

# Runtime (available in Node.js)
DATABASE_URL=postgresql://...
API_SECRET=secret123
```

### .env Files

```
.env                # All environments
.env.local          # Local overrides (git ignored)
.env.development    # Development
.env.production     # Production
```

### Validation

```ts
// lib/env.ts
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Production Checklist

### Before Deploying

- [ ] Run `npm run build` locally and fix any errors
- [ ] Test all environment variables
- [ ] Run tests: `npm test`
- [ ] Check for console errors/warnings
- [ ] Verify all API endpoints work
- [ ] Test authentication flows

### Performance

- [ ] Analyze bundle size: `ANALYZE=true npm run build`
- [ ] Optimize images with `next/image`
- [ ] Enable compression in hosting
- [ ] Configure caching headers

### Security

- [ ] Set secure cookie options
- [ ] Configure CORS if needed
- [ ] Add security headers
- [ ] Use HTTPS
- [ ] Validate environment variables

### Monitoring

- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure analytics
- [ ] Set up uptime monitoring
- [ ] Enable logging

## Key Takeaways

- Vercel provides zero-config deployment for Next.js
- Self-hosting requires Node.js server with PM2 or similar
- Docker enables consistent deployments and scaling
- Static export works for sites without dynamic server features
- Always separate build-time and runtime environment variables
- Set up CI/CD for automated deployments

## Questions & Answers

### Q: Which deployment option should I choose?
**A:** Vercel for most projects. Self-host if you need full control or have compliance requirements. Docker for Kubernetes/container orchestration.

### Q: Do I need a server for Next.js?
**A:** For full features, yes. For static sites, you can use static export and deploy to any CDN.

### Q: How do I handle database migrations in production?
**A:** Run migrations as part of your CI/CD pipeline before deploying the new version, or use a separate migration job.

## Resources

- [Next.js: Deploying](https://nextjs.org/docs/app/building-your-application/deploying)
- [Vercel Documentation](https://vercel.com/docs)
- [Docker Documentation](https://docs.docker.com)

