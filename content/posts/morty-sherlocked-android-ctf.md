---
title: "Morty Sherlocked: Android Application CTF Challenge Walkthrough"
date: 2020-09-27
description: "A beginner-level Android CTF challenge walkthrough covering APK analysis, reverse engineering, and common mobile security vulnerabilities."
tags: ["android", "ctf", "mobile-security"]
cover: "https://miro.medium.com/max/315/0*i7VdsGMh6eSHra7P"
canonicalURL: "https://medium.com/swlh/morty-sherlocked-android-application-ctf-challenge-walkthrough-ab1ec2161cb4"
---

Morty Sherlocked is a beginner level Android application CTF challenge created by Moksh Makhija. It teaches foundational mobile security concepts through hands-on APK analysis — the same techniques used in real security assessments of Android applications.

## Tools Required

| Tool | Purpose |
|------|---------|
| **adb** | Command line tool to communicate with Android devices/emulators |
| **apktool** | Reverse engineering tool for Android APKs |
| **jadx-gui** | Decompiles APK to Java source code |
| **Android Studio** | IDE with built-in emulator |
| Physical device or emulator | Running the application |

## Setup

### Connect Your Device

```bash
# Check device is connected
adb devices
```

### Install the APK

```bash
adb install morty.apk
```

### Decompile with apktool

```bash
# Decompile resources, AndroidManifest.xml, smali code
apktool d morty.apk -o morty_decompiled
```

### Decompile to Java with jadx-gui

Open jadx-gui and load the APK. This gives you readable Java/Kotlin source code, making it much easier to find hardcoded secrets, weak crypto, and logic flaws.

## Common Vulnerabilities to Look For

### 1. Hardcoded Secrets

```java
// In decompiled code — look for patterns like:
private static final String API_KEY = "sk-hardcoded-secret";
String password = "admin123";
```

Search across decompiled source with `grep -r "password\|secret\|key\|token" .`

### 2. AndroidManifest.xml Review

```xml
<!-- Dangerous: exported activity with no permission -->
<activity android:name=".AdminActivity" android:exported="true"/>

<!-- Dangerous: debug mode enabled -->
<application android:debuggable="true">
```

### 3. Insecure Data Storage

Check these locations for sensitive data:
```bash
# Access app's private data directory (requires root or debug flag)
adb shell run-as com.target.app
ls /data/data/com.target.app/

# Files to check:
# shared_prefs/*.xml  → SharedPreferences (often stores tokens/passwords)
# databases/*.db      → SQLite databases
# files/             → Internal storage
```

### 4. Traffic Interception

Set up a proxy (Burp Suite) and route emulator traffic through it to see API calls, tokens, and business logic in plaintext.

## Key Takeaways

1. **APK files are ZIP archives** — rename to `.zip` and unzip to see all resources
2. **Decompilation is never 100% perfect** — smali code is always available as fallback
3. **Android apps trust the local device** — root or debug access reveals everything
4. **Never store secrets in the APK** — use remote config, certificate pinning, and runtime key fetching instead

This challenge repository is available on GitHub at cybergym's repository. Try it before reading walkthroughs — the learning sticks better when you've struggled first.

---

*Android CTF by Moksh Makhija. Great starting point for mobile security beginners.*
