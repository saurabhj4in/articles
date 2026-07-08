---
title: "BackDoor 3: NET-SQUARE Hacking Warm-Up Mobile Application Challenge"
date: 2021-06-09
description: "Walkthrough of BackDoor 3 — the most complex challenge in NET-SQUARE's series, requiring multi-step extraction combining static analysis, runtime instrumentation, and potentially native library inspection."
tags: ["android", "ctf", "reverse-engineering"]
cover: "https://miro.medium.com/v2/resize:fit:660/1*qMud2KYa809O8CPsOY-Fpg.png"
canonicalURL: "https://medium.com/bugbountywriteup/backdoor-3-walkthrough-of-net-square-hacking-warm-up-mobile-application-challenge-1f15abdf306e"
---

BackDoor 3 is the most complex challenge in NET-SQUARE's Hacking Warm-Up series — rated at 6 minutes read time versus 3–4 for the previous two. The credentials are hidden through multiple layers, requiring both static and potentially dynamic analysis to recover.

> Try the challenge yourself first: find the APK in NET-SQUARE's GitHub repository.

## Tools Required

| Tool | Purpose |
|------|---------|
| **adb** | Communicate with device/emulator |
| **apktool** | Decompile APK |
| **jadx-gui** | Java decompiler |
| **Ghidra** | Native library (`.so`) reverse engineering |
| **Frida** | Runtime instrumentation |
| **CyberChef** | Decode/decrypt values |
| **Android Studio** | Emulator |

## Setup

```bash
adb devices
adb install backdoor3.apk
```

## Approach: Progressive Analysis

With each BackDoor challenge the complexity increases. BackDoor 3 likely involves one or more of:

- Credentials computed at runtime from device properties
- Multi-step encoding/encryption
- Native library generating or storing the credential
- Network-fetched credential with local verification

### Step 1: Map the Authentication Flow

Open in jadx-gui and trace the login button's `onClick` → follow every function call until you find the validation logic.

```java
// What you're looking for — any comparison of user input
if (input.equals(getSecret())) { // where does getSecret() come from?
    showSuccess();
}
```

Map the call graph: if `getSecret()` calls a native method, you need Ghidra.

### Step 2: Check for Native Methods (JNI)

```java
// JNI declaration in Java
public native String getPassword();

static {
    System.loadLibrary("backdoor3"); // loads libbackdoor3.so
}
```

If you see `native` keyword, extract and reverse the `.so`:

```bash
# Unpack APK
unzip backdoor3.apk -d backdoor3_out
ls backdoor3_out/lib/arm64-v8a/
# → libbackdoor3.so
```

Open `libbackdoor3.so` in **Ghidra** → Functions → find `Java_com_package_Class_getPassword`.

### Step 3: Static Crypto Analysis

The native function may implement simple crypto. Look for:
- XOR loops
- Hardcoded byte arrays
- String tables

If you can identify the algorithm statically, replicate it in Python to extract the credential without running the app.

### Step 4: Dynamic Analysis with Frida

If static analysis is too complex, instrument at runtime:

```bash
# Start frida-server on device
adb push frida-server /data/local/tmp/
adb shell chmod 755 /data/local/tmp/frida-server
adb shell /data/local/tmp/frida-server &

# Hook the native function to print its return value
frida -U -n com.netsquare.backdoor3 -l hook.js
```

```javascript
// hook.js — intercept native getPassword()
Interceptor.attach(
  Module.findExportByName("libbackdoor3.so", "Java_com_netsquare_backdoor3_MainActivity_getPassword"),
  {
    onLeave: function(retval) {
      var jniEnv = Java.vm.getEnv();
      console.log("Password: " + jniEnv.getStringUtfChars(retval, null).readCString());
    }
  }
);
```

Alternatively, hook the Java-layer comparison directly:

```javascript
Java.perform(function() {
  var String = Java.use("java.lang.String");
  String.equals.implementation = function(other) {
    console.log("Comparing: " + this.toString() + " vs " + other);
    return this.equals.call(this, other);
  };
});
```

### Step 5: Runtime Memory Inspection

If all else fails, trigger the login with a known wrong password and search memory for the correct value using Frida's memory scan.

## Comparison Across the Series

| Challenge | Hiding Technique | Key Skill |
|-----------|-----------------|-----------|
| BackDoor 1 | Plaintext in resources | Basic decompilation |
| BackDoor 2 | Encoded in Java | Recognise and reverse encoding |
| BackDoor 3 | Native library / runtime | Ghidra + Frida |

## Key Lessons

1. **Complexity ≠ Security** — even native libraries are reversible with Ghidra; Frida can intercept any runtime value
2. **Client-side secrets don't exist** — anything the app needs to check locally can be extracted by the attacker
3. **Frida is essential for advanced Android testing** — hooks work on production apps on rooted devices

---

*Part of NET-SQUARE's mobile application CTF series. Advanced difficulty — requires Frida and Ghidra.*
