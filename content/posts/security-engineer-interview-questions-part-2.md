---
title: "Security Engineer Interview Questions Part-2"
date: 2024-09-27
description: "Part 2 of the series explains the differences between monolithic and microservice architectures from a security and scalability perspective."
tags: ["security", "interview", "architecture"]
cover: "https://miro.medium.com/v2/resize:fit:1200/1*jVgNnRIVP2yJ9sx7S5OfnQ.png"
canonicalURL: "https://saurabh-jain.medium.com/security-engineer-interview-questions-part-2-0bdd5fbf3a52"
---

Welcome to Part-2 of Security Engineer Interview Questions.

## Question 1: Difference between Microservice Architecture & Monolithic Architecture?

### Monolithic Architecture

The entire application is built as one large unit. All components (User Interface, Business Logic, Database and Web Servers) are combined into a single, unified system. The components are highly interdependent — changing one part can affect other parts. Any modification requires the whole system to be redeployed.

**Advantages:** Easy to develop and easy to deploy

**Disadvantages:** Hard to scale and tough to debug

**Security implication:** A single vulnerability can compromise the entire application. There is no isolation between components.

### Microservice Architecture

The application is broken down into smaller, independent services handling specific functions (authentication, authorization, chat box, payment processing, etc.). Components are independent and communicate via APIs. Each microservice can be deployed, maintained, and scaled independently.

**Advantages:** Easy to scale, fault-tolerant and independent service deployment

**Disadvantages:** Complex and requires a sophisticated infrastructure

**Security implication:** Attack surface is more distributed. A compromised service can be isolated. But API communication introduces new vectors like MITM and IDOR if not properly secured.

### Security Trade-offs

| Factor | Monolithic | Microservices |
|--------|------------|---------------|
| Blast radius | High — entire app | Contained to one service |
| Auth complexity | Simpler | Each service needs auth |
| Logging | Centralised | Distributed (requires aggregation) |
| Network exposure | Minimal | High (internal APIs) |

---

*Part of a series on real security engineer interview questions from major tech companies.*
