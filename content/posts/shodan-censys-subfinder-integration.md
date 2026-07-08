---
title: "Integrating Shodan and Censys API Keys into Subfinder"
date: 2024-08-23
description: "A step-by-step guide to enhancing Subfinder with Shodan, Censys, and SecurityTrails API keys to dramatically increase subdomain discovery coverage during recon."
tags: ["bug-bounty", "recon", "tools"]
cover: "https://miro.medium.com/v2/resize:fit:802/1*KwYpkZWjMuBjN_bXnbEFMA.png"
canonicalURL: "https://medium.com/bugbountywriteup/integrating-shodan-and-censys-api-keys-into-subfinder-c28452af2efb"
---

Subfinder is a powerful open-source subdomain enumeration tool by Project Discovery. Out of the box it's already useful — but integrating paid API sources from Shodan, Censys, and SecurityTrails multiplies the number of subdomains you discover.

## Why API Integration Matters

Subfinder without API keys hits only a handful of free passive sources. With API keys configured it can query:
- Certificate transparency logs
- Shodan's internet-wide scan data
- Censys's indexed TLS certificates
- SecurityTrails' historical DNS data
- And 30+ other sources

The difference in coverage is significant for serious bug bounty work.

## Install Subfinder

```bash
go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest
```

Or download a binary from [GitHub releases](https://github.com/projectdiscovery/subfinder).

## Getting API Keys

### Censys

1. Create a free account at [censys.io](https://search.censys.io/)
2. Go to **Account → API** at `https://search.censys.io/account/api`
3. Copy your **API ID** and **Secret**

Free tier: 250 queries/month.

### Shodan

1. Create an account at [shodan.io](https://www.shodan.io/)
2. Go to **Account Overview** at `https://account.shodan.io/`
3. Copy your **API Key**

Free tier: limited queries. Membership (~$5/month lifetime) is worth it for bug bounty.

### SecurityTrails

1. Create an account at [securitytrails.com](https://securitytrails.com/)
2. Go to **Account → API** and generate a key

Free tier: 50 API calls/month.

## Configuring Subfinder

The config file lives at `~/.config/subfinder/provider-config.yaml`. Create or edit it:

```bash
mkdir -p ~/.config/subfinder
nano ~/.config/subfinder/provider-config.yaml
```

Add your keys:

```yaml
censys:
  - your_censys_api_id:your_censys_secret

shodan:
  - your_shodan_api_key

securitytrails:
  - your_securitytrails_api_key
```

The format for Censys is `API_ID:SECRET` as a single string.

## Running Subfinder

```bash
# Basic enumeration
subfinder -d target.com -o subdomains.txt

# With verbose output to see which sources return results
subfinder -d target.com -v -o subdomains.txt

# Multiple targets
subfinder -dL domains.txt -o subdomains.txt

# Increase threads for speed
subfinder -d target.com -t 100 -o subdomains.txt
```

## Verifying API Integration

Run with `-v` (verbose) and look for lines like:
```
[censys] Found: api.target.com
[shodan] Found: staging.target.com
[securitytrails] Found: old.target.com
```

If an API source isn't triggering, double-check the key format in `provider-config.yaml`.

## Combining with Other Tools

Subfinder output feeds well into the rest of your recon pipeline:

```bash
# Enumerate → resolve → probe for live hosts
subfinder -d target.com -silent | \
  dnsx -silent | \
  httpx -silent -o live_hosts.txt
```

## Tips

- **Run subfinder early** — passive recon has no impact on the target and can run before you're even sure you're in scope
- **Check `all` sources** — use `-all` flag to hit every configured source, not just the default ones
- **Combine with amass** — `amass enum` and subfinder overlap but each finds unique results; merge and dedup

---

*Subfinder GitHub: [github.com/projectdiscovery/subfinder](https://github.com/projectdiscovery/subfinder)*
