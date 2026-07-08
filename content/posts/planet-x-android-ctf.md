---
title: "Planet X: Android Application CTF Challenge Walkthrough"
date: 2020-09-27
description: "Walkthrough of the Planet X Android CTF challenge — a beginner-friendly challenge teaching foundational mobile application security assessment techniques."
tags: ["android", "ctf", "mobile-security"]
cover: "https://miro.medium.com/max/326/0*flK6JdG83nNWaUfb"
canonicalURL: "https://medium.com/@saurabh_jain_/planet-x-android-application-based-ctf-challenge-walkthrough-778547aac015"
---

Planet X is a beginner-level Android application CTF challenge covering basic flaws discovered during mobile application security assessments. It's part of a series of challenges designed to build practical skills in Android reverse engineering.

## Tools

- **adb** — Android Debug Bridge for device communication
- **apktool** — Decompiles APK to smali code and resources
- **jadx-gui** — Converts APK to readable Java source
- Android emulator or physical device

## Getting Started

```bash
# Connect to emulator/device
adb devices

# Install the challenge APK
adb install planet_x.apk
```

## Phase 1: Static Analysis

Static analysis means examining the app without running it — looking at the code and resources to find vulnerabilities.

### Decompile the APK

```bash
apktool d planet_x.apk -o planetx_out
```

### Review AndroidManifest.xml

```bash
cat planetx_out/AndroidManifest.xml
```

What to flag:
- `android:exported="true"` on activities/services/receivers
- `android:debuggable="true"` (allows adb debug access)
- `android:allowBackup="true"` (allows adb backup of app data)
- Custom permissions vs no permissions

### Examine Source Code in jadx-gui

Load the APK in jadx-gui and scan through:
- `MainActivity` — entry point logic
- Any class with "auth", "login", "secret", "key" in the name
- String constants and resource files

```bash
# Quick grep for interesting strings in smali
grep -ri "flag\|password\|secret\|api_key" planetx_out/smali/
```

## Phase 2: Dynamic Analysis

Run the app and observe its behaviour at runtime.

### Log Monitoring

Many apps accidentally log sensitive data:

```bash
adb logcat | grep -i "planet\|key\|flag\|secret\|password"
```

### Network Traffic

Route emulator traffic through Burp Suite to intercept API calls. Look for:
- Authentication tokens sent in plaintext
- Sensitive data in request/response bodies
- Missing certificate validation (allows MITM)

### File System Inspection

```bash
# Access app private files (requires debug build or rooted device)
adb shell run-as com.planet.x

# Check shared prefs
cat /data/data/com.planet.x/shared_prefs/*.xml

# Check databases
sqlite3 /data/data/com.planet.x/databases/planetx.db ".dump"

# Check files directory
ls -la /data/data/com.planet.x/files/
```

## Phase 3: Component Exploitation

### Exported Activity Bypass

If the app has exported activities that skip authentication:

```bash
# Launch hidden/admin activity directly
adb shell am start -n com.planet.x/.AdminActivity
adb shell am start -n com.planet.x/.FlagActivity
```

### Deep Link / Intent Injection

Some apps handle deep links that trigger privileged actions:

```bash
adb shell am start -a android.intent.action.VIEW \
  -d "planetx://secret?code=admin"
```

## Key Security Takeaways

| Vulnerability | Impact | Fix |
|--------------|--------|-----|
| Hardcoded secrets | Full compromise | Use server-side secrets, runtime key fetch |
| Exported activities | Auth bypass | Add `android:exported="false"` + permission checks |
| Cleartext logging | Data leakage | Remove logs in release builds (`ProGuard`) |
| Unencrypted local storage | Data theft on rooted device | Use Android Keystore + EncryptedSharedPreferences |
| Missing cert pinning | MITM | Implement network security config with cert pins |

---

*Part of an Android security CTF series. A great hands-on introduction to mobile application security assessment.*
