---
title: "Universe Weird C132: Android Application CTF Challenge Walkthrough"
date: 2020-09-27
description: "Walkthrough of the Universe Weird C132 Android CTF challenge, covering reverse engineering techniques and common mobile application security flaws."
tags: ["android", "ctf", "mobile-security"]
canonicalURL: "https://medium.com/@saurabh_jain_/universe-weird-c132-android-application-based-ctf-challenge-walkthrough-af834c6c9467"
---

Universe Weird C132 is an Android application-based CTF challenge designed to teach basic security flaws found during mobile application security assessments. Like the other challenges in this series, it involves APK analysis, reverse engineering, and exploiting common Android security weaknesses.

## Prerequisites

- Android emulator (Genymotion or Android Studio AVD)
- adb installed and configured
- apktool and jadx-gui for decompilation
- Basic understanding of Java/Kotlin

## Setup

```bash
# Verify emulator is running
adb devices

# Install the challenge APK
adb install universe_weird_c132.apk
```

## Reconnaissance Phase

### 1. Inspect the APK Structure

```bash
# Decompile with apktool to get resources and manifest
apktool d universe_weird_c132.apk -o c132_out

# Review manifest first
cat c132_out/AndroidManifest.xml
```

Key things to look for in the manifest:
- Exported activities (accessible without authentication)
- Broadcast receivers with no permissions
- `android:debuggable="true"`
- Backup enabled (`android:allowBackup="true"`)

### 2. Decompile to Java Source

Open the APK in jadx-gui for readable source code. Navigate through the package structure to find:
- The main activity and entry points
- Any hardcoded strings (API keys, passwords, flags)
- Cryptographic implementations

### 3. Search for Hardcoded Values

```bash
# In the decompiled smali or jadx output
grep -r "flag\|CTF\|secret\|password\|key\|token" c132_out/
```

## Common Attack Vectors in This Challenge

### Insecure SharedPreferences

Many CTF challenges store sensitive data in SharedPreferences without encryption:

```bash
adb shell run-as com.universe.weird.c132
cat /data/data/com.universe.weird.c132/shared_prefs/*.xml
```

### Hardcoded Strings in Resources

```bash
cat c132_out/res/values/strings.xml
```

### SQLite Database Inspection

```bash
adb shell run-as com.universe.weird.c132
sqlite3 /data/data/com.universe.weird.c132/databases/app.db
.tables
SELECT * FROM users;
```

### Activity Hijacking

If activities are exported without permission checks, you can launch them directly:

```bash
adb shell am start -n com.universe.weird.c132/.HiddenActivity
```

## Lessons Learned

1. **Never trust client-side controls** — any logic in the APK can be reversed and bypassed
2. **Encryption alone isn't enough** — if the key is hardcoded in the APK, encryption is useless
3. **Exported components need explicit permissions** — each exported activity/receiver is an attack surface
4. **SQLite databases are plaintext** — use SQLCipher for sensitive data

---

*Part of an Android security CTF series. Available on GitHub via cybergym's repository.*
