---
title: "OhSINT TryHackMe Walkthrough"
date: 2024-10-28
description: "A walkthrough of the OhSINT room on TryHackMe, demonstrating how to extract EXIF metadata from an image file and use OSINT techniques to answer challenge questions."
tags: ["tryhackme", "osint", "hacking"]
cover: "https://miro.medium.com/v2/da:true/resize:fit:1200/0*ifPp3aIaS92zqJZF"
canonicalURL: "https://saurabh-jain.medium.com/ohsint-tryhackme-walkthrough-251dc6096f66"
---

> "What information can you possibly get with just one image file?"

This challenge explores OSINT techniques through image analysis. The challenge was updated on February 1, 2024, and the file is available on the AttackBox under `/Rooms/OhSINT` directory.

## What is OSINT?

Open Source Intelligence (OSINT) is the practice of collecting and analysing information from publicly available sources — social media, search engines, image metadata, DNS records, and more. It's a core skill for both offensive (recon) and defensive (threat intel) security work.

## Tools Required

- **exiftool** — extracts metadata from images, documents, and media files
- **Google / search engines** — for correlation of discovered data
- A browser and curiosity

## Methodology

### Step 1: Download the Challenge Image

The challenge provides a single image file. Download it via the AttackBox or wget.

### Step 2: Extract Metadata with exiftool

```bash
exiftool WindowsXP.jpg
```

This dumps all EXIF metadata embedded in the image. Look for fields like:
- `GPS Latitude` / `GPS Longitude` — reveals physical location
- `Copyright` — may contain a username
- `Camera Model`, `Software` — can fingerprint the creator

### Step 3: OSINT Research

Take the discovered values (usernames, GPS coordinates, etc.) and pivot:

- Search the username across social platforms (Twitter/X, GitHub, WordPress)
- Paste GPS coordinates into Google Maps to identify the city
- Look for any associated accounts or email addresses

## Challenge Questions & Answers

**Q1: What is this user's avatar of?**

Using the copyright field extracted from exiftool and searching the username online leads you to a social media profile — the avatar shows a **cat**.

**Q2: What city is this person in?**

The GPS coordinates extracted from the image, when entered into Google Maps, point to a specific city.

**Q3: What is the SSID of the WAP he connected to?**

Using the location and the username, searching on Wigle.net (a wireless network mapping service) reveals nearby access points associated with the user.

## Key Lessons

1. **Images carry more data than pixels** — EXIF metadata can expose GPS location, device info, and timestamps
2. **Usernames are pivots** — a single username found in metadata can unlock an entire online footprint
3. **Public data compounds** — individually harmless data points combine to reveal sensitive information

Always strip metadata from images before posting publicly. Tools like `exiftool -all= filename.jpg` remove embedded data.

---

*TryHackMe room: [OhSINT](https://tryhackme.com/room/ohsint)*
