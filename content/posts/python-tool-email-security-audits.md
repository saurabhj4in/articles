---
title: "Built a Python Tool to Automate Email Security Audits"
date: 2025-09-22
tags: ["Python", "Email Security", "Tools", "Automation", "DNS"]
description: "Automating SPF, DKIM, DMARC, and MTA-STS checks with a simple Python script."
canonicalURL: "https://python.plainenglish.io/built-a-python-tool-to-automate-email-security-audits-c639d2affe88"
cover: "https://miro.medium.com/v2/resize:fit:1200/1*a7JuQQDQyEc7klaR-11byA.png"
---

> This article was originally published on [Medium / Plain English](https://python.plainenglish.io/built-a-python-tool-to-automate-email-security-audits-c639d2affe88). Read the full version there.

Email security is one of those areas everyone knows is important and almost nobody audits regularly. SPF, DKIM, DMARC, MTA-STS — each has its own DNS record format, its own failure mode, and its own way of silently misconfiguring itself over months.

I got tired of checking these manually. So I built a Python tool to do it automatically.

## What the Tool Checks

- **SPF** — Is there a valid SPF record? Does it have too many DNS lookups (the 10-lookup limit is a common gotcha)? Is it set to `~all` (softfail) instead of `-all` (hardfail)?
- **DKIM** — Are common DKIM selectors present (`default`, `google`, `mail`, `selector1`, `selector2`)? Is the key length adequate?
- **DMARC** — Is there a DMARC record? What's the policy (`none` / `quarantine` / `reject`)? Where do reports go?
- **MTA-STS** — Is there an MTA-STS policy enforcing TLS for inbound mail?
- **BIMI** — Bonus check: is there a BIMI record for brand-verified logos in email clients?

## Core Logic

```python
import dns.resolver
import requests

def check_spf(domain):
    try:
        answers = dns.resolver.resolve(domain, 'TXT')
        for rdata in answers:
            txt = rdata.to_text().strip('"')
            if txt.startswith('v=spf1'):
                return {"found": True, "record": txt}
        return {"found": False}
    except Exception as e:
        return {"found": False, "error": str(e)}

def check_dmarc(domain):
    dmarc_domain = f"_dmarc.{domain}"
    try:
        answers = dns.resolver.resolve(dmarc_domain, 'TXT')
        for rdata in answers:
            txt = rdata.to_text().strip('"')
            if txt.startswith('v=DMARC1'):
                return {"found": True, "record": txt}
        return {"found": False}
    except Exception as e:
        return {"found": False, "error": str(e)}
```

## Running an Audit

```bash
python email_audit.py --domain example.com --output report.json
```

Sample output:

```json
{
  "domain": "example.com",
  "spf": {
    "found": true,
    "record": "v=spf1 include:_spf.google.com ~all",
    "issues": ["Softfail (~all) allows spoofing to land in spam, not be rejected"]
  },
  "dmarc": {
    "found": true,
    "policy": "none",
    "issues": ["Policy is 'none' — emails failing DMARC are not rejected or quarantined"]
  },
  "dkim": {
    "selectors_found": ["google"],
    "issues": []
  }
}
```

## Common Findings

| Issue | Risk | Fix |
|-------|------|-----|
| SPF `~all` instead of `-all` | Spoofed mail lands in spam, not blocked | Change to `-all` |
| DMARC `p=none` | No enforcement; reports only | Gradually move to `quarantine` then `reject` |
| No DMARC record | Full spoofing possible | Add `_dmarc.domain.com TXT "v=DMARC1; p=reject; rua=mailto:dmarc@domain.com"` |
| DKIM missing | Emails can be modified in transit | Configure DKIM in your mail provider |

The tool is useful for quickly auditing a list of client domains or running periodic checks in CI to catch regressions when DNS changes go out.
