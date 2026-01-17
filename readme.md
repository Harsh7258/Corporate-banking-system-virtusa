# Corporate Banking Client & Credit Management System
**Capstone Project 1**

A full-stack corporate banking application that digitizes how banks onboard corporate clients and manage credit (loan) requests using secure, role-based access.

---

## Tech Stack

| Layer       | Technology |
|------------|------------|
| Frontend   | Angular 18 |
| Backend    | Spring Boot |
| Database   | MongoDB |
| Security   | JWT Authentication + Spring Security |
| Architecture | SPA + REST APIs |
| Deployment | Docker (optional) |

---

## Why This Project? (Problem Statement in Simple Words)

In real corporate banks:

- Client onboarding is often done in **Excel sheets**
- Credit (loan) requests are **emailed or tracked manually**
- There is **no proper audit trail**
- It is **hard to track who approved what**
- Data is scattered and insecure

This project solves these problems by providing:

 - A **centralized system**  
 - **Role-based access** (Admin, RM, Analyst)  
 - **Secure login using JWT**  
 - **Digital tracking of clients and loan requests**  
 - **Full auditability & transparency**

This is how **real banking platforms** like loan processing systems work.

---

## Project Objective

Build a secure corporate banking system where:

- **Admins** manage users
- **Relationship Managers (RM)** onboard corporate clients and submit credit requests
- **Analysts** review and approve/reject those requests

All data is securely stored and accessed through role-based permissions.

---

## How I Approached This Project (SDLC-Based Development)

This project was built by following a structured **SDLC (Software Development Life Cycle)** approach to ensure clarity, scalability, and real-world alignment.

---

### Requirement Analysis

I first studied how corporate banks actually work:
- RMs handle clients
- Analysts approve credit
- Admins control system access

From this, I identified three core user roles:
- **ADMIN**
- **RELATIONSHIP MANAGER (RM)**
- **ANALYST**

I also listed the key business problems:
- Client onboarding is manual
- Credit requests are not tracked digitally
- No secure role-based access

This led to defining two major features:
- **Authentication & Authorization**
- **Client and Credit Request Management**

---

### System Design

Before writing code, I designed the system around:
- **JWT-based stateless security**
- **Role-based access control**
- **Angular SPA frontend**
- **Spring Boot REST backend**
- **MongoDB for flexible document storage**

I separated responsibilities clearly:
- Frontend → UI + routing + guards
- Backend → business logic + security
- Database → persistent storage

---

### Database & API Design

I designed three core collections:
- **users**
- **clients**
- **creditRequests**

Each was modeled to reflect real banking data:
- Clients linked to RM
- Credit requests linked to both client and RM
- Role stored inside users

REST APIs were designed around business flows:
- RM → create client → submit credit
- Analyst → review → approve/reject
- Admin → manage users

---

### Backend Development

I implemented the backend in the following order:

1. **JWT Authentication & Spring Security**
    - Login
    - Token generation
    - Token validation filter
    - Role-based access

2. **User Management (Admin)**
    - Create RM / Analyst
    - Activate / Deactivate users

3. **Client Management (RM)**
    - Add, update, view clients
    - Filter by RM ID from JWT

4. **Credit Request Flow**
    - RM creates request
    - Analyst reviews and updates status

This ensured that security was in place before business logic.

---

### Frontend Development

Angular was built module-wise:

- **Auth Module**
    - Login
    - JWT storage
    - Interceptor

- **RM Module**
    - Client forms
    - Credit request forms
    - Lists & tables

- **Analyst Module**
    - Request review screen
    - Approve / Reject actions

- **Admin Module**
    - User management screen

Angular Guards ensure:
- RM cannot access Analyst pages
- Analyst cannot access Admin pages
- No access without login

---

### Integration & Testing

Once both sides were ready:
- Angular was connected to Spring Boot APIs
- JWT was passed with every request
- Role checks were validated
- End-to-end flows were tested:
    - RM → Client → Credit
    - Analyst → Approve → Update

---

### Final Outcome

By following SDLC, the system was built in a:
- Structured way
- Secure way
- Scalable way
- Production-like architecture

This approach ensured the project behaves like a **real corporate banking platform**, not just a demo app.
---

## Feature 1 — Authentication & Authorization

### Roles

| Role | Responsibilities |
|------|------------------|
| ADMIN | Create users (RM, Analyst), enable/disable accounts |
| RM | Onboard clients, submit credit requests |
| ANALYST | Review and approve/reject credit requests |

### Security Flow

- User logs in
- Server generates a **JWT**
- Token contains **userId + role**
- Angular sends JWT with every request
- Spring Security validates JWT
- Access is granted or denied based on role

### Users Collection (MongoDB)

```json
{
  "_id": "ObjectId",
  "username": "john_doe",
  "email": "john@example.com",
  "password": "$2a$10$...",
  "role": "RM",
  "active": true
}
