---
title: "Security Engineer Interview Questions Part-6"
date: 2025-03-08
description: "Part 6 of the series covering security engineer interview questions, including AWS IMDSv2 security enhancements and why CORS alone cannot prevent CSRF attacks."
tags: ["security", "aws", "interview"]
cover: "https://miro.medium.com/v2/resize:fit:984/0*q8zdfXehtyNZL3CU.png"
canonicalURL: "https://saurabh-jain.medium.com/security-engineer-interview-questions-part-6-582ff4c747ef"
---

## Question 1: AWS IMDSv2 Security Enhancements

The Instance MetaData Service (IMDS) provides EC2 instances with metadata including IAM credentials and network information. IMDSv2 introduces several improvements over v1.

### IMDSv1 vs IMDSv2

**IMDSv1 (insecure):**
```bash
# Anyone who can make HTTP requests from the instance can access credentials
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/
```

The problem: if an application running on EC2 has an SSRF vulnerability, an attacker can use it to steal IAM credentials — no auth required.

**IMDSv2 (session-based):**
```bash
# Step 1: Get a session token (requires PUT method + TTL header)
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

# Step 2: Use the token for all subsequent requests
curl -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/iam/security-credentials/
```

### Why IMDSv2 defeats SSRF attacks

- Requires HTTP `PUT` for the initial token request — most SSRF vulnerabilities only control `GET`
- The TTL header (`X-aws-ec2-metadata-token-ttl-seconds`) must be present
- Tokens are short-lived and tied to the session
- Most SSRF payloads can't easily issue `PUT` requests with custom headers

### Enforcing IMDSv2

```bash
# Disable IMDSv1 on an existing instance
aws ec2 modify-instance-metadata-options \
  --instance-id i-1234567890abcdef0 \
  --http-tokens required \
  --http-endpoint enabled
```

---

## Question 2: Why CORS Cannot Prevent CSRF

This is a common misconception in interviews. Candidates often say "we have CORS configured, so CSRF isn't a concern." This is **wrong**.

### What CORS does

CORS restricts which origins can **read** cross-origin responses. It doesn't prevent cross-origin requests from being **made**.

### How CSRF bypasses CORS

CSRF exploits the browser's automatic inclusion of cookies on every request to a domain. The attack flow:

1. Victim is logged into `bank.com` (session cookie set)
2. Victim visits `evil.com`
3. `evil.com` makes a form POST to `bank.com/transfer`
4. Browser automatically includes session cookie
5. `bank.com` processes the request as authenticated

CORS never enters the picture because the *response* is never read — the damage is done by the *request* being sent.

### Proper CSRF mitigations

- **Synchroniser Token Pattern:** Include a secret CSRF token in every state-changing form; validate server-side
- **SameSite cookies:** Set `SameSite=Strict` or `SameSite=Lax` to prevent cookies being sent on cross-site requests
- **Double submit cookie:** Send CSRF token both in cookie and request body; verify they match
- **Custom request headers:** APIs that require custom headers (like `X-Requested-With`) get CORS preflight protection

---

*Part of a series on real security engineer interview questions from major tech companies.*
