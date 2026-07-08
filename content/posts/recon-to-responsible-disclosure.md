---
title: "Recon to Responsible Disclosure"
date: 2025-09-01
tags: ["Bug Bounty", "Recon", "Responsible Disclosure", "Security Research"]
description: "From rejected duplicates and out-of-scope reports to a methodical recon process that actually works."
canonicalURL: "https://saurabh-jain.medium.com/recon-to-responsible-disclosure-ee3d308a3b69"
cover: "https://miro.medium.com/v2/resize:fit:800/1*BEcWVBu_Zb-HGnDm01YM-w.png"
---

> This article was originally published on [Medium](https://saurabh-jain.medium.com/recon-to-responsible-disclosure-ee3d308a3b69). Read the full version there.

## The Bug Bounty Dream

Every security engineer's side quest: find a critical vulnerability, write a sharp report, collect a payout, repeat.

The reality of the first few months:

- **Duplicate** — someone found it before you
- **Out of scope** — you tested the wrong asset
- **Not applicable** — the issue you found isn't considered a vulnerability on this program
- **Spam** — you moved too fast and your report was vague

Zero triaged bugs. Confidence in the floor.

## Why Most Beginners Fail Early

The mistake isn't technical — it's process. Most beginners jump straight to exploitation before understanding the target. They test the obvious login page, get nothing, move on. That's not bug hunting; that's hoping.

Real bug bounty work is 70% recon, 20% analysis, 10% exploitation and reporting.

## Recon Mode: A Methodical Approach

### Step 1: Understand the Scope

Before touching anything, read the program's scope document carefully.

- What domains are in scope?
- What vulnerability types are accepted?
- What's explicitly excluded (e.g., rate limiting, self-XSS, social engineering)?

Wasted effort on out-of-scope assets is the most common beginner mistake.

### Step 2: Asset Discovery

```bash
# Enumerate subdomains
subfinder -d target.com -o subdomains.txt
amass enum -d target.com >> subdomains.txt

# Probe for live hosts
cat subdomains.txt | httpx -silent -status-code -title -o live.txt

# Find interesting endpoints
cat live.txt | waybackurls | grep -E "\.(json|xml|env|config|bak)"
```

### Step 3: Fingerprinting

Understand the tech stack before looking for vulnerabilities.

```bash
# Technology fingerprinting
whatweb https://target.com

# Check response headers for server info
curl -I https://target.com

# JavaScript analysis
cat *.js | grep -E "api[_-]?key|token|secret|password|endpoint"
```

### Step 4: Finding the Interesting Stuff

Look for:
- **Forgotten subdomains** — `dev.target.com`, `staging.target.com`, `admin-old.target.com`
- **Exposed admin panels** — these often have weaker auth
- **API endpoints not linked in the UI** — check JS files and browser network logs
- **Parameter pollution** — try adding unexpected parameters to known endpoints

### Step 5: Writing a Good Report

A good report is half the battle. Include:

1. **Title** — one sentence, specific (e.g., "Stored XSS in profile bio field allows session hijacking")
2. **Severity** — with justification (CVSS score helps)
3. **Steps to reproduce** — numbered, precise, reproducible by someone who has never used your setup
4. **Impact** — what can an attacker actually do?
5. **Proof of concept** — screenshot, video, or curl command
6. **Suggested fix** — optional but appreciated

### Step 6: Responsible Disclosure

- Report to the program's official channel only
- Don't share the vulnerability publicly until it's fixed
- Give the team reasonable time to respond (most programs SLA 90 days)
- Follow up once if you don't hear back in 2 weeks

## The Mindset Shift

Bug bounty isn't a slot machine. It rewards systematic thinking, patience, and good reporting over luck and speed.

The hunters who consistently find issues aren't smarter — they're more methodical. They build recon pipelines, keep notes, and understand their targets deeply before they start probing.

Start with recon. The bugs will follow.
