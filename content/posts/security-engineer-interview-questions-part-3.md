---
title: "Security Engineer Interview Questions Part-3"
date: 2024-10-09
description: "Part 3 of the series covers AWS network architecture, specifically where to place a Load Balancer and S3 Bucket within public and private subnets for optimal security."
tags: ["security", "aws", "interview"]
cover: "https://miro.medium.com/v2/da:true/resize:fit:1200/0*4j21HcmDR1_SDy3Q"
canonicalURL: "https://saurabh-jain.medium.com/security-engineer-interview-questions-part-3-457ed78ee43a"
---

## Question 1: Load Balancer and S3 Bucket Subnet Placement

This question addresses where to position a Load Balancer and S3 Bucket within network architecture.

### Load Balancer Placement

A Load Balancer such as AWS ALB or NLB should reside in a **public subnet** because it requires internet accessibility. It distributes incoming traffic from external users to backend services running in private subnets for enhanced security.

**Functions include:**
- Distributes incoming HTTP/HTTPS requests from users to backend servers or instances
- Serves as the entry point for external traffic to your application or website
- Acts as a layer of abstraction, allowing you to scale or replace instances without disrupting external traffic

**Security benefit:** Backend instances (EC2, containers) live in private subnets with no direct internet exposure. All access goes through the load balancer, which can enforce TLS termination and WAF rules.

### S3 Bucket Placement

S3 Buckets should generally be kept in private subnets (or accessed via VPC endpoints) to prevent public exposure. Direct public access should be disabled unless explicitly required, and bucket policies should enforce least-privilege access.

**Best practices:**
- Disable block public access at the account level
- Use VPC endpoints (Gateway type) to avoid data traversing the public internet
- Enable S3 server-side encryption (SSE-S3 or SSE-KMS)
- Enable access logging and CloudTrail data events
- Apply bucket policies following principle of least privilege

### Architecture Summary

```
Internet → [Public Subnet: ALB] → [Private Subnet: EC2/ECS]
                                          ↓
                              [VPC Endpoint] → S3 Bucket
```

This keeps your compute and storage completely isolated from direct internet access.

---

*Part of a series on real security engineer interview questions from major tech companies.*
