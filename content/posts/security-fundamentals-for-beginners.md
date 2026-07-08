---
title: "Security Fundamentals for Beginners"
date: 2025-09-11
tags: ["Security", "Beginners", "Learning", "Fundamentals"]
description: "Nine foundational security principles that matter more than any tool or framework."
canonicalURL: "https://saurabh-jain.medium.com/security-fundamentals-for-beginners-8a673e6bfe8b"
cover: "https://miro.medium.com/v2/resize:fit:1200/1*_lSj8t4cB6Nko0_3eyic6A.png"
---

> This article was originally published on [Medium](https://saurabh-jain.medium.com/security-fundamentals-for-beginners-8a673e6bfe8b). Read the full version there.

AI won't protect your systems if your foundational security practices are weak. In fact, weak fundamentals make AI-assisted mistakes amplify faster.

Here are nine principles every engineer, startup founder, and security professional should understand before reaching for any tool.

## 1. Least Privilege

**Give users and systems only the access they need — nothing more.**

Think of it like an apartment building: residents get a key to their unit, not to every door in the building.

Applied to tech:
- An intern doesn't need full AWS production access
- A service account for reading logs doesn't need write permissions to the database
- A third-party integration doesn't need admin-level API tokens

Excessive permissions are a force multiplier for mistakes and attacks. One compromised low-privilege account should not be able to take down the entire system.

**In practice:** Audit your IAM roles quarterly. Start from zero permissions and add only what's needed. Use tools like AWS IAM Access Analyzer to find overly permissive policies.

## 2. Defense in Depth

**Don't rely on a single control. Layer your defenses.**

If your only security is a firewall and it gets bypassed, game over. Instead, assume every layer can fail and build accordingly:

- Firewall + WAF + authentication + authorization + audit logging
- Even if an attacker gets past your firewall, they still need credentials
- Even with credentials, their actions are logged and alerted on

## 3. Fail Secure

**When something breaks, it should fail into a safe state.**

A door that jams open when the power goes out fails insecure. A door that jams locked fails secure.

In software:
- An authorization check that throws an exception should default to *deny*, not *allow*
- A network outage shouldn't disable your logging system

## 4. Separation of Duties

**No single person or system should have unchecked power over critical operations.**

Examples:
- The developer who writes code shouldn't be the only one who can deploy it to production
- The person who approves vendor payments shouldn't also be the one who initiates them
- Database admins shouldn't have access to the audit logs that track their own actions

## 5. Security by Design

**Build security in from the start, not bolted on afterward.**

Security added retroactively is always more expensive, less effective, and architecturally awkward. Consider threat models during design, not during the post-breach review.

## 6. Open Design

**Security shouldn't depend on keeping your implementation secret.**

Also called Kerckhoffs's principle: a system should be secure even if everything about it except the key is public knowledge. This is why open-source cryptographic algorithms (AES, RSA) are trusted — they've been scrutinized by thousands of researchers.

"Security through obscurity" as your *only* control is not security.

## 7. Complete Mediation

**Every access to every resource should be checked, every time.**

Don't cache authorization decisions longer than necessary. Don't assume that because a user had permission at login, they still have it 8 hours later.

## 8. Psychological Acceptability

**Security controls that are too hard to use will be bypassed.**

If your VPN is so slow that developers disable it to work, you've created a security theater. Good security design accounts for human behavior. Make the secure path the easy path.

## 9. Minimize Attack Surface

**Every feature, port, service, and API endpoint is a potential entry point.**

- Disable services you don't need
- Close ports that aren't in use
- Remove unused dependencies from your codebase
- Decommission old systems instead of leaving them running "just in case"

The less there is, the less there is to attack.

---

These aren't flashy. There's no ML model or zero-day research here. But every major breach you've read about in the last decade violated at least one of these principles. Start here.
