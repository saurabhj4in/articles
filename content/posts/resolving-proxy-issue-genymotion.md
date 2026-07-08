---
title: "Resolving Proxy Issue in Genymotion"
date: 2024-08-26
description: "A quick guide to working around the broken Advanced Options WiFi proxy configuration in Genymotion 3.7.1 by using ADB commands instead."
tags: ["android", "mobile-security", "proxy"]
cover: "https://miro.medium.com/v2/resize:fit:1200/1*mRpZ9KNkI3ZSZi_VMomC8A.png"
canonicalURL: "https://saurabh-jain.medium.com/resolving-proxy-issue-in-genymotion-87e487a80c80"
---

With the recent update in Genymotion 3.7.1, many users have encountered an issue configuring proxy for capturing mobile traffic through Burp Suite or similar intercepting proxies.

## The Standard Process (Now Broken)

The usual way to set a proxy in Android emulators:

1. Go to **Settings → Network & Internet**
2. Select **WiFi**
3. Long press on the WiFi name → **Modify Network**
4. Expand **Advanced Options**
5. Set **Proxy** to Manual and enter host/port

## The Problem

After the Genymotion 3.7.1 update, long pressing the WiFi button only shows three options: **Name of the WiFi**, **Disconnect**, and **Forget**. The **Advanced Options** entry to configure the proxy is gone.

## The Fix: ADB Commands

Instead of the UI, configure the proxy directly via ADB:

### Set the proxy

```bash
adb shell settings put global http_proxy <proxy-ip>:<port>
```

For example, if Burp Suite is listening on your host machine at `192.168.1.10:8080`:

```bash
adb shell settings put global http_proxy 192.168.1.10:8080
```

### Verify the proxy is set

```bash
adb shell settings get global http_proxy
```

### Remove the proxy when done

```bash
adb shell settings delete global http_proxy
```

Or set it to an empty value:

```bash
adb shell settings put global http_proxy :0
```

## Installing Burp's CA Certificate

To intercept HTTPS traffic, you still need to install Burp's CA certificate in the emulator. For Android 7+, you'll need to install it as a system certificate:

```bash
# Export Burp cert, convert to PEM, compute hash
openssl x509 -inform DER -in burp.der -out burp.pem
CERT_HASH=$(openssl x509 -inform PEM -subject_hash_old -in burp.pem | head -1)

# Push to system store (requires root emulator)
adb root
adb remount
adb push burp.pem /system/etc/security/cacerts/${CERT_HASH}.0
adb shell chmod 644 /system/etc/security/cacerts/${CERT_HASH}.0
adb reboot
```

## Quick Reference

| Action | Command |
|--------|---------|
| Set proxy | `adb shell settings put global http_proxy IP:PORT` |
| Check proxy | `adb shell settings get global http_proxy` |
| Clear proxy | `adb shell settings delete global http_proxy` |

This workaround works reliably across Genymotion versions where the WiFi Advanced Options menu is broken.
