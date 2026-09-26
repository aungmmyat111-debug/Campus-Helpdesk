# Campus Helpdesk IT Ticketing System

A containerized full-stack web application designed for university campus IT issue tracking and lifecycle management. The platform incorporates Microsoft Entra ID (Single Sign-On), automated LLM ticket triage using Groq API, public holiday scheduling context via the Nager.Date API, and secret management powered by Azure Key Vault.

---

## Architecture Overview

                              +------------------------------------+
                              |         Client (Browser)           |
                              |     React / Vite / MSAL Auth       |
                              +-----------------+------------------+
                                                |  HTTPS / JWT
                                                v
                              +------------------------------------+
                              |        Nginx Reverse Proxy         |
                              |  (au-campus-helpdesk...azure.com)  |
                              +-----------------+------------------+
                                                |
                                                v
+------------------------+        +------------------------------------+        +------------------------+
|    Azure Key Vault     | <====> |       Express Backend (Docker)     | ====>  |     Groq API (LLM)     |
| (Database, JWT secrets)|        |   Node.js, TypeScript, Middleware  |        | (Category & Priority)  |
+------------------------+        +--------+------------------+--------+        +------------------------+
|                  |
v                  v
+----------------+  +--------------------+
|  Prisma ORM    |  |  Nager.Date API    |
|  (MySQL DB)    |  | (Thailand Calendar)|
+----------------+  +--------------------+

---

## Tech Stack

* **Frontend:** React, TypeScript, Vite, Microsoft Authentication Library (MSAL)
* **Backend:** Node.js, Express, TypeScript
* **Database & ORM:** MySQL container, Prisma ORM
* **Security & Auth:** Microsoft Entra ID SSO, Custom JWT Middleware, Azure Key Vault (`@azure/keyvault-secrets`, `@azure/identity`)
* **AI & External APIs:** Groq SDK (`openai/gpt-oss-20b`), Nager.Date Public Holiday API (Thailand)
* **DevOps & Cloud:** Docker Compose, Azure Virtual Machine (Ubuntu, Southeast Asia), Nginx reverse proxy with SSL/TLS

---

## Key Features

1. **Role-Based Access Control (RBAC):**
   * Enforces role boundaries (`STUDENT`, `FACULTY`, `TECHNICIAN`, `ADMINISTRATOR`) using custom Express middleware (`authenticateJWT` and `requireRole`).
2. **Dynamic Cloud Secret Injection:**
   * Startup configuration pulls production secrets directly from Azure Key Vault, maintaining a safe fallback to `.env` for local development.
3. **Automated AI Triage:**
   * Ticket descriptions are processed via Groq API to dynamically assign urgency (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) and departmental category (`HARDWARE`, `SOFTWARE`, `NETWORK`, `GENERAL`).
4. **Academic Schedule Awareness:**
   * Interacts with Nager.Date Thailand Public Holiday API to tag tickets with campus operating status, guarded by an offline fallback mechanism.
5. **Relational Data Integrity:**
   * Prisma schema with cascading relations between users, tickets, and comment threads.

---

## Project Structure

.
├── client/                     # Frontend Vite + React application
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── server/                     # Backend Express + TypeScript application
│   ├── prisma/
│   │   └── schema.prisma       # Database models and relations
│   ├── src/
│   │   ├── config/
│   │   │   ├── keyVault.ts     # Azure Key Vault client and getSecret helper
│   │   │   └── secrets.ts      # Secret loaders
│   │   ├── controllers/        # Request handling and business logic
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts # JWT verification & role authorization
│   │   ├── routes/             # Express API route declarations
│   │   ├── services/           # Groq AI & external API integrations
│   │   ├── utils/
│   │   │   └── campusSchedule.ts  # Nager.Date holiday checker with fallback
│   │   ├── prisma.ts           # Prisma client instance
│   │   └── server.ts           # Express application entrypoint
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml          # Container configuration (Backend, DB, Reverse Proxy)
└── README.md



---


