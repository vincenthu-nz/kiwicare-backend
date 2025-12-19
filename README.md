# KiwiCare – Backend API (NestJS)

A production-ready backend API built with NestJS for the KiwiCare platform.  
This project recreates core server-side features from a commercial app, adapted and open-sourced here.

---

## ✨ Features

- Modular and maintainable NestJS project structure
- RESTful API design
- User authentication and role-based access control
- Invoice management
- Order management
- AWS integration (e.g. S3)
- Mapbox geolocation support
- Email sending (Mailer module)

---

## 📂 Project Structure

```
kiwi-care-backend/
├── config/ # App configuration files
├── dist/ # Production build
├── docs/ # Documentation
├── node_modules/
├── src/
│ ├── auth/ # Authentication and auth guards
│ ├── aws/ # AWS S3 integrations
│ ├── category/ # Category module
│ ├── core/ # Core utilities
│ │ ├── enums/
│ │ ├── filter/
│ │ ├── interceptor/
│ │ ├── lib/
│ │ └── middleware/
│ ├── utils/ # Utility functions
│ ├── db/ # Database module and connections
│ ├── invoices/ # Invoice management
│ ├── mailer/ # Email sending
│ ├── mapbox/ # Mapbox geolocation support
│ ├── orders/ # Order management
│ ├── posts/ # Posts (if applicable)
│ ├── providers/ # Service providers
│ ├── tag/ # Tagging system
│ └── user/ # User management
```

---

## 📌 API Endpoints

### 🔐 Authentication

| Method | Endpoint             | Description                 |
|--------|----------------------|-----------------------------|
| POST   | `/auth/login/web`    | Web login (HttpOnly cookie) |
| POST   | `/auth/login/mobile` | Mobile login (JWT token)    |

---

### 👤 User

| Method | Endpoint         | Description                 |
|--------|------------------|-----------------------------|
| POST   | `/user/register` | Register a new user         |
| GET    | `/user`          | Get user list               |
| GET    | `/user/:id`      | Get user by ID              |
| PATCH  | `/user/:id`      | Update user by ID           |
| DELETE | `/user/:id`      | Delete user by ID           |
| PATCH  | `/user/me`       | Update current user profile |
| POST   | `/user/avatar`   | Upload user avatar          |

---

### 📝 Post

| Method | Endpoint              | Description            |
|--------|-----------------------|------------------------|
| POST   | `/post`               | Create a post          |
| GET    | `/post/list`          | Get post list          |
| GET    | `/post/:id`           | Get post by ID         |
| PUT    | `/post/:id`           | Update post            |
| DELETE | `/post/:id`           | Delete post            |
| GET    | `/post/archives`      | Get post archives      |
| GET    | `/post/archives/list` | Get archived post list |

---

### 🏷 Tag

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/tag`   | Create tag  |

---

### 📦 Upload

| Method | Endpoint  | Description |
|--------|-----------|-------------|
| POST   | `/upload` | Upload file |

---

### 🛒 Orders

| Method | Endpoint               | Description    |
|--------|------------------------|----------------|
| POST   | `/orders`              | Create order   |
| PATCH  | `/orders/:id/accept`   | Accept order   |
| PATCH  | `/orders/:id/cancel`   | Cancel order   |
| PATCH  | `/orders/:id/complete` | Complete order |
| PATCH  | `/orders/:id/reject`   | Reject order   |
| POST   | `/orders/:id/review`   | Review order   |

---

### ⚙️ App

| Method | Endpoint | Description                |
|--------|----------|----------------------------|
| GET    | `/app`   | App health / base endpoint |

---

## 🚀 Deployment

This project is automatically deployed to **AWS EC2** using **GitHub Actions**.

### Deployment Flow

```text
git push (main branch)
        ↓
GitHub Actions (CI/CD)
        ↓
SSH into EC2 instance
        ↓
Pull latest code
        ↓
Install dependencies & build
        ↓
Restart backend service
```

---

### Environment

* **Cloud Provider**: AWS
* **Compute**: EC2
* **Process Manager**: PM2
* **Reverse Proxy**: Nginx
* **CI/CD**: GitHub Actions

---

### Automatic Deployment

* Every push to the `main` branch triggers a GitHub Actions workflow
* The workflow connects to the EC2 instance via SSH
* The backend service is automatically updated and restarted
* No manual deployment steps are required

This ensures a fast and reliable deployment process and keeps the production environment in sync with the main branch.

---

### API Access

The backend service is exposed via the EC2 public endpoint:

```text
Base URL: http://3.25.103.124
```

> In production, this can be replaced with a custom domain and HTTPS configuration.

---

### Notes

* Environment variables are managed on the server and are not committed to the repository
* Secrets (SSH keys, tokens) are stored securely using GitHub Actions Secrets
* The EC2 instance can be updated or rolled back by redeploying a specific commit

---
