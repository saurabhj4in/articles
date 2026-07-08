---
title: "BackDoor 1: NET-SQUARE Hacking Warm-Up Mobile Application Challenge"
date: 2021-06-09
description: "Walkthrough of the BackDoor 1 mobile CTF challenge from NET-SQUARE — extracting hidden credentials from an Android APK using static reverse engineering tools."
tags: ["android", "ctf", "reverse-engineering"]
cover: "https://miro.medium.com/v2/resize:fit:660/1*qMud2KYa809O8CPsOY-Fpg.png"
canonicalURL: "https://medium.com/bugbountywriteup/backdoor-1-walkthrough-of-net-square-hacking-warm-up-mobile-application-challenge-7433b8e1a482"
---

BackDoor 1 is the first challenge in NET-SQUARE's Hacking Warm-Up series for mobile applications. The goal is straightforward: the application hides a username and password inside the APK, and you need to find them.

> If you want to try the challenge yourself before reading, find the APK in NET-SQUARE's GitHub repository.

## Tools Required

| Tool | Purpose |
|------|---------|
| **adb** | Communicate with device/emulator |
| **apktool** | Decompile APK to smali + resources |
| **jadx-gui** | Decompile to readable Java source |
| **Android Studio** | Emulator |

## Setup

```bash
# Verify emulator is running
adb devices

# Install the challenge APK
adb install backdoor1.apk
```

## Approach: Static Analysis

Since the credentials are "hidden inside the application," they must be somewhere in the APK's code or resources. We don't need to run the app — just decompile it.

### Step 1: Decompile with apktool

```bash
apktool d backdoor1.apk -o backdoor1_out
```

This gives you:
- `AndroidManifest.xml` — exported components, permissions
- `res/` — layout files, string resources, raw assets
- `smali/` — decompiled bytecode

### Step 2: Check String Resources

The most common beginner mistake: storing credentials in `strings.xml`.

```bash
cat backdoor1_out/res/values/strings.xml
```

Look for any values that look like usernames, passwords, or tokens.

### Step 3: Decompile to Java with jadx-gui

```bash
jadx-gui backdoor1.apk
```

Open the `MainActivity` and any class related to authentication. Search across all classes for:
- `"password"`, `"user"`, `"admin"`, `"secret"`
- Any `if` statements comparing hardcoded string literals
- Base64-encoded strings (look for `==` padding at the end)

```bash
# Quick grep in smali
grep -ri "password\|username\|login" backdoor1_out/smali/
```

### Step 4: Check Shared Preferences and Assets

```bash
# Assets folder
ls backdoor1_out/assets/
cat backdoor1_out/assets/*

# Raw resources
ls backdoor1_out/res/raw/
```

## Common Hiding Places in CTF APKs

| Location | How to Check |
|----------|-------------|
| `strings.xml` | `cat res/values/strings.xml` |
| Java class literals | jadx-gui search |
| Base64 in code | `grep -r "Base64" smali/` |
| SQLite prepopulated DB | `ls assets/*.db` |
| SharedPreferences | Requires running app on device |
| Native library | Requires Ghidra/strings |

## Entering the Credentials

Once found, open the app and enter the username and password to complete the challenge.

## Key Lesson

**Hardcoded credentials in APKs are never secure.** Anyone can decompile an Android app in under a minute. Never store secrets, API keys, or passwords in:
- String resources
- Hardcoded Java/Kotlin literals
- Asset files bundled in the APK

Use server-side authentication, runtime key fetch, or Android Keystore for anything sensitive.

---

*Part of NET-SQUARE's mobile application CTF series. Great for Android security beginners.*
