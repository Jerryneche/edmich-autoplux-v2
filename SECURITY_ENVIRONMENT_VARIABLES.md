# Environment Variables Security Checklist

## Overview
This document ensures that sensitive environment variables are properly configured and never exposed in the repository.

## Required Environment Variables

### Authentication (NextAuth)
```bash
NEXTAUTH_URL=https://www.edmich.com
NEXTAUTH_SECRET=<GENERATE_SECURE_SECRET>
NEXTAUTH_PROVIDERS_GOOGLE_ID=<YOUR_GOOGLE_CLIENT_ID>
NEXTAUTH_PROVIDERS_GOOGLE_SECRET=<YOUR_GOOGLE_CLIENT_SECRET>
NEXTAUTH_PROVIDERS_GITHUB_ID=<YOUR_GITHUB_CLIENT_ID>
NEXTAUTH_PROVIDERS_GITHUB_SECRET=<YOUR_GITHUB_CLIENT_SECRET>
```

**🔐 Generation:**
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Database
```bash
DATABASE_URL=postgresql://user:password@host:5432/edmich_db
DIRECT_URL=postgresql://user:password@host:5432/edmich_db
```

### Payment Processing
```bash
PAYSTACK_PUBLIC_KEY=<YOUR_PAYSTACK_PUBLIC_KEY>
PAYSTACK_SECRET_KEY=<YOUR_PAYSTACK_SECRET_KEY>
PAYSTACK_WEBHOOK_SECRET=<YOUR_PAYSTACK_WEBHOOK_SECRET>
```

### AWS S3 (for file uploads)
```bash
AWS_ACCESS_KEY_ID=<YOUR_AWS_ACCESS_KEY>
AWS_SECRET_ACCESS_KEY=<YOUR_AWS_SECRET_KEY>
AWS_REGION=us-east-1
AWS_S3_BUCKET=edmich-auto-uploads
NEXT_PUBLIC_AWS_S3_BUCKET=edmich-auto-uploads
```

### Cloudinary (for image optimization)
```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<YOUR_CLOUD_NAME>
CLOUDINARY_API_KEY=<YOUR_API_KEY>
CLOUDINARY_API_SECRET=<YOUR_API_SECRET>
```

### Email Service
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<YOUR_EMAIL>
SMTP_PASS=<YOUR_EMAIL_PASSWORD>
SMTP_FROM=noreply@edmich.com
SENDGRID_API_KEY=<YOUR_SENDGRID_API_KEY>
```

### Analytics & Monitoring
```bash
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=<YOUR_META_PIXEL_ID>
SENTRY_AUTH_TOKEN=<YOUR_SENTRY_TOKEN>
SENTRY_ORG=edmich-services
SENTRY_PROJECT=edmich-autoplux
```

### Search & SEO
```bash
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=<YOUR_VERIFICATION_CODE>
NEXT_PUBLIC_YANDEX_VERIFICATION=<YOUR_VERIFICATION_CODE>
```

### Feature Flags (Optional)
```bash
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
NEXT_PUBLIC_API_RATE_LIMIT=100
NEXT_PUBLIC_SESSION_TIMEOUT=3600
```

## Security Best Practices

### ✅ DO:
- [x] Use `.env.local` for local development (never commit)
- [x] Use `.env.production` for production (deployed securely via platform)
- [x] Use strong, random secrets (minimum 32 characters)
- [x] Rotate secrets periodically
- [x] Use environment-specific values
- [x] Store secrets in CI/CD platform (GitHub Secrets, Vercel, etc.)
- [x] Prefix public variables with `NEXT_PUBLIC_`
- [x] Use separate secrets for different environments (dev, staging, prod)
- [x] Document required variables (without values)
- [x] Enable secret scanning in GitHub

### ❌ DON'T:
- [ ] Commit `.env` files to git
- [ ] Use same secrets across environments
- [ ] Share secrets via email or chat
- [ ] Hardcode secrets in code
- [ ] Use weak/simple secrets
- [ ] Expose secrets in error messages
- [ ] Log sensitive values
- [ ] Commit private keys or certificates
- [ ] Use public/demo secrets in production
- [ ] Accidentally commit `.env.production` or `.env.local`

## Git Security

### Update .gitignore
```bash
# Environment variables
.env
.env.local
.env.*.local
.env.production.local
.env.development.local

# Secrets and private keys
*.pem
*.key
*.pub
secrets/
.secrets/
.ssh/

# API Keys and credentials
.credentials
credentials.json
config/secrets.json
```

### GitHub Repository Settings
1. **Enable Secret Scanning**: Settings > Security > Secret Scanning
2. **Enable Push Protection**: Settings > Security > Push Protection
3. **Require Status Checks**: Settings > Branches > Require status checks
4. **Restrict Direct Pushes**: Require PR reviews before merge
5. **Enable Security Alerts**: Settings > Code Security & Analysis

### Check for Exposed Secrets
```bash
# Install git-secrets
brew install git-secrets

# Setup patterns
git secrets --install
git secrets --register-aws

# Scan repository
git secrets --scan
git secrets --scan-history

# Or use TruffleHog
docker run -it trufflesecurity/trufflehog:latest filesystem /path/to/repo
```

## API Security

### Rate Limiting
- IP-based: 100 requests per minute (default)
- User-based: 500 requests per hour
- Auth endpoints: 5 attempts per 15 minutes

### CORS Configuration
- Allowed origins: `https://www.edmich.com`, `https://edmich.com`
- Allowed methods: `GET, POST, PUT, PATCH, DELETE`
- Credentials: Allowed with specific origins only

### API Key Management
- Store API keys in environment variables
- Rotate keys regularly
- Use separate keys per environment
- Implement key expiration
- Log API key usage
- Revoke compromised keys immediately

## Deployment Security

### Vercel Platform
```bash
# Set production environment variables
vercel env add NEXTAUTH_SECRET
vercel env add DATABASE_URL
vercel env add PAYSTACK_SECRET_KEY
# ... add other secrets
```

### Docker Secrets (if self-hosted)
```bash
# Don't pass secrets as environment variables in production
# Instead, use Docker secrets or volume mounts
docker secret create db_password -
docker secret create api_key -
```

## Monitoring & Auditing

### Implement Logging
- Log failed authentication attempts
- Log unauthorized API access
- Log sensitive operations (payments, user data access)
- Don't log passwords or tokens
- Store logs securely with encryption

### Regular Audits
- [ ] Monthly secret rotation
- [ ] Quarterly security reviews
- [ ] Check for exposed credentials
- [ ] Review access logs
- [ ] Audit installed dependencies
- [ ] Update security policies

## Emergency Response

### If a Secret is Exposed:
1. **Immediately revoke** the exposed secret
2. **Generate new** secret
3. **Update all locations** where it's used
4. **Check logs** for unauthorized access
5. **Notify** security team and users if necessary
6. **Document** the incident
7. **Review** how it was exposed

## Testing

### Local Development
```bash
# Copy example env file
cp .env.example .env.local

# Generate secure values
NEXTAUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Verify env vars are loaded
node -e "console.log(process.env.DATABASE_URL)"
```

## Resources
- [OWASP: Secrets Management](https://owasp.org/www-project-secrets-management/)
- [12 Factor App: Config](https://12factor.net/config)
- [NextAuth.js Security](https://next-auth.js.org/getting-started/example)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
