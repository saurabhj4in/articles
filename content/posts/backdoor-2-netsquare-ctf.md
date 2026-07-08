---
title: "BackDoor 2: NET-SQUARE Hacking Warm-Up Mobile Application Challenge"
date: 2021-06-09
description: "Walkthrough of BackDoor 2 from NET-SQUARE's CTF series — credentials are encoded rather than plaintext, requiring a deeper static analysis to locate and decode them."
tags: ["android", "ctf", "reverse-engineering"]
cover: "https://miro.medium.com/v2/resize:fit:660/1*qMud2KYa809O8CPsOY-Fpg.png"
canonicalURL: "https://medium.com/bugbountywriteup/backdoor-2-walkthrough-of-net-square-hacking-warm-up-mobile-application-challenge-5eefe49dba6b"
---

BackDoor 2 raises the difficulty from BackDoor 1. The credentials are no longer stored in plaintext — they're encoded, requiring you to identify the encoding scheme and reverse it.

> Try the challenge yourself first: find the APK in NET-SQUARE's GitHub repository.

## Tools Required

| Tool | Purpose |
|------|---------|
| **adb** | Communicate with device/emulator |
| **apktool** | Decompile APK to smali + resources |
| **jadx-gui** | Decompile to readable Java source |
| **CyberChef** | Decode encoded strings |
| **Android Studio** | Emulator |

## Setup

```bash
adb devices
adb install backdoor2.apk
```

## Approach

Since BackDoor 1's plaintext trick is now harder, the developer added a layer of obfuscation. Common techniques at this difficulty:

- **Base64 encoding** — readable in jadx but not immediately obvious
- **Reversed strings** — credentials stored backwards
- **XOR encoding** — simple bitwise operation applied to credential bytes
- **Stored in SQLite** — bundled `prepopulated.db` in assets

### Step 1: Decompile and Review Authentication Logic

```bash
jadx-gui backdoor2.apk
```

Find the login validation code — usually in `MainActivity` or a class like `LoginActivity`, `AuthHelper`, or `UserManager`.

Look for patterns like:

```java
// Base64 encoded credential
String expected = new String(Base64.decode("dXNlcjpwYXNzd29yZA==", Base64.DEFAULT));

// Reversed string
String password = new StringBuilder("drowssap").reverse().toString();

// XOR decoded
byte[] encoded = {0x41, 0x42, 0x43};
byte key = 0x01;
// decoded by XOR-ing each byte with key
```

### Step 2: Find and Decode the Credential

Once you spot the encoding:

**Base64:**
```bash
echo "dXNlcjpwYXNzd29yZA==" | base64 -d
```

Or use [CyberChef](https://gchq.github.io/CyberChef/) — paste the encoded string, apply "From Base64."

**XOR:**
```python
encoded = [0x41, 0x5d, 0x43]
key = 0x12
decoded = ''.join(chr(b ^ key) for b in encoded)
print(decoded)
```

**Reversed string:**
```python
print("drowssap"[::-1])
```

### Step 3: Check SQLite Assets

If the credential isn't in code, check bundled databases:

```bash
apktool d backdoor2.apk -o backdoor2_out
ls backdoor2_out/assets/

# Copy DB to your machine and open
sqlite3 backdoor2_out/assets/app.db
.tables
SELECT * FROM users;
```

### Step 4: Dynamic Verification

If you're unsure which value is the credential, run the app and use `adb logcat` to watch for output:

```bash
adb logcat | grep -i "login\|auth\|password\|success"
```

## Progression from BackDoor 1

| BackDoor 1 | BackDoor 2 |
|-----------|-----------|
| Plaintext in strings.xml | Encoded string in Java code |
| Grep finds it immediately | Requires understanding the decode logic |
| No crypto | Simple encoding (Base64/XOR/reverse) |

## Key Lesson

**Encoding is not encryption.** Base64 is trivially reversible. XOR with a static key is equally weak. An attacker with the APK (which is always available) can reverse any client-side encoding in minutes.

If your app needs to verify a credential locally (e.g. offline PIN), use a proper hash with salt (bcrypt, PBKDF2) — never store or compare plaintext or trivially-reversible encoded values.

---

*Part of NET-SQUARE's mobile application CTF series. Intermediate difficulty.*
