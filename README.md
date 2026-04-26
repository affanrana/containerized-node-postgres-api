# 🚀 Containerized Node.js + PostgreSQL REST API

Production-style backend service built with **Node.js, Express, and PostgreSQL**, fully containerized using **Docker Compose** with a custom migration system.

---

## 📦 Tech Stack

* **Node.js (Express)** – REST API
* **PostgreSQL** – Relational database
* **Docker & Docker Compose** – Container orchestration
* **pg** – PostgreSQL client
* **Jest + Supertest** – Testing (configured)
* **Zod** – Validation (planned)
* **JWT / bcrypt** – Auth (planned)

---

## 🧠 Architecture Overview

This project follows a simple service architecture:

Client → API (Express) → PostgreSQL

* API runs in its own container
* Database runs in a separate container
* Containers communicate via Docker network
* Migrations are handled via a custom script

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/affanrana/containerized-node-postgres-api.git
cd containerized-node-postgres-api
```

---

### 2. Start the application

```bash
docker-compose up --build
```

This will:

* Start PostgreSQL
* Build and start the Node.js API
* Wait until the database is healthy before starting the API

---

### 3. Run migrations

```bash
docker-compose exec api npm run migrate
```

---

### 4. Access the API

```
http://localhost:13000
```

---

## 📂 Project Structure

```
.
├── server.js              # Express app entry point
├── db.js                  # PostgreSQL connection (pg Pool)
├── docker-compose.yaml    # Multi-container setup
├── Dockerfile             # API container build config
├── migrations/            # SQL migration files
│   └── 001_init.sql
├── scripts/
│   └── migrate.js         # Custom migration runner
├── package.json
└── test.rest              # API testing (REST client)
```

---

## 🗄️ Database & Migrations

Migrations are handled via a custom script:

```bash
npm run migrate
```

Features:

* Tracks applied migrations in `schema_migrations`
* Runs SQL files in order
* Uses transactions for safety
* Skips already applied migrations

---

## 🔌 API Endpoints

### GET `/`

Fetch all schools

**Response:**

```json
[
  {
    "id": 1,
    "name": "ABC School",
    "address": "Toronto"
  }
]
```

---

### POST `/`

Create a new school

**Request:**

```json
{
  "name": "ABC School",
  "location": "Toronto"
}
```

---

### GET `/setup`

Creates the `schools` table (development only)

---

## 🧪 Running Tests

```bash
npm test
```

---

## 🔐 Environment Variables

Example:

```
PORT=13000
DATABASE_URL=postgresql://user123:password123@db:5432/db123
JWT_SECRET=your_secret_here
```

> In production, store secrets securely (e.g., `.env`, vault, or cloud secrets manager)

---

## ⚠️ Notes

* This project is structured for scalability but is still evolving
* Authentication and validation layers are planned but not fully implemented
* `/setup` route is for development only (migrations should be used instead)

---

## 🚀 Future Improvements

* Add JWT authentication (login/register)
* Implement request validation with Zod
* Introduce service/repository architecture
* Add role-based access control
* Improve error handling and logging

---

## 📄 License

MIT License

---

## 👤 Author

Affan Rana
