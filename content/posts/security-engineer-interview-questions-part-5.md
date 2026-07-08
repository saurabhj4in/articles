---
title: "Security Engineer Interview Questions Part-5"
date: 2024-10-23
description: "Part 5 of the series presents a vulnerable Java code snippet and walks through identifying multiple security flaws including SQL injection, hardcoded credentials, and missing input validation."
tags: ["security", "interview", "code-review"]
cover: "https://miro.medium.com/v2/resize:fit:984/0*wkARrwigupJwn0qB.png"
canonicalURL: "https://saurabh-jain.medium.com/security-engineer-interview-questions-part-5-20a4cbd97258"
---

## Question 1: Source Code Vulnerabilities Analysis

This question presents a vulnerable Java code snippet and asks you to identify all security flaws.

### Identified Vulnerabilities

- **Encoding Issue:** Use of obsolete `ISO-8859-1` charset and encoding. Instead use `UTF-8` (Line 2)
- **Hardcoded Credentials:** Hard-coded username "root" present in connection string (Line 12)
- **Weak Authentication:** Database connection accepts empty passwords (Line 12)
- **SQL Injection:** The code directly concatenates user input (`order_id`) into the SQL query without sanitization (Line 14)
- **Resource Leaks:** Missing proper closure of database connections, statements, and result sets; absent try-catch blocks
- **Outdated Driver:** Uses deprecated `com.mysql.jdbc.Driver` instead of newer `com.mysql.cj.jdbc.Driver` (Line 11)
- **Input Validation Missing:** No validation on `order_id` parameter, risking XSS and HTML injection (Line 10)
- **Exception Handling:** Exceptions lack proper handling throughout the code

### How to Fix Each Vulnerability

**SQL Injection → Use Parameterised Queries**
```java
// Vulnerable
String query = "SELECT * FROM orders WHERE id = " + order_id;

// Fixed
PreparedStatement ps = conn.prepareStatement("SELECT * FROM orders WHERE id = ?");
ps.setString(1, order_id);
```

**Hardcoded Credentials → Use Environment Variables or Secrets Manager**
```java
// Vulnerable
String user = "root";
String pass = "";

// Fixed
String user = System.getenv("DB_USER");
String pass = System.getenv("DB_PASS");
```

**Resource Leaks → Use Try-with-Resources**
```java
try (Connection conn = DriverManager.getConnection(url, user, pass);
     PreparedStatement ps = conn.prepareStatement(query);
     ResultSet rs = ps.executeQuery()) {
    // use resources
} // auto-closed
```

**Input Validation → Validate and Sanitise**
```java
if (!order_id.matches("^[0-9]+$")) {
    throw new IllegalArgumentException("Invalid order ID");
}
```

### Why This Matters in Interviews

Secure code review is a core skill for security engineers. When asked to review code, work through each layer systematically:
1. Input handling and validation
2. Authentication and authorisation
3. Data access patterns (SQL, NoSQL)
4. Error handling and logging
5. Secrets management
6. Dependencies and versions

---

*Part of a series on real security engineer interview questions from major tech companies.*
