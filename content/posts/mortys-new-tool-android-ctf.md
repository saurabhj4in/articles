---
title: "Morty's New Tool: Android Application CTF Challenge Walkthrough"
date: 2020-09-27
description: "An intermediate Android CTF challenge involving dynamic code transformation at runtime, native library reverse engineering, and Frida instrumentation to intercept a hidden flag."
tags: ["android", "ctf", "reverse-engineering"]
cover: "https://miro.medium.com/max/370/0*RLVBXPPQQBhF5VjI"
canonicalURL: "https://medium.com/bugbountywriteup/mortys-new-tool-android-application-based-ctf-challenge-walkthrough-6058e080598e"
---

Morty's New Tool is an intermediate level Android application CTF challenge. The goal is to learn dynamic code transformation at runtime, reverse engineering of native libraries, and real-time interception using Frida. It simulates real-world app data flow analysis scenarios.

## Tools Required

| Tool | Purpose |
|------|---------|
| **adb** | Communicate with device/emulator |
| **apktool** | Reverse engineer Android APK |
| **jadx-gui** | Produce Java source from APK/Dex |
| **Android Studio** | IDE + emulator |
| **Ghidra** | Open source reverse engineering (native libs) |
| **Frida** | Dynamic code instrumentation toolkit |

## Setup

```bash
# Check device connectivity
adb devices

# Install the APK
adb install mortynewtool.apk
```

## Initial Analysis

Running the app shows a single "LOGIN" button. On click, it sends a request and displays:

```
Request Sent: { "algo": "SHA256", "challenge": "lab3", "flag": <value> }
```

Two key observations:
1. The hashing algorithm is SHA-256
2. The flag value is computed at runtime — it's not stored in plaintext

Breaking SHA-256 directly is infeasible (~2¹²⁸ operations). We need another approach.

## Static Analysis with jadx-gui

```bash
jadx-gui mortynewtool.apk
```

Examining `MainActivity.java` reveals the source is **obfuscated**. A JSON object `f1004a` is constructed with two hardcoded parameters — but the flag value is generated dynamically, likely inside a native library (`.so` file).

## Reverse Engineering the Native Library

Extract the APK as a ZIP and locate `.so` files in `lib/`:

```bash
unzip mortynewtool.apk -d morty_out
ls morty_out/lib/
```

Open the `.so` file in **Ghidra** to analyse the native function responsible for generating the flag. Identify the function name from the JNI bridge in the decompiled Java.

## Dynamic Instrumentation with Frida

Since the flag is computed at runtime, use Frida to hook the native function and intercept the return value:

```bash
# Install frida-server on device
adb push frida-server /data/local/tmp/
adb shell chmod 755 /data/local/tmp/frida-server
adb shell /data/local/tmp/frida-server &

# Hook the native function
frida -U -n com.morty.newtool -l hook.js
```

Example Frida hook script:

```javascript
Interceptor.attach(Module.findExportByName("libmorty.so", "generateFlag"), {
  onLeave: function(retval) {
    console.log("Flag: " + Memory.readUtf8String(retval));
  }
});
```

## Key Takeaways

1. **Obfuscation != Security** — jadx-gui can decompile obfuscated code; logic is still reversible
2. **Native libraries are reversible** — Ghidra handles ARM/x86 `.so` files well
3. **Frida is essential for dynamic analysis** — intercept values computed at runtime that never touch Java land
4. **Runtime values can't hide in SHA-256 outputs** — you intercept *before* hashing, not after

---

*CTF challenge by NET-SQUARE / Cybergym. Intermediate difficulty. Requires Frida setup.*
