# Security Requirements

## Objective

Apply OWASP Top 10 controls from the beginning of the project.

## Mandatory Controls

### A01 - Broken Access Control

Requirements:

* Implement JWT authentication.
* Protect all private endpoints.
* Validate ownership of resources.
* Prevent access to events belonging to other users.
* Use role-based authorization (Admin, Customer).

Acceptance Criteria:

* User A cannot access Event B owned by another user.
* All protected routes require authentication.

---

### A02 - Cryptographic Failures

Requirements:

* HTTPS only.
* Password hashing using BCrypt or Argon2.
* No sensitive data stored in plain text.
* Secrets stored in Azure Key Vault or environment variables.

Acceptance Criteria:

* Passwords are never persisted in plain text.
* Sensitive configuration is not committed to Git.

---

### A03 - Injection

Requirements:

* Entity Framework only.
* Parameterized queries only.
* No dynamic SQL concatenation.
* Input validation on all forms.

Acceptance Criteria:

* SQL Injection tests return no exploitable vectors.

---

### A04 - Insecure Design

Requirements:

* Threat modeling before implementing new modules.
* Input validation layer.
* Domain validation rules.

Acceptance Criteria:

* Invalid business flows are rejected.

---

### A05 - Security Misconfiguration

Requirements:

* Production environment separated from development.
* Disable detailed exception messages.
* Enable security headers.

Acceptance Criteria:

* Stack traces are not exposed publicly.

---

### A06 - Vulnerable Components

Requirements:

* Weekly dependency scanning.
* Enable Dependabot.
* Update critical libraries immediately.

Acceptance Criteria:

* No Critical vulnerabilities in production.

---

### A07 - Authentication Failures

Requirements:

* Password complexity.
* Account lockout after failed attempts.
* Refresh token strategy.

Acceptance Criteria:

* Brute force attacks are mitigated.

---

### A08 - Software Integrity Failures

Requirements:

* CI/CD validation.
* Pull Request approvals.
* Signed deployments.

Acceptance Criteria:

* No direct deployment to production.

---

### A09 - Logging and Monitoring

Requirements:

* Audit logs.
* Security events.
* Authentication logs.

Acceptance Criteria:

* Suspicious activities can be traced.

---

### A10 - SSRF

Requirements:

* Validate external URLs.
* Whitelist allowed domains.

Acceptance Criteria:

* Internal network resources cannot be queried externally.

---

## Additional Headers

* Content-Security-Policy
* X-Frame-Options
* X-Content-Type-Options
* Referrer-Policy
* Strict-Transport-Security

## Additional Protections

* Rate Limiting
* Anti-Forgery
* CORS Restrictions
* Input Sanitization
* Output Encoding
* Bot Protection
