---
title: "Security Beyond Browsers: Why CORS Doesn't Apply to Mobile Applications"
date: 2023-11-03
description: "CORS is a browser-enforced security mechanism — not a server or OS feature. This article explains why native mobile apps are immune to CORS restrictions and what that means for security testing."
tags: ["mobile-security", "cors", "security"]
cover: "https://miro.medium.com/v2/da:true/resize:fit:1174/0*j5MBBCZQFut9cmFL"
canonicalURL: "https://medium.com/javascript-in-plain-english/security-beyond-browsers-why-cors-doesnt-apply-to-mobile-applications-99e6ab3e8fe7"
---

In a number of interviews and security assessments, I've been asked:

- *Why do mobile applications not have a CORS vulnerability?*
- *Can we exploit CORS in mobile applications?*
- *Mobile apps have WebViews — do they inherit browser vulnerabilities like CORS?*

This article settles the confusion once and for all.

## What is CORS?

**Cross-Origin Resource Sharing (CORS)** is a security feature implemented by web browsers to control how web pages from one domain can request and access resources from a different domain.

When a browser makes a cross-origin request (e.g., `evil.com` calling `api.bank.com`), it:
1. Checks if the server's response includes `Access-Control-Allow-Origin`
2. If the origin isn't allowed, **blocks the JavaScript from reading the response**

The critical word: **browser**. CORS is enforced by the browser engine — not the server, not the OS, not the network.

## Why Native Mobile Apps Are Not Subject to CORS

A native Android or iOS app uses system HTTP clients:
- Android: `OkHttp`, `HttpURLConnection`, `Retrofit`
- iOS: `URLSession`, `Alamofire`

These clients make HTTP requests **without a browser engine**. There is no code that checks `Access-Control-Allow-Origin` headers before returning data to the app. The full response is always available to the app regardless of what CORS headers the server sends.

```kotlin
// Android — this call goes through regardless of CORS headers
val client = OkHttpClient()
val request = Request.Builder().url("https://api.other-domain.com/data").build()
val response = client.newCall(request).execute()
// response.body is always accessible — no CORS check
```

The server still receives the request and returns the response. CORS only prevents the *browser* from letting JavaScript *read* that response. It has no effect on code running natively on a device.

## What About WebViews?

Mobile apps that embed WebViews **do** run a browser engine internally. CORS *can* apply within the WebView's JavaScript context — but only to JavaScript making cross-origin requests from within the WebView.

Native code communicating with APIs directly (outside the WebView) is still not subject to CORS.

| Context | CORS applies? |
|---------|--------------|
| Browser (any) | ✅ Yes |
| Native Android/iOS HTTP | ❌ No |
| WebView JavaScript | ✅ Yes (within WebView) |
| Native code calling API | ❌ No |

## Security Implications

### For Developers
Don't rely on CORS to protect your API from mobile clients. A mobile app — or anyone using curl, Postman, or any non-browser tool — will never be blocked by CORS.

Real API protection requires:
- **Authentication** (JWT, OAuth 2.0, API keys)
- **Authorisation** (check what the authenticated user can do)
- **Rate limiting**
- **Input validation**

### For Security Testers
When testing a mobile app's API, CORS misconfigurations are largely irrelevant for the native app itself. However:
- If the same API is consumed by a web frontend, CORS misconfigs matter there
- WebViews with relaxed CORS settings (`setAllowUniversalAccessFromFileURLs`) are a real vulnerability
- Focus on auth bypasses, IDOR, and business logic flaws instead

## Common Interview Trap

**Question:** "The mobile app calls `api.example.com`. The server has `Access-Control-Allow-Origin: *`. Is this a vulnerability?"

**Wrong answer:** "Yes, it allows cross-origin access."

**Correct answer:** "For the mobile app itself, no — CORS doesn't apply to native HTTP clients. For a web frontend using the same API, `*` is overly permissive and could contribute to CSRF-like attacks if combined with credentialed requests. The risk context matters."

## Summary

- CORS is a **browser enforcement mechanism**, not a server or OS feature
- Native mobile apps bypass CORS completely because they don't use a browser engine
- WebViews inherit browser behaviour and are subject to CORS within their JavaScript context
- API security must rely on authentication and authorisation, not CORS

---

*Part of an ongoing series on security misconceptions in interviews and assessments.*
