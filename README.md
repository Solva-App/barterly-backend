# Barterly Backend API

A robust, production-ready TypeScript/Express/Sequelize backend for **Barterly**—a peer-to-peer item swapping platform. Built with secure stateless dual-token authentication, real-time WebSockets, transactional emails, and cloud file storage.

---

## Tech Stack

* **Runtime:** Node.js (TypeScript)
* **Framework:** Express.js
* **Database & ORM:** PostgreSQL / MySQL via Sequelize ORM
* **Authentication:** Stateless Dual-Token Auth (Short-lived in-memory Access Token + `HttpOnly`, `Secure`, `SameSite=Strict` Refresh Token cookie) using `jose`
* **Real-time:** Socket.io (Dual-room broadcasting for chat threads and user notifications)
* **Email Service:** Resend + MJML (Compiled transactional templates)
* **File Storage:** Firebase Cloud Storage
* **Security:** `express-rate-limit` (Production-only enforcement), CORS, Helmet

---

##  Core Architecture & Modules

```text
src/
├── config/        # Database, Firebase, and Socket.io setup
├── controllers/   # Business logic (Auth, Chats, Listings, Users)
├── middleware/    # Auth protection, validation, and error handlers
├── models/        # Sequelize models (User, Listing, Chat, Message, Dispute)
├── utils/         # JWT helpers, MJML email dispatchers, Cloud storage, catchAsync
└── validators/    # Zod/Joi request validation schemas
```

---

## ️ Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/barterly-backend.git
cd barterly-backend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory based on the .env.example


### 3. Run Database Migrations & Seeding (Dev Only)
```bash
# Seed development database with test users and listings
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

---

##  Authentication Flow (Dual-Token Architecture)

1. **Login (`POST /api/v1/auth/login`)**:
   * Returns a short-lived JSON **Access Token** (stored in frontend memory/state).
   * Sets an `HttpOnly`, `Secure`, `SameSite=Strict` **Refresh Token** cookie on the browser automatically.
2. **Protected Requests**:
   * Frontend attaches the Access Token as `Authorization: Bearer <accessToken>`.
3. **Silent Refresh (`POST /api/v1/auth/refresh`)**:
   * When the access token expires, the frontend calls `/refresh`. The browser automatically sends the `HttpOnly` refresh cookie, and the server issues a fresh access token seamlessly.

---

##  Real-Time Socket.io Events

Connect to the Socket.io server with your access token in the `auth` payload:
```javascript
const socket = io("http://localhost:5000", {
  auth: { token: "<access_token>" },
  withCredentials: true
});
```

* **Client Emits:**
  * `join_chat` — Payload: `chatId` (Joins room `chat:${id}`)
* **Server Emits:**
  * `new_message` — Broadcasts incoming messages to room `chat:${id}`
  * `chat_notification` — Broadcasts unread alerts to room `user:${recipientId}`
  * `swap_completed` — Notifies room participants when a trade is finalized
  * `swap_disputed` — Notifies room participants when a dispute is raised