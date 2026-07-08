---
title: "20+ Vulnerabilities in a Static Website"
date: 2025-11-18
tags: ["Bug Bounty", "Security Testing", "Recon", "Web Security"]
description: "No database, no backend, no APIs — still 20+ findings. Here's the bug bounty cheat sheet for static sites."
canonicalURL: "https://saurabh-jain.medium.com/20-vulnerabilities-in-a-static-website-2f32a4902377"
cover: "https://miro.medium.com/v2/resize:fit:1200/1*jJ5-6zmfCDldKx5g1gj-Jg.png"
---

> This article was originally published on [Medium](https://saurabh-jain.medium.com/20-vulnerabilities-in-a-static-website-2f32a4902377). Read the full version there.

Static websites look boring to attack. No database. No backend. No APIs. No login form.

Turns out, there's still plenty to find.

## Phase 1: Reconnaissance & Information Disclosure

Collect intelligence and uncover unintentionally exposed sensitive information before touching anything else.

### 1. Directory & File Busting

Deploy scanning tools like Gobuster or Dirsearch to locate hidden and configuration files.

```bash
gobuster dir -u https://target.com -w /usr/share/wordlists/dirb/common.txt
```

**Check for:**
- `/robots.txt`
- `/sitemap.xml`
- `/security.txt`
- `.env`
- `.git/`
- `.DS_Store` (macOS artifacts)
- `.vscode/` and `.idea/` (editor configs)

**Example:** Accessing `example.com/.git/config` might reveal repository URLs, branch names, or credentials.

### 2. Directory Listing

Verify whether the web server permits file enumeration in directories without index files.

**Target paths:** `/assets/`, `/uploads/`, `/js/`, `/images/`

If directory listing is on, you can browse the file tree directly.

### 3. Source Code Leakage in JS Bundles

Modern static sites bundle everything into JS. That bundle often contains:

- API keys (Google Maps, Stripe, Firebase)
- Internal endpoint URLs
- Hardcoded credentials for dev environments
- Feature flags revealing unreleased functionality

```bash
# Download all JS files and grep them
wget -r -A "*.js" https://target.com
grep -r "api_key\|apiKey\|secret\|password\|token" ./
```

### 4. Exposed .git Directory

```bash
curl https://target.com/.git/HEAD
```

If you get `ref: refs/heads/main` back, the git directory is exposed. Tools like `git-dumper` can reconstruct the entire repository.

### 5. Subdomain Enumeration

```bash
subfinder -d target.com | httpx -silent
```

Static sites often have staging, dev, or preview subdomains with:
- Relaxed security headers
- Debug information enabled
- Different (weaker) access controls

## Phase 2: Client-Side Vulnerabilities

### 6. Cross-Site Scripting (XSS) via URL Parameters

Even without a backend, query parameters are often reflected in the DOM via JavaScript.

```
https://target.com/search?q=<script>alert(1)</script>
```

Check `document.location`, `document.URL`, `window.location.hash` — all are common sources of DOM-based XSS.

### 7. Open Redirect

```
https://target.com/?redirect=https://evil.com
```

If the site redirects after a form submission or OAuth flow, test whether the `redirect` parameter is validated.

### 8. Clickjacking

Check if the site sets `X-Frame-Options` or `Content-Security-Policy: frame-ancestors`.

```bash
curl -I https://target.com | grep -i "x-frame\|content-security"
```

If missing, the site can be embedded in an iframe for UI redress attacks.

## Phase 3: Third-Party Integrations

### 9. Exposed API Keys in Network Requests

Open DevTools → Network tab → filter by XHR. Look at request headers and bodies for:

- Firebase API keys
- Google Analytics write keys
- CDN signed URLs with long expiry

### 10. Misconfigured CORS

```bash
curl -H "Origin: https://evil.com" -I https://target.com/api/data
```

If the response contains `Access-Control-Allow-Origin: https://evil.com`, that's a finding.

## Phase 4: Infrastructure & Hosting

### 11. Subdomain Takeover

Static sites are often hosted on services like GitHub Pages, Netlify, Vercel, or S3. If a CNAME points to a deprovisioned service, the subdomain can be claimed.

```bash
# Check CNAME target
dig CNAME staging.target.com

# If it points to something like foo.github.io and that page doesn't exist:
# Create a GitHub repo matching the username/repo pattern and claim it
```

### 12. S3 Bucket Misconfiguration

```bash
aws s3 ls s3://target-assets --no-sign-request
```

Public-read buckets leak files. Public-write buckets allow defacement.

### 13. Missing Security Headers

Run the site through [securityheaders.com](https://securityheaders.com) and look for missing:

- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`

Each missing header is a valid (if low-severity) finding on most programs.

---

The lesson: "static" doesn't mean "safe." It just means the attack surface moved — from your server to your JS bundles, your CDN config, and your third-party integrations.
