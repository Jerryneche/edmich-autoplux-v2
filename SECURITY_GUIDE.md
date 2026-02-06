# Website Security & Hacker Prevention Guide

## Executive Summary
This guide provides comprehensive security measures to protect EDMICH AutoPlux from hackers and ensure compliance with security best practices.

## Table of Contents
1. [Repository Security](#repository-security)
2. [Code Security](#code-security)
3. [API Security](#api-security)
4. [Authentication & Authorization](#authentication--authorization)
5. [Data Protection](#data-protection)
6. [Network Security](#network-security)
7. [Deployment Security](#deployment-security)
8. [Monitoring & Detection](#monitoring--detection)
9. [Incident Response](#incident-response)
10. [Compliance](#compliance)

---

## Repository Security

### GitHub Repository Configuration

#### 1. Repository Settings
```bash
# Enable branch protection
Settings > Branches > Add branch rule
  - Require a pull request before merging ✓
  - Require status checks to pass ✓
  - Require conversation resolution before merging ✓
  - Include administrators ✓
```

#### 2. Secret Scanning
- **Enable Secret Scanning**: Settings > Security > Secret Scanning > On
- **Push Protection**: Settings > Security > Push Protection > Enable
- **GitHub Advanced Security**: Subscribe to GitHub Enterprise for SAST

#### 3. Code Review Requirements
- Require at least 2 reviewers for main branch
- Dismiss stale pull request approvals
- Require updated branches before merge
- Block auto-merge

#### 4. Dependency Management
```bash
# Enable Dependabot
Settings > Code security & analysis > Enable Dependabot alerts
Settings > Code security & analysis > Enable Dependabot security updates

# Pin dependencies to specific versions in package.json
# Don't use wildcard versions (e.g., ^1.0.0)
```

---

## Code Security

### OWASP Top 10 Protection

#### 1. Broken Access Control
✅ **Implemented in this project:**
```typescript
// middleware.ts - Role-based access control
if (token?.role !== "SUPPLIER") {
  return NextResponse.redirect("/unauthorized");
}

// API validation
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

#### 2. Cryptographic Failures
```typescript
// Always use HTTPS
- ✓ Redirect HTTP to HTTPS via next.config.js headers
- ✓ Use Strict-Transport-Security header
- ✓ Don't transmit sensitive data in URLs
```

#### 3. Injection (XSS, SQL, Command)
```typescript
// lib/security.ts - Input sanitization
import { sanitizeString, sanitizeEmail, validateRequestBody } from '@/lib/security';

// Usage in API routes:
const validated = validateRequestBody(req.body, ['email', 'name', 'phone']);
const email = sanitizeEmail(body.email);
const phone = validatePhoneNumber(body.phone);
```

#### 4. Insecure Design
- ✓ Input validation middleware implemented
- ✓ Rate limiting configured
- ✓ CORS restrictions set
- ✓ Security headers enforced
- ✓ Session management via NextAuth

#### 5. Security Misconfiguration
```typescript
// next.config.js - Security headers
{
  key: "Content-Security-Policy",
  value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://..."
}
```

#### 6. Vulnerable Components
```bash
# Regular dependency updates
npm audit fix
npm update --save

# Use Dependabot for automated updates
# Review and merge security updates immediately
```

#### 7. Authentication Failures
- ✓ NextAuth.js for secure authentication
- ✓ Session tokens encrypted
- ✓ CSRF protection built-in
- ✓ Password requirements enforced
- ✓ Email verification required

#### 8. Software & Data Integrity
```bash
# Verify package integrity
npm ci # instead of npm install in production
npm audit
npm audit --production
```

#### 9. Logging & Monitoring
```typescript
// lib/api-security.ts
export function logSecurityEvent(type: string, details: Record<string, any>) {
  console.warn(`[SECURITY] ${type}:`, details);
  // Send to Sentry/logging service
}
```

#### 10. Server-Side Request Forgery (SSRF)
```typescript
// Validate all external URLs
import { sanitizeUrl } from '@/lib/security';
const validatedUrl = sanitizeUrl(userProvidedUrl);
if (!validatedUrl) {
  throw new Error('Invalid URL');
}
```

---

## API Security

### Rate Limiting
```typescript
// lib/api-security.ts - Already implemented
export function withRateLimit(handler, {
  windowMs: 60 * 1000,        // 1 minute
  maxRequests: 100              // 100 requests
})
```

### CORS Configuration
```typescript
// Only allow requests from edmich.com
export function withCORS(handler, {
  allowedOrigins: [
    "https://www.edmich.com",
    "https://edmich.com"
  ],
  credentials: true
})
```

### API Endpoint Security Checklist
- [ ] Validate all input parameters
- [ ] Check authentication/authorization
- [ ] Implement rate limiting
- [ ] Use HTTPS only
- [ ] Return minimal error information
- [ ] Log access attempts
- [ ] Implement request signing (if needed)
- [ ] Use API keys (not in URL)
- [ ] Implement API versioning

### Example Secure API Route
```typescript
// app/api/supplier/settings/route.ts
import { withRateLimit, withSecurityHeaders } from '@/lib/api-security';
import { validateRequestBody } from '@/lib/security';

export const PATCH = withSecurityHeaders(
  withRateLimit(async (req: NextRequest) => {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const validated = validateRequestBody(req.body, [
      'businessName', 'description', 'city', 'state'
    ]);
    
    // Process validated data...
  })
);
```

---

## Authentication & Authorization

### NextAuth Configuration
```typescript
// lib/auth.ts - Ensure these are configured:
- ✓ Callback URLs properly restricted
- ✓ JWT strategy with encryption
- ✓ Session callbacks validate user
- ✓ Credentials encrypted in database
- ✓ Sessions expire appropriately
```

### Password Security
- Minimum 8 characters
- Require mix of uppercase, lowercase, numbers, special chars
- Hash with bcrypt (minimum 12 rounds)
- Never log passwords
- Implement password reset securely

### Multi-Factor Authentication (Recommended)
```typescript
// Future enhancement: Add TOTP/2FA
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

// Generate 2FA secret
const secret = speakeasy.generateSecret({
  name: 'EDMICH AutoPlux',
  issuer: 'EDMICH',
  length: 32
});

// Generate QR code for user
const qrCode = await QRCode.toDataURL(secret.otpauth_url);
```

---

## Data Protection

### Database Security
```typescript
// Prisma best practices
- ✓ Use connection pooling (Prisma connection limits)
- ✓ Encrypt sensitive fields
- ✓ Regular backups (daily minimum)
- ✓ Backup encryption
- ✓ Test restore procedures
- ✓ Use parameterized queries (Prisma handles this)
```

### Sensitive Data Encryption
```typescript
// Use encryption for PII
import crypto from 'crypto';

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

export function encryptField(data: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptField(encrypted: string): string {
  const [ivHex, authTagHex, data] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

### Data Retention
```typescript
// Implement data retention policies
- Store minimum required data
- Delete old logs after 90 days
- Delete inactive user data after 1 year
- Archive sensitive backup data
- GDPR compliance for EU users
```

### PII Protection
- Don't log passwords, tokens, SSNs
- Don't send sensitive data in emails
- Mask PII in error messages
- Use encryption for transit and storage
- Implement data access controls

---

## Network Security

### HTTPS/TLS
✅ **Configured in next.config.js:**
```typescript
// Strict-Transport-Security header
{
  key: "Strict-Transport-Security",
  value: "max-age=31536000; includeSubDomains"
}

// Redirects all HTTP to HTTPS
async redirects() {
  return [{
    source: "/:path*",
    has: [{ type: "header", key: "x-forwarded-proto", value: "http" }],
    destination: "https://:host/:path*",
    permanent: true
  }]
}
```

### Content Security Policy (CSP)
```typescript
// next.config.js - Already configured
{
  key: "Content-Security-Policy",
  value: "default-src 'self'; script-src 'self' https://..."
}
```

### CORS Configuration
```typescript
// Only allow requests from edmich.com origins
const allowedOrigins = [
  "https://www.edmich.com",
  "https://edmich.com"
];
```

### DNS Security
- Enable DNSSEC for domain
- Monitor DNS records for unauthorized changes
- Use secure DNS provider (Cloudflare, AWS Route53)
- Set up domain transfer lock

---

## Deployment Security

### Production Environment
```bash
# Environment variables
All secrets stored in platform (Vercel, AWS, etc.)
Database connection strings restricted by IP
API keys rotated regularly

# Deployment process
1. Code review (2+ approvals)
2. Automated tests pass
3. Security scanning passes
4. Manual security check
5. Deploy to staging first
6. Final approval before production
```

### Vercel Deployment
```bash
# Secure deployment configuration
1. Enable "Require approval for production"
2. Set environment variables in Vercel dashboard
3. Enable branch protection rules
4. Use preview deployments for testing
5. Monitor deployment logs for errors
```

### Docker (if self-hosted)
```dockerfile
# Use specific base image versions
FROM node:20-alpine

# Don't run as root
USER node

# Use secrets from Docker secrets/env, not in Dockerfile
# Copy only necessary files
COPY --chown=node:node . .

# Security scanning
# RUN npm audit && npm audit fix
```

---

## Monitoring & Detection

### Application Monitoring
```typescript
// Sentry integration (already configured)
import * as Sentry from "@sentry/nextjs";

// Log security events
Sentry.captureException(new Error("Unauthorized access attempt"), {
  level: "warning",
  tags: { category: "security" }
});
```

### Failed Login Monitoring
```typescript
// Track failed attempts
const failedLogins = await redis.incr(`failed_login:${email}`);

if (failedLogins > 5) {
  // Block account temporarily
  await redis.setex(`locked:${email}`, 3600, "1");
  
  // Alert security team
  Sentry.captureMessage(`Account locked: ${email}`, "warning");
}
```

### Real-time Alerts
```
1. Failed login attempts (>5 in 15 min)
2. Unusual API activity (spike in requests)
3. Database errors (potential breach)
4. Secret exposure detection
5. Certificate expiration warnings
```

### Log Monitoring
```bash
# Collect logs centrally
- Failed authentication attempts
- Unauthorized API calls
- Database errors
- Rate limit violations
- Security header violations

# Retention: 90 days minimum
# Search logs for patterns: SQL injection, XSS attempts, brute force
```

---

## Incident Response

### Incident Response Plan
1. **Detect**: Monitor alerts, user reports
2. **Respond**: Isolate affected systems
3. **Investigate**: Determine scope and impact
4. **Contain**: Stop ongoing attack
5. **Eradicate**: Remove attacker access
6. **Recover**: Restore systems
7. **Analyze**: Post-mortem analysis
8. **Improve**: Update security measures

### Communication Plan
- **Level 1 (Low)**: Internal team notification
- **Level 2 (Medium)**: Manager notification + investigation
- **Level 3 (High)**: Legal + user notification within 72 hours
- **Level 4 (Critical)**: All of above + press statement

### Breach Response
```
If user data is compromised:
1. Stop the leak immediately
2. Document everything
3. Notify affected users within 72 hours
4. Notify regulatory bodies if required (GDPR, CCPA, etc.)
5. Provide credit monitoring (if financial data)
6. Law enforcement notification if criminal activity
```

---

## Compliance

### Security Standards
- [ ] OWASP Top 10 protection
- [ ] CWE/SANS Top 25 mitigation
- [ ] GDPR compliance (user data protection)
- [ ] CCPA compliance (California users)
- [ ] PCI DSS compliance (if handling cards)

### Regular Audits
```bash
# Monthly
- npm audit
- dependency updates
- secret rotation

# Quarterly
- penetration testing
- code review
- access review

# Annually
- third-party security assessment
- disaster recovery testing
- policy review
```

### Security Policies
- [ ] Password policy documented
- [ ] Data retention policy created
- [ ] Incident response plan written
- [ ] Access control policy defined
- [ ] Code review guidelines documented
- [ ] Deployment procedures documented

---

## Security Checklist

### Pre-Deployment
- [ ] All secrets in environment variables
- [ ] No hardcoded API keys
- [ ] No credentials in git history
- [ ] All dependencies updated
- [ ] npm audit passes
- [ ] Security tests pass
- [ ] Manual security review done
- [ ] HTTPS enabled
- [ ] CSP headers configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] Authentication required for protected routes
- [ ] CORS configured
- [ ] Error messages don't leak info

### Post-Deployment
- [ ] Monitor error logs
- [ ] Monitor security logs
- [ ] Check uptime monitoring alerts
- [ ] Verify HTTPS working
- [ ] Test authentication flow
- [ ] Verify backups running
- [ ] Check DNS resolution
- [ ] Monitor API response times

### Ongoing
- [ ] Daily security alerts review
- [ ] Weekly dependency check
- [ ] Monthly penetration testing
- [ ] Quarterly security assessment
- [ ] Annual third-party audit

---

## Resources

### Security Tools
- [npm audit](https://docs.npmjs.com/cli/v10/commands/npm-audit)
- [Snyk](https://snyk.io) - Dependency scanning
- [SonarQube](https://www.sonarqube.org) - Code quality
- [OWASP ZAP](https://www.zaproxy.org) - Penetration testing
- [Burp Suite](https://portswigger.net/burp) - Web testing

### Frameworks & Libraries
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [ISO 27001](https://www.iso.org/isoiec-27001-information-security-management.html)

### Learning Resources
- [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [PortSwigger Web Security Academy](https://portswigger.net/web-security)
- [WebGoat by OWASP](https://owasp.org/www-project-webgoat/)

### Emergency Contacts
- Security Team: security@edmich.com
- Incident Hotline: [Add phone number]
- Legal Team: [Add contact]

---

## Document History
- **Version 1.0** - February 6, 2026 - Initial security guide created
- **Last Updated** - February 6, 2026

**Reviewed By**: Security Team  
**Next Review Date**: 3 months from creation

---

## Acknowledgments
This security guide emphasizes industry best practices and is based on:
- OWASP Security Standards
- CWE/SANS Programming Errors
- NIST Cybersecurity Framework
