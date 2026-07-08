---
title: "Cracked AWS Cloud Practitioner in 2 Weeks"
date: 2025-07-10
tags: ["AWS", "Certification", "Cloud", "Learning"]
description: "How I passed AWS Certified Cloud Practitioner (CLF-C02) in two weeks with prior hands-on experience and a focused study plan."
canonicalURL: "https://medium.com/readers-club/cracked-aws-cloud-practitioner-in-2-weeks-7ec79dbf4934"
cover: "https://miro.medium.com/v2/resize:fit:1200/1*Oi277idbrjkDAOGg8JPqLQ.png"
---

> This article was originally published on [Medium](https://medium.com/readers-club/cracked-aws-cloud-practitioner-in-2-weeks-7ec79dbf4934). Read the full version there.

I already had hands-on AWS experience. But formal certification felt overdue — and the AWS Certified Cloud Practitioner (CLF-C02) seemed like the right place to nail down the gaps: billing models, support tiers, global infrastructure, the services I'd never actually touched.

Two weeks. Passed.

Here's exactly what I did.

## The Study Stack

### Week 1: Structured Learning

**Stéphane Maarek's AWS Cloud Practitioner course on Udemy** was the foundation. It's thorough without being bloated — covers all the core service categories, pricing models, and architectural concepts the exam tests.

Key areas I focused on that hands-on experience doesn't naturally cover:
- **Support plans** — Basic, Developer, Business, Enterprise. Know what's included in each.
- **Billing and pricing** — On-Demand vs Reserved vs Spot vs Savings Plans. The exam loves this.
- **Global infrastructure** — Regions, Availability Zones, Edge Locations, Local Zones. Know the differences.
- **Shared responsibility model** — What AWS manages vs what you manage varies by service type.

### Week 2: Practice Papers

Practice exams are where you actually learn the exam's vocabulary and trick-question style.

| Source | Papers Completed |
|--------|-----------------|
| Stéphane Maarek (Udemy) | 6 |
| Neal Davis (Udemy) | 6 |
| Kanan Nirav's website | 23 |

That's a lot of practice papers. It felt like overkill. It wasn't.

The CLF-C02 tests nuance: "Which of these is *not* a benefit of the cloud?" requires knowing all four options well enough to identify the one that doesn't fit. Practice papers expose which concepts you only *think* you know.

## What Actually Gets Tested

Things I underestimated before studying:

- **Well-Architected Framework** — 6 pillars (Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability). Expect questions on all of them.
- **Service categories** — knowing whether something is IaaS, PaaS, or SaaS, and which AWS services fall into each
- **High availability vs fault tolerance** — different concepts, different services
- **Cost optimization services** — Cost Explorer, Budgets, Trusted Advisor, Cost and Usage Report

## Tips That Actually Helped

**Don't memorize, understand.** The exam tests comprehension, not recall. "Why would you use S3 over EFS?" matters more than knowing S3's exact pricing per GB.

**Do the practice papers under time pressure.** 65 questions in 90 minutes. That's 83 seconds per question. Comfortable speed during practice, no panic during the exam.

**Flag and come back.** Don't get stuck. Mark uncertain questions, finish the test, then revisit. You'll often see clues in later questions.

**Read every answer choice before picking.** AWS exams are notorious for having two answers that are both technically correct, with one being *more* correct for the specific scenario described.

## The Exam Experience

Took it online via Pearson VUE. Remote proctoring worked fine. The actual exam felt slightly easier than the Neal Davis practice papers — which is the right calibration (practice harder, test easier).

## Worth It?

For someone already working in cloud environments: yes, but mostly for the credentials and the forced review of billing/support/compliance concepts you might never touch day-to-day.

If you're new to cloud: this is an excellent starting point. The concepts map to any cloud provider, and the structured framework gives you vocabulary that makes everything else easier.

Two weeks of focused effort. Manageable, and worth it.
